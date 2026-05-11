export const PROTOCOL = {
  FASTING_START_HOUR: 20,
  FASTING_END_HOUR: 14,
  PROTEIN_GOAL_G: 160,
  WATER_GOAL_ML: 4000,
  WORKOUT_HOUR: 18,
  TIMEZONE: 'America/Sao_Paulo',
}

export const REMINDERS = [
  { cron: '45 13 * * *', title: 'Body Tech', body: '🍽️ Janela abre em 15min — prepare sua primeira refeição' },
  { cron: '0 14 * * *',  title: 'Body Tech', body: '✅ Janela aberta — pode comer agora' },
  { cron: '45 16 * * *', title: 'Body Tech', body: '🏃 Pré-treino em 15min — Whey + fruta' },
  { cron: '0 17 * * *',  title: 'Body Tech', body: '🏋️ Pré-treino — Whey + fruta agora' },
  { cron: '30 19 * * *', title: 'Body Tech', body: '💪 Pós-treino — refeição principal agora' },
  { cron: '45 19 * * *', title: 'Body Tech', body: '⚠️ Janela fecha em 15min' },
  { cron: '0 20 * * *',  title: 'Body Tech', body: '🌙 Janela fechada — jejum iniciado' },
]

export const SUPPLEMENT_REMINDERS = [
  { cron: '0 14 * * *',  title: 'Suplementos', body: '💊 Ômega-3 + Multivitamínico + D3/K2 com a refeição' },
  { cron: '0 17 * * *',  title: 'Suplementos', body: '💊 Creatina pós-treino — registrou?' },
  { cron: '30 21 * * *', title: 'Suplementos', body: '💊 ZMA antes de dormir — registrou?' },
]

export const WEEKLY_REPORT_CRON = '0 8 * * 1' // Segunda-feira 08h
