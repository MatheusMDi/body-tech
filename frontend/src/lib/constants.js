export const PROTOCOL = {
  FASTING_START_HOUR: 20,
  FASTING_END_HOUR: 14,
  FASTING_DURATION_HOURS: 18,
  EATING_DURATION_HOURS: 6,
  PROTEIN_GOAL_G: 160,
  WATER_GOAL_ML: 4000,
  WORKOUT_HOUR: 18,
  WEIGHT_GOAL_KG: 91,
}

export const FLAGS = {
  AUTO: {
    FORA_DA_JANELA: { id: 'FORA_DA_JANELA', label: 'Fora da janela', emoji: '⚠️', color: 'warning', auto: true },
    JEJUM_COMPLETO: { id: 'JEJUM_COMPLETO', label: 'Jejum completo', emoji: '✅', color: 'success', auto: true },
    JANELA_FECHADA: { id: 'JANELA_FECHADA', label: 'Janela fechada sem comer', emoji: '🌙', color: 'mute', auto: true },
    CREATINA_ESQUECIDA: { id: 'CREATINA_ESQUECIDA', label: 'Creatina esquecida', emoji: '💊', color: 'warning', auto: true },
    ZMA_ESQUECIDO: { id: 'ZMA_ESQUECIDO', label: 'ZMA esquecido', emoji: '💊', color: 'warning', auto: true },
  },
  MANUAL: {
    ALCOOL: { id: 'ALCOOL', label: 'Álcool', emoji: '🚨', color: 'error' },
    ACUCAR: { id: 'ACUCAR', label: 'Açúcar', emoji: '🍬', color: 'error' },
    ULTRAPROCESSADO: { id: 'ULTRAPROCESSADO', label: 'Ultraprocessado', emoji: '🍕', color: 'warning' },
    SONO_RUIM: { id: 'SONO_RUIM', label: 'Sono ruim (<7h)', emoji: '😴', color: 'warning' },
    PROTEINA_BATIDA: { id: 'PROTEINA_BATIDA', label: 'Proteína atingida', emoji: '🥩', color: 'success' },
    CAMINHADA_JEJUM: { id: 'CAMINHADA_JEJUM', label: 'Caminhada em jejum', emoji: '🚶', color: 'success' },
    TREINO_FEITO: { id: 'TREINO_FEITO', label: 'Treino feito', emoji: '🏋️', color: 'success' },
    CREATINA: { id: 'CREATINA', label: 'Creatina tomada', emoji: '💊', color: 'success' },
    ZMA: { id: 'ZMA', label: 'ZMA tomado', emoji: '💊', color: 'success' },
    OMEGA3: { id: 'OMEGA3', label: 'Ômega-3 + Multi + D3/K2', emoji: '💊', color: 'success' },
  },
}

export const ALL_MANUAL_FLAGS = Object.values(FLAGS.MANUAL)

export const CHECKLIST_ITEMS = [
  { id: 'jejum', label: 'Jejum cumprido (18h)', emoji: '⏱️', auto: true },
  { id: 'treino', label: 'Treino CrossFit', emoji: '🏋️', auto: false },
  { id: 'agua', label: 'Água 4L', emoji: '💧', auto: true },
  { id: 'proteina', label: 'Proteína 160g', emoji: '🥩', auto: true },
  { id: 'caminhada', label: 'Caminhada em jejum', emoji: '🚶', auto: false, weekly: true },
  { id: 'sem_acucar', label: 'Sem açúcar', emoji: '🍬', auto: true },
  { id: 'sem_alcool', label: 'Sem álcool', emoji: '🚨', auto: true },
]

export const REMINDERS = [
  { time: '13:45', message: 'Janela abre em 15min — prepare sua primeira refeição', emoji: '🍽️' },
  { time: '14:00', message: '✅ Janela aberta — pode comer' },
  { time: '16:45', message: 'Pré-treino em 15min — Whey + fruta', emoji: '🏃' },
  { time: '17:00', message: '🏋️ Pré-treino — Whey + fruta agora' },
  { time: '19:30', message: '💪 Pós-treino — refeição principal agora' },
  { time: '19:45', message: '⚠️ Janela fecha em 15min' },
  { time: '20:00', message: '🌙 Janela fechada — jejum iniciado' },
]

export const COLORS = {
  PRIMARY: '#76b900',
  SURFACE_DARK: '#000000',
  CANVAS: '#ffffff',
  HAIRLINE: '#cccccc',
  ERROR: '#e52020',
  WARNING: '#df6500',
  SUCCESS: '#3f8500',
  MUTE: '#757575',
}

export const ACHIEVEMENTS = {
  PRIMEIRA_SEMANA: {
    key: 'PRIMEIRA_SEMANA', label: 'Primeira Semana', emoji: '🔥',
    description: '7 dias consecutivos de jejum', category: 'jejum', target: 7,
  },
  MES_SOLIDO: {
    key: 'MES_SOLIDO', label: 'Mês Sólido', emoji: '💪',
    description: '30 dias consecutivos de jejum', category: 'jejum', target: 30,
  },
  PROTOCOLO_ELITE: {
    key: 'PROTOCOLO_ELITE', label: 'Protocolo Elite', emoji: '🏆',
    description: '60 dias consecutivos de jejum', category: 'jejum', target: 60,
  },
  META_BATIDA: {
    key: 'META_BATIDA', label: 'Meta Batida', emoji: '🥩',
    description: 'Primeiro dia com 160g+ de proteína', category: 'proteina', target: 1,
  },
  CONSISTENCIA_PROTEINA: {
    key: 'CONSISTENCIA_PROTEINA', label: 'Consistência', emoji: '🥩',
    description: '14 dias seguidos na meta de proteína', category: 'proteina', target: 14,
  },
  MAQUINA_PROTEINA: {
    key: 'MAQUINA_PROTEINA', label: 'Máquina', emoji: '🥩',
    description: '30 dias seguidos na meta de proteína', category: 'proteina', target: 30,
  },
  SEMANA_LIMPA: {
    key: 'SEMANA_LIMPA', label: 'Semana Limpa', emoji: '🚫',
    description: '7 dias sem álcool e sem açúcar', category: 'clean', target: 7,
  },
  MES_LIMPO: {
    key: 'MES_LIMPO', label: 'Mês Limpo', emoji: '🚫',
    description: '30 dias sem álcool e sem açúcar', category: 'clean', target: 30,
  },
  PRIMEIRO_KG: {
    key: 'PRIMEIRO_KG', label: 'Primeiro Kg', emoji: '📉',
    description: 'Perdeu 1kg vs peso inicial', category: 'peso', target: 1,
  },
  CINCO_KG: {
    key: 'CINCO_KG', label: 'Cinco Kg', emoji: '📉',
    description: 'Perdeu 5kg vs peso inicial', category: 'peso', target: 5,
  },
  DEZ_KG: {
    key: 'DEZ_KG', label: 'Dez Kg', emoji: '📉',
    description: 'Perdeu 10kg vs peso inicial', category: 'peso', target: 10,
  },
  ATLETA: {
    key: 'ATLETA', label: 'Atleta', emoji: '🏋️',
    description: '20 treinos registrados', category: 'treino', target: 20,
  },
  DEDICADO: {
    key: 'DEDICADO', label: 'Dedicado', emoji: '🏋️',
    description: '50 treinos registrados', category: 'treino', target: 50,
  },
}
