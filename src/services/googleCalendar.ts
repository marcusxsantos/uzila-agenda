import type { GoogleCalendarListEntry, GoogleCalendarEvent } from '../types/calendar'

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

export async function fetchGoogleCalendars(providerToken: string): Promise<GoogleCalendarListEntry[]> {
  const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/users/me/calendarList`, {
    headers: {
      Authorization: `Bearer ${providerToken}`,
      Accept: 'application/json',
    },
  })

  if (response.status === 401) {
    throw new Error('Sessão expirada com o Google. Por favor, faça login novamente com o Gmail.')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `Erro ao buscar agendas do Google (${response.status})`)
  }

  const data = await response.json()
  const items = data.items || []

  // Normaliza e ordena: primeiro a agenda principal, depois as compartilhadas alfabeticamente
  return items.map((item: any): GoogleCalendarListEntry => ({
    id: item.id,
    summary: item.summaryOverride || item.summary || 'Agenda sem título',
    description: item.description,
    primary: !!item.primary,
    backgroundColor: item.backgroundColor || '#7c3aed',
    foregroundColor: item.foregroundColor || '#ffffff',
    accessRole: item.accessRole || 'reader',
    selected: item.selected ?? true,
    summaryOverride: item.summaryOverride,
    timeZone: item.timeZone,
  })).sort((a: GoogleCalendarListEntry, b: GoogleCalendarListEntry) => {
    if (a.primary) return -1
    if (b.primary) return 1
    return a.summary.localeCompare(b.summary)
  })
}

export async function fetchCalendarEvents(
  providerToken: string,
  calendar: GoogleCalendarListEntry,
  timeMin: Date,
  timeMax: Date
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendar.id)}/events?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${providerToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) return []
    const errorData = await response.json().catch(() => ({}))
    console.warn(`Erro ao carregar eventos da agenda "${calendar.summary}":`, errorData)
    return []
  }

  const data = await response.json()
  const items = data.items || []

  return items.map((item: any): GoogleCalendarEvent => {
    const isAllDay = !item.start?.dateTime && !!item.start?.date
    return {
      id: item.id,
      calendarId: calendar.id,
      calendarSummary: calendar.summary,
      calendarColor: calendar.backgroundColor,
      summary: item.summary || '(Sem título)',
      description: item.description,
      location: item.location,
      htmlLink: item.htmlLink,
      start: item.start || {},
      end: item.end || {},
      attendees: item.attendees,
      conferenceData: item.conferenceData,
      hangoutLink: item.hangoutLink || item.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri,
      status: item.status,
      created: item.created,
      updated: item.updated,
      isAllDay,
    }
  })
}
