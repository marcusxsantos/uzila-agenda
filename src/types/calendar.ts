export interface GoogleCalendarListEntry {
  id: string
  summary: string
  description?: string
  primary?: boolean
  backgroundColor: string
  foregroundColor: string
  accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader'
  selected?: boolean
  summaryOverride?: string
  timeZone?: string
}

export interface GoogleCalendarEventTime {
  dateTime?: string
  date?: string
  timeZone?: string
}

export interface GoogleCalendarAttendee {
  email: string
  displayName?: string
  self?: boolean
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  organizer?: boolean
}

export interface GoogleCalendarConferenceData {
  entryPoints?: Array<{
    entryPointType: 'video' | 'phone' | 'more'
    uri: string
    label?: string
  }>
  conferenceSolution?: {
    name: string
    iconUri?: string
  }
}

export interface GoogleCalendarEvent {
  id: string
  calendarId: string
  calendarSummary?: string
  calendarColor?: string
  summary: string
  description?: string
  location?: string
  htmlLink?: string
  start: GoogleCalendarEventTime
  end: GoogleCalendarEventTime
  attendees?: GoogleCalendarAttendee[]
  conferenceData?: GoogleCalendarConferenceData
  status?: 'confirmed' | 'tentative' | 'cancelled'
  hangoutLink?: string
  created?: string
  updated?: string
  isAllDay?: boolean
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  provider: 'google'
}
