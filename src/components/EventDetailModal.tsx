import React from 'react'
import {
  X,
  Clock,
  MapPin,
  Video,
  Users,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock3,
  AlignLeft
} from 'lucide-react'
import type { GoogleCalendarEvent } from '../types/calendar'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventDetailModalProps {
  event: GoogleCalendarEvent | null
  onClose: () => void
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null

  const isAllDay = event.isAllDay || (!event.start.dateTime && !!event.start.date)

  let formattedDateRange = ''
  let durationStr = ''

  if (isAllDay && event.start.date) {
    const startDate = parseISO(event.start.date)
    formattedDateRange = format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
    durationStr = 'Dia inteiro'
  } else if (event.start.dateTime && event.end.dateTime) {
    const start = parseISO(event.start.dateTime)
    const end = parseISO(event.end.dateTime)
    formattedDateRange = `${format(start, "EEEE, d 'de' MMMM", { locale: ptBR })} · ${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`
    
    const minutes = differenceInMinutes(end, start)
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remMin = minutes % 60
      durationStr = remMin > 0 ? `${hours}h ${remMin}min` : `${hours}h`
    } else {
      durationStr = `${minutes} min`
    }
  }

  // Capitaliza a primeira letra do dia
  if (formattedDateRange) {
    formattedDateRange = formattedDateRange.charAt(0).toUpperCase() + formattedDateRange.slice(1)
  }

  const calendarColor = event.calendarColor || '#7c3aed'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Faixa Superior Colorida com a Cor da Agenda */}
        <div
          className="h-3 w-full shrink-0"
          style={{ backgroundColor: calendarColor }}
        />

        {/* Header do Modal */}
        <div className="p-5 pb-3 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: calendarColor }}
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {event.calendarSummary || 'Agenda Google'}
              </span>
              {isAllDay && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
                  Dia Inteiro
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              {event.summary}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-5 pt-1 overflow-y-auto space-y-4 text-sm text-foreground">
          {/* Data e Horário */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/60">
            <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-foreground">{formattedDateRange}</div>
              {durationStr && (
                <div className="text-xs text-muted-foreground mt-0.5">Duração: {durationStr}</div>
              )}
            </div>
          </div>

          {/* Botão de Google Meet (se houver link de videoconferência) */}
          {event.hangoutLink && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-primary text-sm">
                  <Video className="w-4 h-4" />
                  <span>Google Meet</span>
                </div>
                <span className="text-[11px] text-primary/80 font-medium">Reunião online</span>
              </div>
              
              <a
                href={event.hangoutLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <span>Entrar na videochamada</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Localização Física (se houver) */}
          {event.location && !event.hangoutLink?.includes(event.location) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-pink shrink-0 mt-1" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block">Local</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors hover:underline"
                >
                  {event.location}
                </a>
              </div>
            </div>
          )}

          {/* Descrição */}
          {event.description && (
            <div className="flex items-start gap-3 pt-2 border-t border-border/60">
              <AlignLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Descrição</span>
                <div
                  className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed break-words bg-secondary/30 p-3 rounded-xl border border-border/50"
                  dangerouslySetInnerHTML={{
                    __html: event.description.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline font-medium">$1</a>'),
                  }}
                />
              </div>
            </div>
          )}

          {/* Participantes / Convidados */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-start gap-3 pt-2 border-t border-border/60">
              <Users className="w-4 h-4 text-brand-blue shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Participantes ({event.attendees.length})
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {event.attendees.map((attendee, index) => {
                    let statusIcon = <Clock3 className="w-3.5 h-3.5 text-muted-foreground" />
                    let statusLabel = 'Pendente'

                    if (attendee.responseStatus === 'accepted') {
                      statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      statusLabel = 'Confirmado'
                    } else if (attendee.responseStatus === 'declined') {
                      statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      statusLabel = 'Recusado'
                    } else if (attendee.responseStatus === 'tentative') {
                      statusIcon = <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      statusLabel = 'Talvez'
                    }

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-secondary/20 hover:bg-secondary/40 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                            {(attendee.displayName || attendee.email).charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate text-foreground font-medium">
                            {attendee.displayName || attendee.email}
                          </span>
                          {attendee.organizer && (
                            <span className="text-[9px] font-semibold text-primary px-1.5 py-0.2 bg-primary/10 rounded-sm">
                              Organizador
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2" title={statusLabel}>
                          {statusIcon}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Links de Ação */}
        <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-between gap-2">
          {event.htmlLink ? (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <span>Abrir no Google Calendar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
