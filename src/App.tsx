import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  GoogleCalendarListEntry,
  GoogleCalendarEvent,
  CalendarViewMode,
  UserProfile
} from './types/calendar'
import {
  getSupabaseClient,
  signInWithGoogle,
  signOut as supabaseSignOut,
  getSupabaseCredentials
} from './lib/supabase'
import {
  fetchGoogleCalendars,
  fetchCalendarEvents
} from './services/googleCalendar'
import { Navbar } from './components/Navbar'
import { SidebarCalendars } from './components/SidebarCalendars'
import { CalendarViewMonth } from './components/CalendarViewMonth'
import { CalendarViewWeek } from './components/CalendarViewWeek'
import { CalendarViewDay } from './components/CalendarViewDay'
import { CalendarViewAgenda } from './components/CalendarViewAgenda'
import { EventDetailModal } from './components/EventDetailModal'
import { LoginScreen } from './components/LoginScreen'
import { ConfigModal } from './components/ConfigModal'
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns'

const STORAGE_SELECTED_CALENDARS = 'uzila_selected_calendars'

function parseJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    console.warn('Erro ao decodificar JWT:', err)
    return null
  }
}

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [providerToken, setProviderToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const [calendars, setCalendars] = useState<GoogleCalendarListEntry[]>([])
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([])
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([])

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [searchQuery, setSearchQuery] = useState('')

  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  // Verifica se o Supabase está configurado com URL e Anon Key
  const isSupabaseConfigured = useMemo(() => {
    const creds = getSupabaseCredentials()
    return !!(creds.url && creds.anonKey && creds.anonKey !== 'placeholder_anon_key')
  }, [])

  // Inicializa a sessão do Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verifica se houve erro de OAuth retornado na URL
        const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash
        const hashParams = new URLSearchParams(hash)
        const searchParams = new URLSearchParams(window.location.search)

        const rawErrorDesc =
          hashParams.get('error_description') ||
          searchParams.get('error_description') ||
          hashParams.get('msg') ||
          searchParams.get('msg') ||
          hashParams.get('error') ||
          searchParams.get('error')

        if (rawErrorDesc) {
          const decoded = decodeURIComponent(rawErrorDesc.replace(/\+/g, ' '))
          if (decoded.toLowerCase().includes('provider is not enabled') || decoded.toLowerCase().includes('unsupported provider')) {
            setErrorMessage(
              'O provedor Google ainda não está ativado no Supabase (Authentication > Providers > Google). Ative o provedor e informe o Client ID e Secret do Google Cloud.'
            )
          } else {
            setErrorMessage(decoded)
          }
          // Limpa a URL para evitar reprocessar o erro
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        // 1. Extração direta de tokens da URL (Fluxo OAuth Implicit do Supabase)
        const hashAccessToken = hashParams.get('access_token')
        const hashRefreshToken = hashParams.get('refresh_token')
        const hashProviderToken = hashParams.get('provider_token')

        if (hashProviderToken) {
          localStorage.setItem('uzila_google_provider_token', hashProviderToken)
          setProviderToken(hashProviderToken)
        }

        if (hashAccessToken) {
          localStorage.setItem('uzila_supabase_access_token', hashAccessToken)

          // Decodifica o JWT diretamente para extrair perfil imediatamente
          const jwtPayload = parseJwtPayload(hashAccessToken)
          if (jwtPayload) {
            const meta = jwtPayload.user_metadata || {}
            const profile: UserProfile = {
              id: jwtPayload.sub || 'user',
              email: jwtPayload.email || meta.email || 'usuario@gmail.com',
              name: meta.full_name || meta.name || jwtPayload.email?.split('@')[0] || 'Usuário',
              avatarUrl: meta.avatar_url || meta.picture,
              provider: 'google',
            }
            setUser(profile)
            localStorage.setItem('uzila_saved_user', JSON.stringify(profile))
          }

          // Limpa a barra de endereços para não deixar tokens expostos
          window.history.replaceState({}, document.title, window.location.pathname)
        } else {
          // Se não há hash, tenta restaurar perfil salvo no localStorage
          const savedUserStr = localStorage.getItem('uzila_saved_user')
          const savedProviderToken = localStorage.getItem('uzila_google_provider_token')
          if (savedUserStr && savedProviderToken) {
            try {
              setUser(JSON.parse(savedUserStr))
              setProviderToken(savedProviderToken)
            } catch (e) {
              console.warn('Erro ao restaurar usuário salvo:', e)
            }
          }
        }

        const client = getSupabaseClient()
        if (!client) {
          setIsInitializing(false)
          return
        }

        // Se houver tokens novos no hash, sincroniza a sessão com o client Supabase
        if (hashAccessToken && hashRefreshToken) {
          try {
            await client.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            })
          } catch (e) {
            console.warn('Sincronização setSession Supabase:', e)
          }
        }

        // 2. Busca de sessão existente no storage
        const { data: { session } } = await client.auth.getSession()

        if (session) {
          const providerTokenFromSession = session.provider_token
          if (providerTokenFromSession) {
            localStorage.setItem('uzila_google_provider_token', providerTokenFromSession)
            setProviderToken(providerTokenFromSession)
          } else {
            const savedToken = localStorage.getItem('uzila_google_provider_token')
            if (savedToken) setProviderToken(savedToken)
          }

          const metadata = session.user.user_metadata || {}
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'usuario@gmail.com',
            name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Usuário',
            avatarUrl: metadata.avatar_url || metadata.picture,
            provider: 'google',
          }
          setUser(profile)
          localStorage.setItem('uzila_saved_user', JSON.stringify(profile))
        }

        // Ouvinte de mudanças no auth
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (event, session) => {
            if (session) {
              if (session.provider_token) {
                localStorage.setItem('uzila_google_provider_token', session.provider_token)
                setProviderToken(session.provider_token)
              }
              const metadata = session.user.user_metadata || {}
              const profile: UserProfile = {
                id: session.user.id,
                email: session.user.email || 'usuario@gmail.com',
                name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Usuário',
                avatarUrl: metadata.avatar_url || metadata.picture,
                provider: 'google',
              }
              setUser(profile)
              localStorage.setItem('uzila_saved_user', JSON.stringify(profile))
            } else if (event === 'SIGNED_OUT') {
              setUser(null)
              setProviderToken(null)
              localStorage.removeItem('uzila_saved_user')
              localStorage.removeItem('uzila_google_provider_token')
              localStorage.removeItem('uzila_supabase_access_token')
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (err: any) {
        console.error('Erro na inicialização de autenticação:', err)
      } finally {
        setIsInitializing(false)
      }
    }

    initAuth()
  }, [])

  // Carrega lista de agendas (Google Calendar List)
  const loadCalendars = useCallback(async () => {
    if (!user) return

    setIsLoadingCalendars(true)
    setErrorMessage(null)

    try {
      const token = providerToken || localStorage.getItem('uzila_google_provider_token')
      if (!token) {
        throw new Error('Token do Google não encontrado. Faça login novamente com o Gmail para conceder permissão de agenda.')
      }

      const fetchedCalendars = await fetchGoogleCalendars(token)
      setCalendars(fetchedCalendars)

      // Restaura seleção salva ou seleciona todas
      const saved = localStorage.getItem(STORAGE_SELECTED_CALENDARS)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setSelectedCalendarIds(parsed)
        } catch {
          setSelectedCalendarIds(fetchedCalendars.map((c) => c.id))
        }
      } else {
        setSelectedCalendarIds(fetchedCalendars.map((c) => c.id))
      }
    } catch (err: any) {
      console.error('Erro ao buscar agendas do Google:', err)
      setErrorMessage(err.message || 'Não foi possível carregar as agendas do Google.')
    } finally {
      setIsLoadingCalendars(false)
    }
  }, [user, providerToken])

  useEffect(() => {
    if (user) {
      loadCalendars()
    }
  }, [user, loadCalendars])

  // Salva no localStorage quando o usuário altera a seleção de agendas
  const handleToggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds((prev) => {
      const next = prev.includes(calendarId)
        ? prev.filter((id) => id !== calendarId)
        : [...prev, calendarId]
      localStorage.setItem(STORAGE_SELECTED_CALENDARS, JSON.stringify(next))
      return next
    })
  }

  const handleSelectAll = () => {
    const allIds = calendars.map((c) => c.id)
    setSelectedCalendarIds(allIds)
    localStorage.setItem(STORAGE_SELECTED_CALENDARS, JSON.stringify(allIds))
  }

  const handleDeselectAll = () => {
    setSelectedCalendarIds([])
    localStorage.setItem(STORAGE_SELECTED_CALENDARS, JSON.stringify([]))
  }

  // Carrega os eventos das agendas selecionadas para a janela de tempo atual
  const loadEvents = useCallback(async () => {
    if (!user || selectedCalendarIds.length === 0) {
      setEvents([])
      return
    }

    setIsLoadingEvents(true)

    // Calcula a janela de tempo necessária conforme o modo de visualização
    let timeMin: Date
    let timeMax: Date

    if (viewMode === 'month') {
      const mStart = startOfMonth(currentDate)
      const mEnd = endOfMonth(mStart)
      timeMin = startOfWeek(mStart, { weekStartsOn: 0 })
      timeMax = endOfWeek(mEnd, { weekStartsOn: 0 })
    } else if (viewMode === 'week') {
      timeMin = startOfWeek(currentDate, { weekStartsOn: 0 })
      timeMax = endOfWeek(currentDate, { weekStartsOn: 0 })
    } else if (viewMode === 'day') {
      timeMin = subDays(currentDate, 1)
      timeMax = addDays(currentDate, 1)
    } else {
      // Agenda / Lista: últimos 7 dias até próximos 60 dias
      timeMin = subDays(currentDate, 7)
      timeMax = addDays(currentDate, 60)
    }

    try {
      const token = providerToken || localStorage.getItem('uzila_google_provider_token')
      if (!token) return

      const activeCalendars = calendars.filter((c) => selectedCalendarIds.includes(c.id))

      // Busca eventos de todas as agendas selecionadas em paralelo
      const promises = activeCalendars.map((cal) =>
        fetchCalendarEvents(token, cal, timeMin, timeMax)
      )

      const results = await Promise.all(promises)
      const flatEvents = results.flat()
      setEvents(flatEvents)
    } catch (err: any) {
      console.error('Erro ao carregar eventos:', err)
    } finally {
      setIsLoadingEvents(false)
    }
  }, [user, selectedCalendarIds, calendars, currentDate, viewMode, providerToken])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Controles de Navegação de Data
  const handlePrevDate = () => {
    if (viewMode === 'month') setCurrentDate((d) => subMonths(d, 1))
    else if (viewMode === 'week') setCurrentDate((d) => subWeeks(d, 1))
    else setCurrentDate((d) => subDays(d, 1))
  }

  const handleNextDate = () => {
    if (viewMode === 'month') setCurrentDate((d) => addMonths(d, 1))
    else if (viewMode === 'week') setCurrentDate((d) => addWeeks(d, 1))
    else setCurrentDate((d) => addDays(d, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSignOut = async () => {
    await supabaseSignOut()
    setUser(null)
    setProviderToken(null)
    setCalendars([])
    setEvents([])
    localStorage.removeItem('uzila_saved_user')
    localStorage.removeItem('uzila_supabase_access_token')
    localStorage.removeItem('uzila_google_provider_token')
  }

  // Filtragem de eventos pela caixa de busca rápida
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events
    const q = searchQuery.toLowerCase()
    return events.filter(
      (e) =>
        e.summary.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.calendarSummary && e.calendarSummary.toLowerCase().includes(q)) ||
        (e.attendees && e.attendees.some((a) => (a.displayName || a.email).toLowerCase().includes(q)))
    )
  }, [events, searchQuery])

  // Tela de Carregamento inicial
  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-muted-foreground">Iniciando Uzila Agenda...</span>
        </div>
      </div>
    )
  }

  // Se o usuário não estiver autenticado, exibe a tela de login exclusiva do Google
  if (!user) {
    return (
      <>
        <LoginScreen
          onSignInWithGoogle={signInWithGoogle}
          onOpenConfig={() => setIsConfigOpen(true)}
          isSupabaseConfigured={isSupabaseConfigured}
          errorMessage={errorMessage}
        />
        <ConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onSaved={() => {
            // Recarrega agendas se configurado
          }}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <Navbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onRefresh={() => {
          loadCalendars()
          loadEvents()
        }}
        isLoading={isLoadingCalendars || isLoadingEvents}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        onSignOut={handleSignOut}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenConfig={() => setIsConfigOpen(true)}
        activeCalendarsCount={selectedCalendarIds.length}
        totalCalendarsCount={calendars.length}
      />

      {/* Main Content: Sidebar de Agendas + Área do Calendário */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-4 gap-3">
        {/* Barra lateral de seleção de agendas Google */}
        <SidebarCalendars
          calendars={calendars}
          selectedCalendarIds={selectedCalendarIds}
          onToggleCalendar={handleToggleCalendar}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isLoading={isLoadingCalendars}
        />

        {/* Visualização Ativa */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {viewMode === 'month' && (
            <CalendarViewMonth
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
              onSelectDay={(day) => {
                setCurrentDate(day)
                setViewMode('day')
              }}
            />
          )}

          {viewMode === 'week' && (
            <CalendarViewWeek
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {viewMode === 'day' && (
            <CalendarViewDay
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {viewMode === 'agenda' && (
            <CalendarViewAgenda
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </main>
      </div>

      {/* Modal de Detalhes do Evento */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Modal de Configurações */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={() => {
          loadCalendars()
        }}
      />
    </div>
  )
}

export default App
