import { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile.js'
import { usePush } from '../hooks/usePush.js'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useToast } from '../contexts/ToastContext.jsx'

function Section({ title, children }) {
  return (
    <div
      className="rounded-sm overflow-hidden border relative"
      style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="corner-square top-0 right-0" />
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-theme-faint">{title}</div>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, readOnly, placeholder, min, max, step }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="input-field"
        style={readOnly ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      />
    </div>
  )
}

export default function Settings({ user }) {
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id)
  const { signOut } = useAuth()
  const { permission, subscribed, subscribe, unsubscribe } = usePush(user?.id)
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()

  // Profile fields
  const [name, setName] = useState('')
  const [weightGoal, setWeightGoal] = useState('')
  const [heightCm, setHeightCm] = useState('')

  // Protocol fields
  const [fastingStart, setFastingStart] = useState('20:00')
  const [fastingEnd, setFastingEnd] = useState('14:00')
  const [waterGoal, setWaterGoal] = useState('4')
  const [proteinGoal, setProteinGoal] = useState('160')

  const [signingOut, setSigningOut] = useState(false)
  const [saving, setSaving] = useState('')

  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? '')
    setWeightGoal(profile.weight_goal ? String(profile.weight_goal) : '')
    setHeightCm(profile.height_cm ? String(profile.height_cm) : '')
    setFastingStart(profile.fasting_start ?? '20:00')
    setFastingEnd(profile.fasting_end ?? '14:00')
    setWaterGoal(profile.water_goal_ml ? String(profile.water_goal_ml / 1000) : '4')
    setProteinGoal(profile.protein_goal ? String(profile.protein_goal) : '160')
  }, [profile])

  async function saveProfile() {
    setSaving('profile')
    await updateProfile({
      name: name || null,
      weight_goal: parseFloat(weightGoal) || null,
      height_cm: parseFloat(heightCm) || null,
    })
    showToast('Perfil salvo', 'success')
    setSaving('')
  }

  async function saveProtocol() {
    setSaving('protocol')
    await updateProfile({
      fasting_start: fastingStart,
      fasting_end: fastingEnd,
      water_goal_ml: Math.round(parseFloat(waterGoal) * 1000) || 4000,
      protein_goal: parseInt(proteinGoal) || 160,
    })
    showToast('Protocolo salvo', 'success')
    setSaving('')
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  if (profileLoading) {
    return <div className="text-center py-10 text-theme-faint text-[13px]">Carregando...</div>
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="pl-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-1">Configurações</div>
          <h1 className="text-[24px] font-bold text-theme">Protocolo</h1>
        </div>
      </div>

      {/* Perfil */}
      <Section title="Perfil">
        <Field label="Nome" value={name} onChange={setName} placeholder="Seu nome" />
        <Field label="Email" value={user?.email ?? ''} readOnly />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso atual (kg)" type="number" value={weightGoal} onChange={setWeightGoal} placeholder="91" min="30" max="300" step="0.1" />
          <Field label="Altura (cm)" type="number" value={heightCm} onChange={setHeightCm} placeholder="175" min="100" max="250" step="1" />
        </div>
        <button
          onClick={saveProfile}
          disabled={saving === 'profile'}
          className="btn-primary w-full"
        >
          {saving === 'profile' ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </Section>

      {/* Protocolo */}
      <Section title="Protocolo">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Início do jejum" type="time" value={fastingStart} onChange={setFastingStart} />
          <Field label="Fim do jejum" type="time" value={fastingEnd} onChange={setFastingEnd} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Meta de água (L)" type="number" value={waterGoal} onChange={setWaterGoal} min="1" max="10" step="0.5" />
          <Field label="Meta proteína (g)" type="number" value={proteinGoal} onChange={setProteinGoal} min="50" max="400" step="5" />
        </div>
        <button
          onClick={saveProtocol}
          disabled={saving === 'protocol'}
          className="btn-primary w-full"
        >
          {saving === 'protocol' ? 'Salvando...' : 'Salvar Protocolo'}
        </button>
      </Section>

      {/* Aparência */}
      <Section title="Aparência">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-theme font-bold text-[14px]">Tema</div>
            <div className="text-theme-faint text-[12px]">{theme === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 border rounded-sm text-[13px] font-bold transition-colors"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
          >
            {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        </div>
      </Section>

      {/* Notificações */}
      <Section title="Notificações Push">
        <div className="text-theme-faint text-[13px] mb-2">
          Lembretes automáticos: abertura/fechamento da janela, pré e pós-treino, suplementos e relatório semanal.
        </div>
        <div className="text-[12px] text-theme-faint mb-3">
          Status:{' '}
          {permission === 'granted'
            ? subscribed ? '🔔 Ativas' : '⏸ Permitidas mas inativas'
            : permission === 'denied'
            ? '🔕 Bloqueadas no navegador'
            : '⚪ Não configuradas'}
        </div>
        {!('Notification' in window) ? (
          <div className="text-stone text-[13px]">Notificações não suportadas neste dispositivo.</div>
        ) : subscribed ? (
          <button onClick={unsubscribe} className="btn-outline-dark w-full">
            🔕 Desativar Notificações
          </button>
        ) : (
          <button onClick={subscribe} className="btn-primary w-full">
            🔔 Ativar Notificações Push
          </button>
        )}
      </Section>

      {/* Suplementação (readonly reference) */}
      <Section title="Suplementação">
        {[
          { time: '14:00', sup: 'Ômega-3 + Multivitamínico + D3/K2' },
          { time: '17:00', sup: 'Creatina' },
          { time: '21:30', sup: 'ZMA' },
        ].map(({ time, sup }) => (
          <div key={time} className="flex justify-between items-center">
            <span className="text-primary font-bold text-[13px]">{time}</span>
            <span className="text-theme text-[13px]">{sup}</span>
          </div>
        ))}
      </Section>

      {/* Conta */}
      <Section title="Conta">
        <div className="text-theme-faint text-[13px]">{user?.email}</div>
        <button onClick={handleSignOut} disabled={signingOut} className="btn-outline-dark w-full">
          {signingOut ? 'Saindo...' : 'Sair'}
        </button>
      </Section>

      <div className="text-center text-[10px] text-theme-faint uppercase tracking-widest py-4">
        Body Tech v1.1.0 · Protocolo 18:6
      </div>
    </div>
  )
}
