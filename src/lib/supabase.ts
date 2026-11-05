import { createClient, SupabaseClient } from '@supabase/supabase-js'

const STORAGE_KEY_URL = 'uzila_supabase_url'
const STORAGE_KEY_KEY = 'uzila_supabase_anon_key'

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  const customUrl = localStorage.getItem(STORAGE_KEY_URL) || ''
  const customKey = localStorage.getItem(STORAGE_KEY_KEY) || ''

  return {
    url: customUrl || envUrl || 'https://ppnflgfqioluqycwxedr.supabase.co',
    anonKey: customKey || envKey || '',
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim())
  else localStorage.removeItem(STORAGE_KEY_URL)

  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim())
  else localStorage.removeItem(STORAGE_KEY_KEY)
}

let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials()

  if (!url || !anonKey || anonKey === 'placeholder_anon_key') {
    return null
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
        storageKey: 'uzila_supabase_auth_token',
      },
    })
  }

  return supabaseInstance
}

export function resetSupabaseClient() {
  supabaseInstance = null
}

export async function signInWithGoogle() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase ainda não configurado com Anon Key.')
  }

  // Solicitamos permissão para ler agendas e eventos do Google Calendar
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: window.location.origin,
    },
  })

  if (error) {
    if (
      error.message?.toLowerCase().includes('provider is not enabled') ||
      error.message?.toLowerCase().includes('unsupported provider')
    ) {
      throw new Error(
        'O provedor Google não está ativado no seu Supabase. Acesse o Supabase Dashboard > Authentication > Providers > Google, ative o botão e insira o Client ID e Client Secret do Google Cloud Console.'
      )
    }
    throw error
  }

  return data
}

export async function signOut() {
  const client = getSupabaseClient()
  if (client) {
    await client.auth.signOut()
  }
  localStorage.removeItem('uzila_google_provider_token')
}
