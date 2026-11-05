import React from 'react'
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GoogleCalendarEvent } from '../types/calendar'
import { Video, Clock, MapPin, Calendar } from 'lucide-react'

interface CalendarViewAgendaProps {
  events: GoogleCalendarEvent[]
  onSelectEvent: (event: GoogleCalendarEvent) => void
}

export const CalendarViewAgenda: React.FC<CalendarViewAgendaProps> = ({
  events,
  onSelectEvent,
}) => {
  // Agrupa eventos por data
  const groupedEvents = React.useMemo(() => {
    const map = new Map<string, GoogleCalendarEvent[]>()

    // Ordena todos os eventos por data de início
    const sorted = [...events].sort((a, b) => {
      const aTime = a.start.dateTime || a.start.date || ''
      const bTime = b.start.dateTime || b.start.date || ''
      return aTime.localeCompare(bTime)
    })

    sorted.forEach((evt) => {
      let dateKey = ''
      if (evt.start.dateTime) {
        dateKey = evt.start.dateTime.substring(0, 10)
      } else if (evt.start.date) {
        dateKey = evt.start.date.substring(0, 10)
      }

      if (dateKey) {
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(evt)
      }
    })

    return Array.from(map.entries())
  }, [events])

  if (groupedEvents.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <h4 className="text-base font-bold text-foreground">Nenhum evento encontrado</h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Não há compromissos para o período selecionado ou com os filtros ativos. Tente selecionar mais agendas na barra lateral.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Lista de Próximos Compromissos</h3>
        <span className="text-xs text-muted-foreground">{events.length} eventos no total</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {groupedEvents.map(([dateKey, dayEvents]) => {
          const parsedDate = parseISO(dateKey)
          let dateTitle = format(parsedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
          dateTitle = dateTitle.charAt(0).toUpperCase() + dateTitle.slice(1)

          const today = isToday(parsedDate)
          const tomorrow = isTomorrow(parsedDate)
          const yesterday = isYesterday(parsedDate)

          return (
            <div key={dateKey} className="space-y-2.5">
              {/* Header do dia */}
              <div className="flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-xs py-1 z-10">
                <span className="text-xs font-bold text-foreground">{dateTitle}</span>
                {today && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                    Hoje
                  </span>
                )}
                {tomorrow && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue/15 text-brand-blue">
                    Amanhã
                  </span>
                )}
                {yesterday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">
                    Ontem
                  </span>
                )}
                <div className="flex-1 h-px bg-border/80" />
              </div>

              {/* Lista de eventos do dia */}
              <div className="grid gap-2">
                {dayEvents.map((evt) => {
                  const isAllDay = evt.isAllDay || (!evt.start.dateTime && !!evt.start.date)
                  let timeStr = 'Dia inteiro'
                  if (!isAllDay && evt.start.dateTime && evt.end.dateTime) {
                    const start = parseISO(evt.start.dateTime)
                    const end = parseISO(evt.end.dateTime)
                    timeStr = `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`
                  }

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer shadow-xs relative overflow-hidden"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: evt.calendarColor || '#7c3aed' }}
                      />

                      <div className="flex items-start gap-3 pl-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: evt.calendarColor || '#7c3aed' }}
                            />
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {evt.calendarSummary}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {evt.summary}
                          </h5>

                          {evt.location && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="w-3 h-3 text-brand-pink shrink-0" />
                              <span className="truncate max-w-xs">{evt.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2 sm:pl-0 shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{timeStr}</span>
                        </div>

                        {evt.hangoutLink && (
                          <a
                            href={evt.hangoutLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            title="Entrar com Google Meet"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
