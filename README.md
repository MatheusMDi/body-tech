# Body Tech — PWA de Monitoramento de Protocolo de Saúde

Sistema 24/7 de monitoramento do protocolo pessoal de saúde e performance. Notificações push automáticas, registro de refeições com flags, checklist diário e dashboard de compliance.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + PWA (vite-plugin-pwa) |
| Gráficos | Recharts |
| Backend | Node.js + Express + node-cron + web-push |
| Banco | Supabase (PostgreSQL + Auth + RLS) |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |

## Protocolo Configurado

- **Jejum 18:6** — janela alimentar 14h–20h
- **Proteína** meta: 160g/dia
- **Água** meta: 4L/dia
- **Treino CrossFit**: 18h todo dia
- **Caminhada em jejum**: 1x/semana
- Sem açúcar · Sem álcool

## Estrutura

```
body-tech/
├── frontend/          # React PWA
│   ├── src/
│   │   ├── components/   # FastingStatus, MealForm, DailyChecklist, etc.
│   │   ├── pages/        # Home, Log, Progress, Settings, Login
│   │   ├── hooks/        # useFasting, useMeals, useChecklist, usePush, useDashboard
│   │   ├── lib/          # constants, utils (fasting logic), supabase client
│   │   └── sw.js         # Service Worker (push + precache)
│   └── vite.config.js
├── backend/           # Express API + cron jobs
│   ├── src/
│   │   ├── routes/       # meals, push, dashboard, progress, checklist
│   │   ├── services/     # pushService, fastingService
│   │   ├── jobs/         # reminders.js, weeklyReport.js
│   │   └── config/       # supabase, constants
│   └── index.js
├── supabase/
│   └── migration.sql  # Schema completo + RLS policies
├── vercel.json        # Frontend deploy config
└── render.yaml        # Backend deploy config
```

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute `supabase/migration.sql` no SQL Editor
3. Ative **Email Magic Link** em Authentication → Providers → Email
4. Copie a `anon key` e a `service_role key`

### 2. VAPID Keys

```bash
# Instale web-push globalmente
npm install -g web-push

# Gere as chaves
web-push generate-vapid-keys
```

### 3. Frontend (Vercel)

1. Fork/clone este repositório no GitHub
2. Importe no Vercel com `vercel.json` na raiz
3. Configure as variáveis de ambiente:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_BACKEND_URL=https://your-backend.onrender.com
```

### 4. Backend (Render)

1. Crie um **Web Service** no Render apontando para `/backend`
2. Configure as variáveis de ambiente (veja `backend/.env.example`):

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=admin@yourdomain.com
FRONTEND_URL=https://your-app.vercel.app
TZ=America/Sao_Paulo
```

### 5. Desenvolvimento Local

```bash
# Frontend
cd frontend
npm install
cp .env.example .env.local  # preencha as vars
npm run dev

# Backend
cd backend
npm install
cp .env.example .env        # preencha as vars
npm run dev
```

## Funcionalidades

### Fase 1 — Core
- ✅ Auth via Magic Link (Supabase)
- ✅ Estado de jejum 24/7 com countdown e barra de progresso
- ✅ Registro de refeição com proteína, água e flags
- ✅ Aviso ao registrar fora da janela alimentar
- ✅ Sistema de flags automáticas e manuais
- ✅ Checklist diário com reset automático à meia-noite

### Fase 2 — Notificações Push
- ✅ Web Push API com VAPID
- ✅ Service Worker para receber push com app fechado
- ✅ Lembretes de abertura/fechamento da janela alimentar
- ✅ Lembretes pré e pós-treino
- ✅ Lembretes de suplementos (Ômega-3, Creatina, ZMA)
- ✅ Alertas contextuais (água < 2L às 18h, proteína < 80g às 19h)
- ✅ Auto-flags de suplementos esquecidos

### Fase 3 — Dashboard e Histórico
- ✅ Dashboard com períodos 7/30/60/90 dias
- ✅ Métricas de compliance (jejum, proteína, água, treino)
- ✅ Streak atual e máximo histórico
- ✅ Resumo de flags negativas com percentuais
- ✅ Histórico navegável por dia com timeline de refeições
- ✅ Input semanal de peso e cintura
- ✅ Gráficos de evolução corporal (Recharts)
- ✅ Relatório semanal automático via push (segunda-feira 08h)

## Design

Design system inspirado na identidade NVIDIA:
- Cor primária: `#76b900` (verde)
- Superfície escura: `#000000`
- Canvas: `#ffffff`
- Bordas: `1px solid #cccccc`
- Border radius: `2px` (angular, técnico)
- Tipografia: Inter 400/700
- Sem sombras em cards — separação apenas por bordas
- Corner squares verdes como elemento decorativo característico
