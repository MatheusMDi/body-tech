import { useState } from 'react'

const FOCUS_OPTIONS = [
  { id: 'fat_loss',               label: 'Perda de gordura',     emoji: '🔻' },
  { id: 'muscle_gain',            label: 'Ganho de massa',       emoji: '🔺' },
  { id: 'athletic_performance',   label: 'Performance atlética', emoji: '🏃' },
  { id: 'general_health',         label: 'Saúde geral',          emoji: '🧘' },
  { id: 'intermittent_fasting',   label: 'Jejum intermitente',   emoji: '⏱️' },
]

export default function OnboardingStep1({ onNext }) {
  const [subStep, setSubStep] = useState('welcome') // 'welcome' | 'goals'
  const [selected, setSelected] = useState([])

  function toggleOption(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function handleContinue() {
    onNext({ focus_goals: selected })
  }

  // --- Welcome screen ---
  if (subStep === 'welcome') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-8">
        {/* Logo mark */}
        <div className="relative">
          <div className="w-20 h-20 border-2 border-primary flex items-center justify-center">
            <span className="text-primary font-bold text-[28px] tracking-tight">BT</span>
          </div>
          <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-primary" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-[28px] font-bold" style={{ color: 'var(--theme-text)' }}>
            Bem-vindo ao Body Tech
          </h1>
          <p className="text-[16px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
            Vamos configurar seu protocolo em 2 minutos. Precisamos de alguns dados para personalizar sua experiência.
          </p>
        </div>

        <button
          onClick={() => setSubStep('goals')}
          className="w-full btn-primary mt-4"
        >
          Começar
        </button>
      </div>
    )
  }

  // --- Focus goals selection ---
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-6">
        <h2 className="text-[22px] font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
          Qual é seu foco principal?
        </h2>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
          Selecione tudo que se aplica. Você pode mudar isso depois.
        </p>
      </div>

      <div className="space-y-2 flex-1">
        {FOCUS_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.id)
          return (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl border-2 transition-all ${
                isSelected ? 'border-primary bg-primary/10' : ''
              }`}
              style={
                !isSelected
                  ? {
                      borderColor: 'var(--theme-border)',
                      backgroundColor: 'var(--theme-surface)',
                    }
                  : {}
              }
            >
              <span className="text-2xl leading-none">{option.emoji}</span>
              <span
                className="font-semibold text-[15px]"
                style={{ color: isSelected ? '#76b900' : 'var(--theme-text)' }}
              >
                {option.label}
              </span>
              {isSelected && (
                <span className="ml-auto text-primary font-bold text-[16px]">✓</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full btn-primary"
          style={selected.length === 0 ? { opacity: 0.45 } : {}}
        >
          Continuar
        </button>
        <button
          onClick={() => setSubStep('welcome')}
          className="w-full btn-outline-dark text-[13px]"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
