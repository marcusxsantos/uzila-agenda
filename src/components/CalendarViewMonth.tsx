import React from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  parseISO
} from 'date-fns'
import type { GoogleCalendarEvent } from '../types/calendar'
import { Video } from 'lucide-react'

interface CalendarViewMonthProps {
  currentDate: Date
  events: GoogleCalendarEvent[]
  onSelectEvent: (event: GoogleCalendarEvent) => void
  onSelectDay: (day: Date) => void
}

export const CalendarViewMonth: React.FC<CalendarViewMonthProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onSelectDay,
}) => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Agrupa eventos por data YYYY-MM-DD
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, GoogleCalendarEvent[]>()

    events.forEach((evt) => {
      let dateKey = ''
      if (evt.start.date) {
        dateKey = evt.start.date.substring(0, 10)
      } else if (evt.start.dateTime) {
        dateKey = evt.start.dateTime.substring(0, 10)
      }

      if (dateKey) {
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(evt)
      }
    })

    return map
  }, [events])

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="flex-1 flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-border bg-secondary/40 text-center py-2.5 text-xs font-semibold text-muted-foreground select-none">
        {weekDayNames.map((d, i) => (
          <div key={d} className={i === 0 || i === 6 ? 'text-muted-foreground/70' : 'text-foreground'}>
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias do mês */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6 divide-x divide-y divide-border/60">
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDate.get(dayKey) || []
          const inCurrentMonth = isSameMonth(day, monthStart)
          const today = isToday(day)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={`min-h-[75px] sm:min-h-[105px] p-1 sm:p-2 flex flex-col transition-colors cursor-pointer group ${
                inCurrentMonth ? 'bg-card' : 'bg-secondary/20 opacity-50'
              } hover:bg-secondary/40`}
            >
              {/* Número do dia */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs sm:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                    today
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : inCurrentMonth
                      ? 'text-foreground group-hover:text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                    {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                  </span>
                )}
              </div>

              {/* Lista compacta de eventos no dia */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayEvents.slice(0, 3).map((evt) => {
                  const hasVideo = !!evt.hangoutLink
                  const timeFormatted = evt.start.dateTime
                    ? format(parseISO(evt.start.dateTime), 'HH:mm')
                    : ''

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent(evt)
                      }}
                      className="px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium truncate flex items-center gap-1 transition-all hover:scale-[1.02] shadow-2xs cursor-pointer text-white"
                      style={{
                        backgroundColor: evt.calendarColor || '#7c3aed',
                      }}
                      title={`${evt.summary} (${evt.calendarSummary})`}
                    >
                      {hasVideo && <Video className="w-2.5 h-2.5 shrink-0 opacity-90" />}
                      {timeFormatted && <span className="opacity-85 text-[9px]">{timeFormatted}</span>}
                      <span className="truncate">{evt.summary}</span>
                    </div>
                  )
                })}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] font-semibold text-primary px-1 hover:underline">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
