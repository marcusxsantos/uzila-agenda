# 📅 Uzila Agenda — Google Calendar WebApp

Aplicação web desenvolvida para a **Uzila** que permite aos usuários visualizarem e gerenciarem de forma consolidada e fluida todas as suas agendas do **Google Calendar** (agenda pessoal principal e todas as agendas compartilhadas com a conta Gmail).

A identidade visual, paleta de cores e tipografia seguem estritamente as diretrizes de design do ecossistema Uzila (`d:\Projetos\Uzila\site`).

---

## 🚀 Principais Funcionalidades

1. **Login Exclusivo com Conta Google / Gmail via Supabase**:
   - Autenticação OAuth 2.0 segura gerenciada pelo Supabase.
   - Escopos automáticos do Google Calendar:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events.readonly`
   - Obtenção transparente do `provider_token` para consulta direta à Google Calendar v3 API.

2. **Gerenciador de Agendas Google (Múltipla Seleção)**:
   - Identificação automática da **Agenda Principal** do Gmail.
   - Listagem de todas as **Agendas Compartilhadas** (equipe, vendas, suporte, clientes) e **Outras Agendas** (feriados, etc.).
   - Checkboxes interativos com a cor original de cada agenda Google.
   - Ações rápidas: *Marcar todas*, *Desmarcar todas*, filtro por busca e persistência no `localStorage`.

3. **Modos de Visualização Completos**:
   - 📆 **Mês**: Visão mensal em grade com contagem e preview dos eventos.
   - 📅 **Semana**: Linha do tempo de 7 dias com posicionamento por horários e linha da hora atual.
   - 🗓️ **Dia**: Detalhamento hora a hora dos compromissos diários.
   - 📋 **Lista / Agenda**: Linha do tempo cronológica agrupada por data.

4. **Detalhamento do Evento & Google Meet**:
   - Modal com todas as informações do compromisso: horários, duração, convidados e seus status de confirmação.
   - Botão direto para entrar na chamada do **Google Meet**.
   - Links para Google Maps e abertura no Google Calendar oficial.

5. **Design System Oficial da Uzila**:
   - Cores: Roxo principal (`oklch(0.52 0.24 296)`), Azul secundário (`oklch(0.55 0.21 262)`), Rosa acento (`oklch(0.66 0.24 350)`).
   - Fonte: *Plus Jakarta Sans*.
   - Suporte completo a tema Claro / Escuro.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **@supabase/supabase-js**
- **date-fns** (com suporte e formatação em pt-BR)
- **lucide-react**

---

## ⚙️ Configuração do Supabase & Google Cloud

Para conectar com contas Google reais de produção:

1. **Google Cloud Console**:
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um projeto e ative a **Google Calendar API** em *APIs & Services > Library*.
   - Configure a tela de consentimento OAuth com os escopos `.../auth/calendar.readonly`.
   - Crie um **OAuth Client ID** do tipo *Web Application*.
   - Em *Authorized redirect URIs*, adicione a URL de callback do Supabase:
     ```
     https://<SEU_PROJETO_SUPABASE>.supabase.co/auth/v1/callback
     ```

2. **Supabase Dashboard**:
   - Acesse **Authentication > Providers > Google**.
   - Habilite o provedor e preencha o **Client ID** e **Client Secret** obtidos no Google Cloud.
   - Salve as alterações.

3. **Configuração de Variáveis de Ambiente no WebApp**:
   Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   E preencha:
   ```env
   VITE_SUPABASE_URL=https://ppnflgfqioluqycwxedr.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_anon_key_publica_aqui
   ```
   *(Você também pode configurar as chaves diretamente no app clicando no botão de engrenagem/configurações)*.

---

## 🏃 Como Rodar Localmente

Dentro da pasta `d:\Projetos\Uzila\app\web`:

```bash
# Instalar dependências (já realizado)
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```
