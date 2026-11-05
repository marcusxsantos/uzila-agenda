import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  Check,
  Search,
  Users,
  User,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  X
} from 'lucide-react'
import type { GoogleCalendarListEntry } from '../types/calendar'

interface SidebarCalendarsProps {
  calendars: GoogleCalendarListEntry[]
  selectedCalendarIds: string[]
  onToggleCalendar: (calendarId: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

export const SidebarCalendars: React.FC<SidebarCalendarsProps> = ({
  calendars,
  selectedCalendarIds,
  onToggleCalendar,
  onSelectAll,
  onDeselectAll,
  isOpen,
  onClose,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showShared, setShowShared] = useState(true)
  const [showOther, setShowOther] = useState(true)

  const filteredCalendars = calendars.filter((c) =>
    c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const primaryCalendar = filteredCalendars.find((c) => c.primary)
  const sharedCalendars = filteredCalendars.filter((c) => !c.primary && !c.id.includes('group.calendar.google.com'))
  const otherCalendars = filteredCalendars.filter((c) => !c.primary && c.id.includes('group.calendar.google.com'))

  const allSelected = calendars.length > 0 && calendars.every((c) => selectedCalendarIds.includes(c.id))
  const noneSelected = selectedCalendarIds.length === 0

  return (
    <>
      {/* Backdrop para Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-pink via-primary to-brand-blue flex items-center justify-center text-white shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Suas Agendas Google</h3>
              <p className="text-[11px] text-muted-foreground">
                {selectedCalendarIds.length} de {calendars.length} visíveis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Busca e Ações Rápidas */}
        <div className="p-3 border-b border-border/60 space-y-2 bg-secondary/30">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar agendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border focus:border-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px]">
            <button
              onClick={onSelectAll}
              disabled={allSelected || isLoading}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
            >
              <CheckSquare className="w-3.5 h-3.5 text-primary" />
              <span>Marcar todas</span>
            </button>

            <button
              onClick={onDeselectAll}
              disabled={noneSelected || isLoading}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Desmarcar todas</span>
            </button>
          </div>
        </div>

        {/* Lista de Agendas Rolável */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Carregando agendas do Google...</p>
            </div>
          ) : calendars.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground px-4">
              Nenhuma agenda encontrada. Verifique se sua conta Google possui permissões concedidas.
            </div>
          ) : (
            <>
              {/* Seção 1: Minha Agenda Principal */}
              {primaryCalendar && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <User className="w-3 h-3 text-primary" />
                    <span>Minha Agenda Principal</span>
                  </div>

                  <CalendarItemRow
                    calendar={primaryCalendar}
                    isSelected={selectedCalendarIds.includes(primaryCalendar.id)}
                    onToggle={() => onToggleCalendar(primaryCalendar.id)}
                  />
                </div>
              )}

              {/* Seção 2: Agendas Compartilhadas */}
              {sharedCalendars.length > 0 && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => setShowShared(!showShared)}
                    className="w-full flex items-center justify-between px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-brand-blue" />
                      <span>Compartilhadas ({sharedCalendars.length})</span>
                    </div>
                    {showShared ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {showShared && (
                    <div className="space-y-1">
                      {sharedCalendars.map((cal) => (
                        <CalendarItemRow
                          key={cal.id}
                          calendar={cal}
                          isSelected={selectedCalendarIds.includes(cal.id)}
                          onToggle={() => onToggleCalendar(cal.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Seção 3: Outras Agendas (Feriados, etc.) */}
              {otherCalendars.length > 0 && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => setShowOther(!showOther)}
                    className="w-full flex items-center justify-between px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-amber-500" />
                      <span>Outras ({otherCalendars.length})</span>
                    </div>
                    {showOther ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {showOther && (
                    <div className="space-y-1">
                      {otherCalendars.map((cal) => (
                        <CalendarItemRow
                          key={cal.id}
                          calendar={cal}
                          isSelected={selectedCalendarIds.includes(cal.id)}
                          onToggle={() => onToggleCalendar(cal.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé informativo do sistema Uzila */}
        <div className="p-3 border-t border-border/80 bg-secondary/20">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary/10 via-brand-blue/10 to-transparent border border-primary/20 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sincronização Ativa</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Marque ou desmarque qualquer agenda para filtrar em tempo real a grade do calendário.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

interface CalendarItemRowProps {
  calendar: GoogleCalendarListEntry
  isSelected: boolean
  onToggle: () => void
}

const CalendarItemRow: React.FC<CalendarItemRowProps> = ({ calendar, isSelected, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`group flex items-start gap-2.5 p-2 rounded-xl cursor-pointer border transition-all ${
        isSelected
          ? 'bg-card border-border hover:border-primary/40 shadow-xs'
          : 'bg-transparent border-transparent hover:bg-secondary/60 opacity-60 hover:opacity-90'
      }`}
    >
      {/* Checkbox customizado com a cor da própria agenda */}
      <div
        className="w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-all"
        style={{
          backgroundColor: isSelected ? calendar.backgroundColor : 'transparent',
          borderColor: calendar.backgroundColor,
        }}
      >
        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-medium truncate ${
              isSelected ? 'text-foreground font-semibold' : 'text-muted-foreground'
            }`}
            title={calendar.summary}
          >
            {calendar.summary}
          </span>
          {calendar.primary && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/15 text-primary shrink-0">
              Principal
            </span>
          )}
        </div>

        {calendar.description && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-snug">
            {calendar.description}
          </p>
        )}
      </div>
    </div>
  )
}
