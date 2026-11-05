import React from 'react'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  parseISO,
  differenceInMinutes,
  getHours,
  getMinutes
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GoogleCalendarEvent } from '../types/calendar'
import { Video } from 'lucide-react'

interface CalendarViewWeekProps {
  currentDate: Date
  events: GoogleCalendarEvent[]
  onSelectEvent: (event: GoogleCalendarEvent) => void
}

export const CalendarViewWeek: React.FC<CalendarViewWeekProps> = ({
  currentDate,
  events,
  onSelectEvent,
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Horários exibidos: das 07:00 às 22:00
  const startHour = 7
  const endHour = 22
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  // Separa eventos de dia inteiro e com hora marcada
  const allDayEvents = events.filter((e) => e.isAllDay || (!e.start.dateTime && !!e.start.date))
  const timedEvents = events.filter((e) => !!e.start.dateTime)

  return (
    <div className="flex-1 flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      {/* Cabeçalho da Semana: 7 colunas */}
      <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border bg-secondary/40 select-none">
        <div className="p-2 border-r border-border/60 text-[10px] text-muted-foreground text-center" />
        {days.map((day) => {
          const today = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className="p-2 text-center border-r border-border/60 last:border-r-0"
            >
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div
                className={`w-7 h-7 mx-auto mt-1 flex items-center justify-center rounded-full text-xs font-bold ${
                  today
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-foreground'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Faixa para Eventos de Dia Inteiro */}
      {allDayEvents.length > 0 && (
        <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border bg-secondary/20 p-1 text-[11px]">
          <div className="text-[10px] text-muted-foreground font-semibold text-center flex items-center justify-center">
            Dia todo
          </div>
          {days.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayAllDay = allDayEvents.filter((e) => e.start.date?.startsWith(dayKey))
            return (
              <div key={day.toISOString()} className="px-1 space-y-1">
                {dayAllDay.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white truncate cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: evt.calendarColor || '#7c3aed' }}
                  >
                    {evt.summary}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Grade com Scroll de Horários */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[50px_repeat(7,1fr)] min-h-[850px] relative">
          {/* Coluna de Horas */}
          <div className="border-r border-border/60 select-none">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-14 border-b border-border/40 text-[10px] text-muted-foreground text-center pt-1 font-medium"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* 7 Colunas para os dias da semana */}
          {days.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayEvents = timedEvents.filter(
              (e) => e.start.dateTime && e.start.dateTime.startsWith(dayKey)
            )

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-border/60 last:border-r-0"
              >
                {/* Linhas de fundo das horas */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-14 border-b border-border/30 hover:bg-secondary/15 transition-colors"
                  />
                ))}

                {/* Eventos posicionados */}
                {dayEvents.map((evt) => {
                  const start = parseISO(evt.start.dateTime!)
                  const end = parseISO(evt.end.dateTime!)
                  const startH = getHours(start)
                  const startM = getMinutes(start)
                  const durationM = Math.max(differenceInMinutes(end, start), 25)

                  // Se estiver dentro da janela visível
                  const offsetMinutes = (startH - startHour) * 60 + startM
                  const topPx = (offsetMinutes / 60) * 56 // 56px por hora (h-14)
                  const heightPx = (durationM / 60) * 56

                  if (startH < startHour - 1 || startH > endHour) return null

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="absolute left-1 right-1 rounded-xl p-1.5 text-white shadow-xs cursor-pointer hover:brightness-110 transition-all z-10 overflow-hidden flex flex-col justify-between"
                      style={{
                        top: `${Math.max(topPx, 2)}px`,
                        height: `${Math.max(heightPx, 32)}px`,
                        backgroundColor: evt.calendarColor || '#7c3aed',
                      }}
                      title={`${evt.summary} (${format(start, 'HH:mm')} - ${format(end, 'HH:mm')})`}
                    >
                      <div>
                        <div className="flex items-center gap-1 font-bold text-[11px] leading-tight truncate">
                          {evt.hangoutLink && <Video className="w-2.5 h-2.5 shrink-0" />}
                          <span className="truncate">{evt.summary}</span>
                        </div>
                        <div className="text-[9px] opacity-90 font-medium">
                          {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                        </div>
                      </div>

                      {heightPx > 45 && evt.calendarSummary && (
                        <div className="text-[8px] opacity-75 truncate">
                          {evt.calendarSummary}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
