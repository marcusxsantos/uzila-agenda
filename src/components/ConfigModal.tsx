import React, { useState } from 'react'
import {
  X,
  SlidersHorizontal,
  Check,
  BookOpen,
  Sparkles,
  RotateCcw
} from 'lucide-react'
import { getSupabaseCredentials, saveSupabaseCredentials, resetSupabaseClient } from '../lib/supabase'

interface ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  initialTab?: 'keys' | 'guide'
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSaved, initialTab = 'keys' }) => {
  const [url, setUrl] = useState(() => getSupabaseCredentials().url)
  const [anonKey, setAnonKey] = useState(() => getSupabaseCredentials().anonKey)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'keys' | 'guide'>(initialTab)

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveSupabaseCredentials(url, anonKey)
    resetSupabaseClient()
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onSaved()
      onClose()
    }, 1000)
  }

  const handleReset = () => {
    setUrl('https://ppnflgfqioluqycwxedr.supabase.co')
    setAnonKey('')
    saveSupabaseCredentials('https://ppnflgfqioluqycwxedr.supabase.co', '')
    resetSupabaseClient()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Configurações de Integração</h3>
              <p className="text-xs text-muted-foreground">Supabase & Google Calendar OAuth</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border bg-secondary/30 px-5 pt-2">
          <button
            onClick={() => setActiveTab('keys')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'keys'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Credenciais Supabase
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Passo a Passo de Configuração</span>
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'keys' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  URL do Supabase Project
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 text-xs bg-secondary/40 border border-border focus:border-primary rounded-xl outline-none transition-all font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  URL do projeto Supabase (já pré-preenchida com o ambiente Uzila).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Supabase Anon Public Key</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Project Settings &gt; API</span>
                </label>
                <textarea
                  rows={3}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 text-xs bg-secondary/40 border border-border focus:border-primary rounded-xl outline-none transition-all font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  A chave pública (anon/public) usada pelo cliente frontend para gerenciar a sessão e autenticação Google.
                </p>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Configurações salvas com sucesso! Recarregando...</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground p-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar padrões</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                >
                  Salvar Credenciais
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs text-foreground leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1.5">
                <h4 className="font-bold text-primary flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4" />
                  Como habilitar a integração Google + Supabase
                </h4>
                <p className="text-muted-foreground text-[11px]">
                  O Supabase gerencia o fluxo OAuth do Google e devolve o <code>provider_token</code> que nosso webapp usa para ler as agendas do usuário.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl border border-border bg-secondary/20 space-y-1">
                  <h5 className="font-bold text-foreground">1. Obter credenciais no Google Cloud Console</h5>
                  <p className="text-muted-foreground text-[11px]">
                    Acesse o Google Cloud Console, crie ou selecione um projeto e ative a <strong>Google Calendar API</strong> no menu <em>APIs & Services</em>.
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-border bg-secondary/20 space-y-1">
                  <h5 className="font-bold text-foreground">2. Configurar a Tela de Consentimento (OAuth Consent Screen)</h5>
                  <p className="text-muted-foreground text-[11px]">
                    Adicione os escopos:
                    <br />
                    <code>https://www.googleapis.com/auth/calendar.readonly</code>
                    <br />
                    <code>https://www.googleapis.com/auth/calendar.events.readonly</code>
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-border bg-secondary/20 space-y-1">
                  <h5 className="font-bold text-foreground">3. Configurar Credenciais OAuth no Google</h5>
                  <p className="text-muted-foreground text-[11px]">
                    Crie um <em>OAuth Client ID</em> do tipo <strong>Web Application</strong>.
                    <br />
                    No campo <strong>Authorized redirect URIs</strong>, insira a URL de callback do seu projeto Supabase:
                    <br />
                    <code className="text-primary font-mono select-all">
                      {url ? `${url}/auth/v1/callback` : 'https://<seu-projeto>.supabase.co/auth/v1/callback'}
                    </code>
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-border bg-secondary/20 space-y-1">
                  <h5 className="font-bold text-foreground">4. Ativar o Provedor Google no Supabase</h5>
                  <p className="text-muted-foreground text-[11px]">
                    No painel do Supabase, vá em <strong>Authentication &gt; Providers &gt; Google</strong>, marque como habilitado, cole o <strong>Client ID</strong> e o <strong>Client Secret</strong> gerados no passo 3 e salve.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
