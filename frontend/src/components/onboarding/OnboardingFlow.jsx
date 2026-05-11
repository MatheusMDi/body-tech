import { useState } from 'react'
import { completeOnboarding, saveOnboardingStep, calculateProteinGoal } from '../../services/onboarding.js'
import { useOnboarding } from '../../contexts/OnboardingContext.jsx'
import OnboardingStep1 from './OnboardingStep1.jsx'
import OnboardingStep2 from './OnboardingStep2.jsx'
import OnboardingStep3 from './OnboardingStep3.jsx'
import OnboardingStep4 from './OnboardingStep4.jsx'
import OnboardingStep5 from './OnboardingStep5.jsx'
import OnboardingStep6 from './OnboardingStep6.jsx'
import OnboardingStep7 from './OnboardingStep7.jsx'
import OnboardingStep8 from './OnboardingStep8.jsx'

const TOTAL_STEPS = 8

export default function OnboardingFlow({ user }) {
  const { profile, refresh } = useOnboarding()
  const [step, setStep] = useState(profile?.onboarding_step ?? 1)
  const [saving, setSaving] = useState(false)

  // Accumulated form data across steps
  const [data, setData] = useState({
    name: profile?.name ?? '',
    weight_kg: profile?.weight_goal ?? '',
    height_cm: profile?.height_cm ?? '',
    goal_weight_kg: profile?.goal_weight_kg ?? '',
    fasting_protocol: profile?.fasting_protocol ?? '18:6',
    fast_start_time: profile?.fasting_start ?? '20:00',
    fast_end_time: profile?.fasting_end ?? '14:00',
    water_goal_liters: profile?.water_goal_ml ? profile.water_goal_ml / 1000 : 4.0,
    protein_goal_g: profile?.protein_goal ?? '',
    trains: profile?.trains ?? false,
    training_modality: profile?.training_modality ?? '',
    training_time: profile?.training_time ?? '18:00',
    training_days_per_week: profile?.training_days_per_week ?? 4,
    active_supplements: profile?.active_supplements ?? [],
    notifications_enabled: profile?.notifications_enabled ?? true,
    notification_preferences: profile?.notification_preferences ?? {},
  })

  function mergeData(partial) {
    setData(prev => ({ ...prev, ...partial }))
  }

  async function goNext(partial = {}) {
    const merged = { ...data, ...partial }
    setData(merged)
    const nextStep = step + 1

    setSaving(true)
    await saveOnboardingStep(user.id, nextStep, merged)
    setSaving(false)

    setStep(nextStep)
  }

  function goBack() {
    setStep(s => Math.max(1, s - 1))
  }

  async function handleComplete() {
    setSaving(true)
    await completeOnboarding(user.id, data)
    await refresh()
    setSaving(false)
  }

  const stepProps = { data, mergeData, onNext: goNext, onBack: goBack, saving, user }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
    >
      {/* Progress bar */}
      {step > 1 && (
        <div className="w-full h-1" style={{ backgroundColor: 'var(--theme-border)' }}>
          <div
            className="h-1 bg-primary transition-all duration-300"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      )}

      {/* Step counter */}
      {step > 1 && (
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-faint)' }}>
            Passo {step - 1} de {TOTAL_STEPS - 1}
          </span>
          <span className="text-[11px] font-bold text-primary">{Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100)}%</span>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col px-6 py-6 max-w-md mx-auto w-full">
        {step === 1 && <OnboardingStep1 onNext={() => goNext()} />}
        {step === 2 && <OnboardingStep2 {...stepProps} />}
        {step === 3 && <OnboardingStep3 {...stepProps} />}
        {step === 4 && <OnboardingStep4 {...stepProps} />}
        {step === 5 && <OnboardingStep5 {...stepProps} />}
        {step === 6 && <OnboardingStep6 {...stepProps} />}
        {step === 7 && <OnboardingStep7 {...stepProps} user={user} />}
        {step === 8 && <OnboardingStep8 {...stepProps} onComplete={handleComplete} saving={saving} />}
      </div>
    </div>
  )
}
