import React from 'react'
import {
  format,
  isToday,
  parseISO,
  differenceInMinutes
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GoogleCalendarEvent } from '../types/calendar'
import { Video, Clock, MapPin, Users, Calendar } from 'lucide-react'

interface CalendarViewDayProps {
  currentDate: Date
  events: GoogleCalendarEvent[]
  onSelectEvent: (event: GoogleCalendarEvent) => void
}

export const CalendarViewDay: React.FC<CalendarViewDayProps> = ({
  currentDate,
  events,
  onSelectEvent,
}) => {
  const dayKey = format(currentDate, 'yyyy-MM-dd')
  const today = isToday(currentDate)

  const dayEvents = events.filter((e) => {
    if (e.start.date) return e.start.date.startsWith(dayKey)
    if (e.start.dateTime) return e.start.dateTime.startsWith(dayKey)
    return false
  })

  const allDayEvents = dayEvents.filter((e) => e.isAllDay || (!e.start.dateTime && !!e.start.date))
  const timedEvents = dayEvents
    .filter((e) => !!e.start.dateTime)
    .sort((a, b) => (a.start.dateTime! > b.start.dateTime! ? 1 : -1))

  return (
    <div className="flex-1 flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      {/* Cabeçalho do Dia */}
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shadow-xs ${
              today
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground'
            }`}
          >
            {format(currentDate, 'd')}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {dayEvents.length} compromissos agendados para este dia
            </p>
          </div>
        </div>

        {today && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            Hoje
          </span>
        )}
      </div>

      {/* Faixa de Eventos de Dia Todo */}
      {allDayEvents.length > 0 && (
        <div className="p-3 border-b border-border bg-secondary/20 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Dia inteiro:</span>
          {allDayEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="px-3 py-1 rounded-xl text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: evt.calendarColor || '#7c3aed' }}
            >
              {evt.summary} ({evt.calendarSummary})
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo com Scroll da Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {timedEvents.length === 0 && allDayEvents.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
            <Calendar className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold">Nenhum evento neste dia</p>
            <p className="text-xs">Sua agenda está livre para esta data.</p>
          </div>
        ) : (
          timedEvents.map((evt) => {
            const start = parseISO(evt.start.dateTime!)
            const end = parseISO(evt.end.dateTime!)
            const minutes = differenceInMinutes(end, start)
            const durationStr = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ''}` : `${minutes} min`

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="group p-4 rounded-2xl border border-border/80 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer shadow-xs relative overflow-hidden"
              >
                {/* Indicador de cor vertical lateral */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: evt.calendarColor || '#7c3aed' }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: evt.calendarColor || '#7c3aed' }}
                      />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {evt.calendarSummary}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {evt.summary}
                    </h4>

                    {evt.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  {/* Informações de Horário e Botões Rápidos */}
                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground px-2.5 py-1 rounded-lg bg-card border border-border">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{format(start, 'HH:mm')} – {format(end, 'HH:mm')}</span>
                      <span className="text-[10px] text-muted-foreground">({durationStr})</span>
                    </div>

                    {evt.hangoutLink && (
                      <a
                        href={evt.hangoutLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Google Meet</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Linha Inferior com Participantes e Local */}
                <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-4 text-xs text-muted-foreground pl-2">
                  {evt.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                      <span className="truncate max-w-xs">{evt.location}</span>
                    </div>
                  )}

                  {evt.attendees && evt.attendees.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-blue" />
                      <span>{evt.attendees.length} participante{evt.attendees.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
