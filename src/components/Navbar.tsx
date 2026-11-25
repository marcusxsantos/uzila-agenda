import React from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  LogOut,
  Menu,
  SlidersHorizontal,
  LayoutGrid,
  Columns,
  Square,
  ListFilter,
  Sparkles
} from 'lucide-react'
import type { CalendarViewMode, UserProfile } from '../types/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NavbarProps {
  currentDate: Date
  viewMode: CalendarViewMode
  onViewModeChange: (mode: CalendarViewMode) => void
  onPrevDate: () => void
  onNextDate: () => void
  onToday: () => void
  onRefresh: () => void
  isLoading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  user: UserProfile | null
  onSignOut: () => void
  onToggleSidebar: () => void
  onOpenConfig: () => void
  activeCalendarsCount: number
  totalCalendarsCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevDate,
  onNextDate,
  onToday,
  onRefresh,
  isLoading,
  searchQuery,
  onSearchChange,
  user,
  onSignOut,
  onToggleSidebar,
  onOpenConfig,
  activeCalendarsCount,
  totalCalendarsCount,
}) => {
  const formattedDate = React.useMemo(() => {
    if (viewMode === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
    return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
  }, [currentDate, viewMode])

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Lado Esquerdo: Botão Mobile Sidebar + Marca Uzila */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Abrir seleção de agendas"
            aria-label="Abrir seleção de agendas"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 select-none">
            <div className="relative flex items-center justify-center">
              <img
                src="/uzila-logo.png"
                alt="Uzila"
                className="h-8 w-auto object-contain drop-shadow-sm"
                onError={(e) => {
                  // Fallback para caso a imagem do logo não carregue
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-pink via-primary to-brand-blue bg-clip-text text-transparent">
                Uzila
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </div>
          </div>
        </div>

        {/* Centro: Controles de Navegação de Data */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-border bg-card hover:bg-secondary text-foreground hover:border-primary/40 transition-all shadow-xs"
          >
            Hoje
          </button>

          <div className="flex items-center bg-card border border-border rounded-xl shadow-xs p-0.5">
            <button
              onClick={onPrevDate}
              className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Período anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onNextDate}
              className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Próximo período"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground tracking-tight ml-1 sm:ml-2 min-w-[130px] sm:min-w-[190px]">
            {capitalizedDate}
          </h2>
        </div>

        {/* Lado Direito: Modos de visualização, Busca, Sincronização & Perfil */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Campo de Busca Rápida (Desktop) */}
          <div className="hidden xl:flex items-center relative w-48 2xl:w-60">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar evento..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/60 hover:bg-secondary focus:bg-background border border-border focus:border-primary rounded-xl outline-none transition-all"
            />
          </div>

          {/* Alternador de Modo de Visualização */}
          <div className="hidden md:flex items-center bg-secondary/80 p-1 rounded-xl border border-border text-xs font-medium">
            <button
              onClick={() => onViewModeChange('month')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-card text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Mês</span>
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-card text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Semana</span>
            </button>
            <button
              onClick={() => onViewModeChange('day')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-card text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Dia</span>
            </button>
            <button
              onClick={() => onViewModeChange('agenda')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'agenda'
                  ? 'bg-card text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Botão de Atualizar / Sincronizar com Google Calendar */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shadow-xs ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Sincronizar com o Google Calendar"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>

          {/* Botão de Configurações */}
          <button
            onClick={onOpenConfig}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shadow-xs"
            title="Configurações e Integração Supabase"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Link para os Planos da Uzila */}
          <a
            href="https://uzila.com.br/#planos"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all text-xs font-semibold shadow-xs"
            title="Conheça os planos da Uzila"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planos</span>
          </a>

          {/* Perfil do Usuário Gmail / Google */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-primary/30 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                title="Sair da conta Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-barra mobile para alternar Mês/Semana/Dia/Lista e busca */}
      <div className="flex md:hidden items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60">
        <div className="flex items-center bg-secondary/80 p-0.5 rounded-lg border border-border text-[11px] font-medium w-full justify-around">
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'month' ? 'bg-card text-primary font-semibold shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'week' ? 'bg-card text-primary font-semibold shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onViewModeChange('day')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'day' ? 'bg-card text-primary font-semibold shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => onViewModeChange('agenda')}
            className={`px-2 py-1 rounded-md transition-all ${
              viewMode === 'agenda' ? 'bg-card text-primary font-semibold shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Lista
          </button>
        </div>

        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-primary/10 text-primary font-medium border border-primary/20 shrink-0"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{activeCalendarsCount}/{totalCalendarsCount}</span>
        </button>
      </div>
    </header>
  )
}
