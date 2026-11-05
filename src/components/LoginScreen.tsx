import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
  HelpCircle,
  AlertCircle
} from 'lucide-react'

interface LoginScreenProps {
  onSignInWithGoogle: () => Promise<any>
  onOpenConfig: () => void
  isSupabaseConfigured: boolean
  errorMessage?: string | null
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignInWithGoogle,
  onOpenConfig,
  isSupabaseConfigured,
  errorMessage,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true)
      setLoginError(null)
      await onSignInWithGoogle()
    } catch (err: any) {
      console.error(err)
      setLoginError(err.message || 'Erro ao iniciar autenticação com o Google.')
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Luzes de fundo com o degradê Uzila */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-pink/20 via-primary/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-brand-blue/20 via-primary/20 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Cartão Central */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
          {/* Faixa decorativa superior com degradê Uzila */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-pink via-primary to-brand-blue" />

          {/* Logo e Cabeçalho */}
          <div className="flex flex-col items-center text-center space-y-3.5 pt-2">
            {/* Logo Uzila Centralizado */}
            <div className="flex items-center justify-center gap-2.5">
              <img
                src="/uzila-logo.png"
                alt="Uzila"
                className="h-11 w-auto object-contain drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-pink via-primary to-brand-blue bg-clip-text text-transparent">
                Uzila
              </span>
            </div>

            {/* Badge Centralizado em Linha Própria */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shadow-2xs">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Google Calendar Hub</span>
              </span>
            </div>

            {/* Título e Subtítulo */}
            <div className="space-y-1.5 pt-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
                Acesse e organize suas agendas Google
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Faça login exclusivamente com sua conta Gmail para visualizar sua agenda pessoal e todas as agendas compartilhadas com você em um painel unificado.
              </p>
            </div>
          </div>

          {/* Mensagem de Erro (se houver) */}
          {(errorMessage || loginError) && (
            (() => {
              const currentErr = errorMessage || loginError || ''
              const isProviderDisabled =
                currentErr.toLowerCase().includes('provider is not enabled') ||
                currentErr.toLowerCase().includes('unsupported provider') ||
                currentErr.toLowerCase().includes('provedor google')

              if (isProviderDisabled) {
                return (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-2.5 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-bold text-sm block">Google Provider não habilitado no Supabase</span>
                        <p className="mt-1 leading-relaxed text-foreground/80">
                          O Supabase bloqueou o login porque o provedor <strong>Google</strong> ainda não está ativo no painel do seu projeto.
                        </p>
                      </div>
                    </div>

                    <div className="bg-background/80 p-3 rounded-xl border border-border/60 text-[11px] space-y-1.5 text-foreground">
                      <div className="font-semibold text-primary">Como resolver em 3 passos:</div>
                      <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                        <li>Acesse o painel do Supabase &gt; <strong>Authentication &gt; Providers &gt; Google</strong></li>
                        <li>Marque o toggle como <strong>Enabled</strong></li>
                        <li>Cole o <strong>Client ID</strong> e <strong>Client Secret</strong> gerados no Google Cloud Console e clique em <strong>Save</strong></li>
                      </ol>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={onOpenConfig}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-[11px] flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Ver instruções completas</span>
                      </button>

                      <a
                        href="https://supabase.com/dashboard/project/ppnflgfqioluqycwxedr/auth/providers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-colors text-[11px] flex items-center gap-1"
                      >
                        <span>Abrir Painel do Supabase</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )
              }

              return (
                <div className="mt-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Atenção</span>
                    <span>{currentErr}</span>
                  </div>
                </div>
              )
            })()
          )}

          {/* Aviso se Supabase não tiver anon key configurada */}
          {!isSupabaseConfigured && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Configuração do Supabase</span>
                <p className="text-[11px] leading-relaxed">
                  Para autenticar com o Google via OAuth, configure a <code>VITE_SUPABASE_ANON_KEY</code> nas configurações.
                </p>
                <button
                  onClick={onOpenConfig}
                  className="font-bold underline hover:opacity-80 transition-opacity text-[11px] inline-flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3" /> Configurar chaves agora
                </button>
              </div>
            </div>
          )}

          {/* Botão de Login Exclusivo com Google */}
          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn || !isSupabaseConfigured}
              className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all shadow-md group ${
                isSupabaseConfigured
                  ? 'bg-card border-2 border-border hover:border-primary text-foreground hover:bg-secondary/50 hover:shadow-lg cursor-pointer'
                  : 'bg-secondary text-muted-foreground border border-border cursor-not-allowed opacity-75'
              }`}
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="group-hover:text-primary transition-colors">
                {isLoggingIn ? 'Conectando ao Google...' : 'Entrar com Google (Gmail)'}
              </span>
            </button>
          </div>

          {/* Benefícios e Recursos */}
          <div className="mt-6 pt-6 border-t border-border/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sua agenda principal do Gmail sincronizada</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Todas as agendas compartilhadas com você</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Filtragem seletiva por agenda e visualizações por Mês/Semana/Dia</span>
            </div>
          </div>
        </div>

        {/* Rodapé com Links de Configuração e Ajuda */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configurações Supabase</span>
          </button>

          <a
            href="https://uzila.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <span>Uzila Plataforma</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
