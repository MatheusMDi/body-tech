import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../contexts/SettingsContext.jsx'
import { usePush } from '../hooks/usePush.js'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import { getRules, getAllRules, createRule, updateRule, deleteRule } from '../services/rules.js'
import CreateRuleModal from '../components/rules/CreateRuleModal.jsx'
import RulesCatalog from '../components/rules/RulesCatalog.jsx'
import { todayDateString } from '../lib/utils.js'

// ── Shared primitives ─────────────────────────────────────────────────────────

function Accordion({ id, icon, title, filled, children, openIds, onToggle }) {
  const isOpen = openIds.includes(id)
  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        borderRadius: '16px',
      }}
    >
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        onClick={() => onToggle(id)}
      >
        <span className="text-[18px]">{icon}</span>
        <span className="flex-1 font-bold text-[15px]" style={{ color: 'var(--theme-text)' }}>{title}</span>
        {filled && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        )}
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--theme-text-faint)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0" style={{ borderTop: '1px solid var(--theme-border)' }}>
          <div className="pt-4 space-y-4">{children}</div>
        </div>
      )}
    </div>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--theme-text-faint)' }}>
        {label}
      </label>
      {children}
      {hint  && <p className="text-[11px] mt-1"   style={{ color: 'var(--theme-text-faint)' }}>{hint}</p>}
      {error && <p className="text-[11px] mt-1"   style={{ color: '#c94040' }}>{error}</p>}
    </div>
  )
}

function SaveBtn({ saving, onClick, label = 'Salvar' }) {
  return (
    <button onClick={onClick} disabled={saving} className="btn-primary w-full">
      {saving ? 'Salvando...' : label}
    </button>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

function ProfileSection({ profile, updateSetting, showToast, user }) {
  const [name,     setName]     = useState(profile?.name ?? '')
  const [weight,   setWeight]   = useState(profile?.weight_goal ? String(profile.weight_goal) : '')
  const [height,   setHeight]   = useState(profile?.height_cm ? String(profile.height_cm) : '')
  const [goalWt,   setGoalWt]   = useState(profile?.goal_weight_kg ? String(profile.goal_weight_kg) : '')
  const [saving,   setSaving]   = useState(false)

  async function save() {
    setSaving(true)
    await updateSetting({
      name: name || null,
      weight_goal: parseFloat(weight) || null,
      height_cm:   parseFloat(height) || null,
      goal_weight_kg: parseFloat(goalWt) || null,
    })
    showToast('Perfil salvo', 'success')
    setSaving(false)
  }

  const initials = (name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <>
      {/* Avatar */}
      <div className="flex items-center gap-4 pb-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-bold text-primary shrink-0"
          style={{ backgroundColor: 'rgba(118,185,0,0.15)', border: '2px solid rgba(118,185,0,0.3)' }}
        >
          {initials}
        </div>
        <div>
          <div className="font-bold text-[15px]" style={{ color: 'var(--theme-text)' }}>{name || 'Sem nome'}</div>
          <div className="text-[12px]" style={{ color: 'var(--theme-text-faint)' }}>{user?.email}</div>
        </div>
      </div>

      <Field label="Nome">
        <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
      </Field>
      <Field label="Email">
        <input className="input-field" value={user?.email ?? ''} readOnly style={{ opacity: 0.5, cursor: 'not-allowed' }} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Peso atual (kg)">
          <input className="input-field" type="number" step="0.1" min="30" max="300" value={weight} onChange={e => setWeight(e.target.value)} placeholder="85.0" />
        </Field>
        <Field label="Altura (cm)">
          <input className="input-field" type="number" min="100" max="250" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
        </Field>
      </div>
      <Field label="Meta de peso (kg)">
        <input className="input-field" type="number" step="0.1" min="30" max="300" value={goalWt} onChange={e => setGoalWt(e.target.value)} placeholder="80.0" />
      </Field>
      <SaveBtn saving={saving} onClick={save} />
    </>
  )
}

function FastingSection({ profile, updateSetting, showToast }) {
  const PROTOCOLS = ['16:8', '18:6', '20:4', 'Personalizado']
  const [protocol, setProtocol] = useState(
    PROTOCOLS.find(p => p !== 'Personalizado' && matchesProtocol(p, profile?.fasting_start, profile?.fasting_end))
    ?? 'Personalizado'
  )
  const [start,  setStart]  = useState(profile?.fasting_start ?? '20:00')
  const [end,    setEnd]    = useState(profile?.fasting_end   ?? '14:00')
  const [saving, setSaving] = useState(false)

  function handleProtocol(p) {
    setProtocol(p)
    const defaults = { '16:8': ['22:00','14:00'], '18:6': ['20:00','14:00'], '20:4': ['20:00','16:00'] }
    if (defaults[p]) { setStart(defaults[p][0]); setEnd(defaults[p][1]) }
  }

  async function save() {
    setSaving(true)
    await updateSetting({ fasting_start: start, fasting_end: end })
    showToast('Protocolo salvo — reinicie para aplicar', 'success')
    setSaving(false)
  }

  const startH = parseInt(start)
  const endH   = parseInt(end)
  const fastH  = startH > endH ? 24 - startH + endH : endH - startH
  const eatH   = 24 - fastH

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {PROTOCOLS.map(p => (
          <button
            key={p}
            onClick={() => handleProtocol(p)}
            className="px-4 py-2 rounded-xl text-[13px] font-bold transition-colors"
            style={{
              backgroundColor: protocol === p ? 'rgba(118,185,0,0.15)' : 'var(--theme-surface-soft)',
              border: `1px solid ${protocol === p ? '#76b900' : 'var(--theme-border)'}`,
              color: protocol === p ? '#76b900' : 'var(--theme-text-muted)',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Início do jejum">
          <input type="time" value={start} onChange={e => setStart(e.target.value)} className="input-field" />
        </Field>
        <Field label="Fim do jejum">
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} className="input-field" />
        </Field>
      </div>

      {/* Visual preview */}
      <div
        className="rounded-xl p-3"
        style={{ backgroundColor: 'var(--theme-surface-soft)', border: '1px solid var(--theme-border)' }}
      >
        <div className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
          Resumo
        </div>
        <div className="text-[14px] font-semibold" style={{ color: 'var(--theme-text)' }}>
          Jejum: <span className="text-primary">{fastH}h</span>
          {' '}· Janela: <span style={{ color: '#76b900' }}>{eatH}h</span>
          {' '}({end?.slice(0,5)} → {start?.slice(0,5)})
        </div>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </>
  )
}

function GoalsSection({ profile, updateSetting, showToast }) {
  const [waterL,    setWaterL]    = useState(String((profile?.water_goal_ml ?? 4000) / 1000))
  const [autoProte, setAutoProte] = useState(!profile?.protein_goal)
  const [protein,   setProtein]   = useState(String(profile?.protein_goal ?? 160))
  const [saving,    setSaving]    = useState(false)

  const weightKg = profile?.weight_goal ?? 80
  const suggestedProtein = Math.round(weightKg * 2)

  async function save() {
    setSaving(true)
    const proteinGoal = autoProte ? suggestedProtein : (parseInt(protein) || suggestedProtein)
    await updateSetting({
      water_goal_ml: Math.round(parseFloat(waterL) * 1000),
      protein_goal: proteinGoal,
    })
    showToast('Metas salvas', 'success')
    setSaving(false)
  }

  return (
    <>
      <Field label={`Meta de água · ${parseFloat(waterL).toFixed(1)}L/dia`}>
        <input
          type="range" min="1" max="6" step="0.5"
          value={waterL}
          onChange={e => setWaterL(e.target.value)}
          className="w-full accent-primary mt-1"
        />
        <div className="flex justify-between text-[10px] mt-0.5" style={{ color: 'var(--theme-text-faint)' }}>
          <span>1L</span><span>6L</span>
        </div>
      </Field>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
          Meta de proteína
        </label>
        <div className="flex flex-col gap-2">
          <label
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
            style={{
              backgroundColor: autoProte ? 'rgba(118,185,0,0.1)' : 'var(--theme-surface-soft)',
              border: `1px solid ${autoProte ? '#76b900' : 'var(--theme-border)'}`,
            }}
          >
            <input
              type="radio"
              checked={autoProte}
              onChange={() => setAutoProte(true)}
              className="accent-primary"
            />
            <span className="text-[14px]" style={{ color: 'var(--theme-text)' }}>
              Automático: <strong className="text-primary">{suggestedProtein}g</strong> (peso × 2g)
            </span>
          </label>
          <label
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
            style={{
              backgroundColor: !autoProte ? 'rgba(118,185,0,0.1)' : 'var(--theme-surface-soft)',
              border: `1px solid ${!autoProte ? '#76b900' : 'var(--theme-border)'}`,
            }}
          >
            <input
              type="radio"
              checked={!autoProte}
              onChange={() => setAutoProte(false)}
              className="accent-primary"
            />
            <span className="text-[14px]" style={{ color: 'var(--theme-text)' }}>Manual</span>
          </label>
        </div>
        {!autoProte && (
          <input
            type="number" min="50" max="400"
            value={protein}
            onChange={e => setProtein(e.target.value)}
            placeholder="160"
            className="input-field mt-2"
          />
        )}
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </>
  )
}

function TrainingSection({ profile, updateSetting, showToast }) {
  const DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
  const MODALITIES = ['CrossFit','Musculação','Funcional','Corrida','Outro']

  const [trains,    setTrains]    = useState(profile?.trains ?? false)
  const [modality,  setModality]  = useState(profile?.training_modality ?? 'CrossFit')
  const [time,      setTime]      = useState(profile?.training_time ?? '18:00')
  const [days,      setDays]      = useState(profile?.training_days_per_week ?? 4)
  const [saving,    setSaving]    = useState(false)

  async function save() {
    setSaving(true)
    await updateSetting({
      trains,
      training_modality:       trains ? modality : null,
      training_time:           trains ? time     : null,
      training_days_per_week:  trains ? days     : null,
    })
    showToast('Treino salvo', 'success')
    setSaving(false)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[14px]" style={{ color: 'var(--theme-text)' }}>Pratico atividade física</span>
        <button
          onClick={() => setTrains(v => !v)}
          className="w-12 h-6 rounded-full relative transition-colors"
          style={{ backgroundColor: trains ? '#76b900' : 'var(--theme-border)' }}
        >
          <div
            className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
            style={{ left: trains ? '26px' : '2px' }}
          />
        </button>
      </div>

      {trains && (
        <>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-text-faint)' }}>
              Modalidade
            </label>
            <div className="flex flex-wrap gap-2">
              {MODALITIES.map(m => (
                <button
                  key={m}
                  onClick={() => setModality(m)}
                  className="px-3 py-1.5 rounded-xl text-[13px] font-bold transition-colors"
                  style={{
                    backgroundColor: modality === m ? 'rgba(118,185,0,0.15)' : 'var(--theme-surface-soft)',
                    border: `1px solid ${modality === m ? '#76b900' : 'var(--theme-border)'}`,
                    color: modality === m ? '#76b900' : 'var(--theme-text-muted)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Horário">
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field" />
            </Field>
            <Field label="Dias/semana">
              <div className="flex items-center gap-3 h-11">
                <button
                  onClick={() => setDays(d => Math.max(1, d - 1))}
                  className="w-9 h-9 rounded-xl font-bold text-[18px] flex items-center justify-center"
                  style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
                >−</button>
                <span className="font-bold text-[20px] text-primary w-5 text-center">{days}</span>
                <button
                  onClick={() => setDays(d => Math.min(7, d + 1))}
                  className="w-9 h-9 rounded-xl font-bold text-[18px] flex items-center justify-center"
                  style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
                >+</button>
              </div>
            </Field>
          </div>
        </>
      )}

      <SaveBtn saving={saving} onClick={save} />
    </>
  )
}

function SupplementsSection({ profile, updateSetting, showToast }) {
  const DEFAULT_SUPPS = ['creatina', 'zma', 'omega3', 'multivitaminico', 'd3k2']
  const LABELS = { creatina: 'Creatina 💊', zma: 'ZMA 💊', omega3: 'Ômega-3 🐟', multivitaminico: 'Multivitamínico 💊', d3k2: 'D3/K2 ☀️' }

  const [active, setActive] = useState(profile?.active_supplements ?? [])
  const [custom, setCustom] = useState('')
  const [saving, setSaving] = useState(false)

  function toggle(key) {
    setActive(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  function addCustom() {
    const k = custom.trim().toLowerCase().replace(/\s+/g, '_')
    if (!k || active.includes(k)) return
    setActive(prev => [...prev, custom.trim()])
    setCustom('')
  }

  async function save() {
    setSaving(true)
    await updateSetting({ active_supplements: active })
    showToast('Suplementos salvos', 'success')
    setSaving(false)
  }

  const allKeys = [...new Set([...DEFAULT_SUPPS, ...active.filter(a => !DEFAULT_SUPPS.includes(a))])]

  return (
    <>
      <div className="space-y-2">
        {allKeys.map(key => {
          const label = LABELS[key] ?? `${key} 💊`
          const on = active.includes(key)
          return (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                backgroundColor: on ? 'rgba(118,185,0,0.07)' : 'var(--theme-surface-soft)',
                border: `1px solid ${on ? '#76b900' : 'var(--theme-border)'}`,
              }}
            >
              <span className="text-[14px]" style={{ color: 'var(--theme-text)' }}>{label}</span>
              <button
                onClick={() => toggle(key)}
                className="w-11 h-6 rounded-full relative transition-colors"
                style={{ backgroundColor: on ? '#76b900' : 'var(--theme-border)' }}
              >
                <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: on ? '24px' : '2px' }} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          placeholder="Adicionar suplemento..."
          onKeyDown={e => e.key === 'Enter' && addCustom()}
        />
        <button
          onClick={addCustom}
          className="px-4 py-2 rounded-xl font-bold text-[13px] bg-primary"
          style={{ color: '#000' }}
        >
          +
        </button>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </>
  )
}

function RulesSection({ userId, showToast }) {
  const [rules, setRules] = useState([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editRule, setEditRule] = useState(null)
  const [tab, setTab] = useState('rules')

  useEffect(() => {
    if (userId) getAllRules(userId).then(setRules)
  }, [userId])

  const restrictionRules = rules.filter(r => r.type !== 'bonus')
  const bonusRules       = rules.filter(r => r.type === 'bonus')
  const existingKeys     = rules.filter(r => r.predefined_key).map(r => r.predefined_key)

  async function handleAddFromCatalog(rule) {
    const created = await createRule(userId, {
      name: rule.name, emoji: rule.emoji, type: rule.type,
      is_predefined: true, predefined_key: rule.key,
      points_on_success: rule.points_on_success,
      points_on_failure: rule.points_on_failure ?? 0,
    })
    setRules(prev => [...prev, created])
  }

  async function handleCreate(data) {
    if (editRule) {
      const updated = await updateRule(editRule.id, data)
      setRules(prev => prev.map(r => r.id === editRule.id ? updated : r))
      setEditRule(null)
      showToast('Regra atualizada', 'success')
    } else {
      const created = await createRule(userId, data)
      setRules(prev => [...prev, created])
      showToast('Regra criada', 'success')
    }
  }

  async function handleToggleActive(rule) {
    const updated = await updateRule(rule.id, { is_active: !rule.is_active })
    setRules(prev => prev.map(r => r.id === rule.id ? updated : r))
  }

  async function handleDelete(rule) {
    await deleteRule(rule.id)
    setRules(prev => prev.filter(r => r.id !== rule.id))
    showToast('Regra removida', 'info')
  }

  const displayRules = tab === 'rules' ? restrictionRules : bonusRules

  return (
    <>
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-soft)' }}>
        {[{ key:'rules', label:'Regras' }, { key:'bonuses', label:'Bônus' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-colors"
            style={{
              backgroundColor: tab === t.key ? 'var(--theme-surface)' : 'transparent',
              color: tab === t.key ? '#76b900' : 'var(--theme-text-faint)',
              border: tab === t.key ? '1px solid var(--theme-border)' : '1px solid transparent',
            }}
          >
            {t.label} ({t.key === 'rules' ? restrictionRules.length : bonusRules.length})
          </button>
        ))}
      </div>

      {displayRules.length === 0 ? (
        <div className="text-center py-6" style={{ color: 'var(--theme-text-faint)' }}>
          <div className="text-[32px] mb-2">{tab === 'rules' ? '🚫' : '⭐'}</div>
          <div className="text-[14px]">Nenhum{tab === 'bonuses' ? ' bônus' : 'a regra'} ainda</div>
        </div>
      ) : (
        <div className="space-y-2">
          {displayRules.map(rule => (
            <div
              key={rule.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                backgroundColor: 'var(--theme-surface-soft)',
                border: `1px solid ${rule.is_active ? 'var(--theme-border)' : 'var(--theme-border-subtle)'}`,
                opacity: rule.is_active ? 1 : 0.5,
              }}
            >
              <span className="text-[18px]">{rule.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--theme-text)' }}>{rule.name}</div>
                <div className="text-[11px]" style={{ color: 'var(--theme-text-faint)' }}>
                  +{rule.points_on_success}{rule.type !== 'bonus' ? ` / -${rule.points_on_failure}` : ''} pts
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(rule)}
                className="w-10 h-5 rounded-full relative transition-colors shrink-0"
                style={{ backgroundColor: rule.is_active ? '#76b900' : 'var(--theme-border)' }}
              >
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: rule.is_active ? '22px' : '2px' }} />
              </button>
              <button onClick={() => { setEditRule(rule); setShowCreate(true) }} className="text-[14px] px-1" style={{ color: 'var(--theme-text-faint)' }}>✎</button>
              <button onClick={() => handleDelete(rule)} className="text-[14px] px-1" style={{ color: '#c94040' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowCatalog(true)}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-bold"
          style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}
        >
          + Catálogo
        </button>
        <button
          onClick={() => { setEditRule(null); setShowCreate(true) }}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-primary"
          style={{ color: '#000' }}
        >
          + Personalizada
        </button>
      </div>

      {showCatalog && (
        <RulesCatalog
          existingKeys={existingKeys}
          onAdd={handleAddFromCatalog}
          onClose={() => setShowCatalog(false)}
        />
      )}
      {showCreate && (
        <CreateRuleModal
          initialData={editRule}
          onSave={handleCreate}
          onClose={() => { setShowCreate(false); setEditRule(null) }}
        />
      )}
    </>
  )
}

function NotificationsSection({ profile, updateSetting, showToast, userId }) {
  const { permission, subscribed, subscribe, unsubscribe } = usePush(userId)
  const [enabled, setEnabled] = useState(profile?.notifications_enabled ?? true)
  const [prefs,   setPrefs]   = useState(profile?.notification_preferences ?? {})
  const [saving,  setSaving]  = useState(false)

  const TYPES = [
    { key: 'window_open',  label: 'Abertura da janela',   emoji: '⏰' },
    { key: 'pre_workout',  label: 'Pré-treino',           emoji: '🏃' },
    { key: 'post_workout', label: 'Pós-treino',           emoji: '💪' },
    { key: 'window_close', label: 'Fechamento da janela', emoji: '🌙' },
    { key: 'supplement',   label: 'Suplementos',          emoji: '💊' },
    { key: 'daily_summary',label: 'Resumo noturno',       emoji: '📊' },
    { key: 'sleep_reminder',label: 'Lembrete de sono',    emoji: '😴' },
    { key: 'achievements', label: 'Conquistas',           emoji: '🏆' },
  ]

  function togglePref(key) {
    setPrefs(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))
  }

  async function save() {
    setSaving(true)
    await updateSetting({ notifications_enabled: enabled, notification_preferences: prefs })
    showToast('Notificações salvas', 'success')
    setSaving(false)
  }

  return (
    <>
      {/* Master toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-[14px]" style={{ color: 'var(--theme-text)' }}>Ativar lembretes</div>
          <div className="text-[12px]" style={{ color: 'var(--theme-text-faint)' }}>
            {permission === 'granted' ? (subscribed ? '🔔 Ativas' : '⏸ Inativas') : permission === 'denied' ? '🔕 Bloqueadas no browser' : '⚪ Não configuradas'}
          </div>
        </div>
        <button
          onClick={() => setEnabled(v => !v)}
          className="w-12 h-6 rounded-full relative transition-colors"
          style={{ backgroundColor: enabled ? '#76b900' : 'var(--theme-border)' }}
        >
          <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: enabled ? '26px' : '2px' }} />
        </button>
      </div>

      {/* Push subscribe / unsubscribe */}
      {'Notification' in window && (
        subscribed
          ? <button onClick={unsubscribe} className="w-full py-2.5 rounded-xl text-[13px] font-bold" style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>🔕 Desativar push</button>
          : <button onClick={subscribe}   className="btn-primary w-full">🔔 Ativar notificações push</button>
      )}

      {/* Per-type toggles */}
      {enabled && (
        <div className="space-y-1.5">
          {TYPES.map(t => {
            const on = prefs[t.key] ?? true
            return (
              <div
                key={t.key}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: 'var(--theme-surface-soft)', border: '1px solid var(--theme-border)' }}
              >
                <span className="text-[14px]" style={{ color: 'var(--theme-text)' }}>{t.emoji} {t.label}</span>
                <button
                  onClick={() => togglePref(t.key)}
                  className="w-10 h-5 rounded-full relative transition-colors"
                  style={{ backgroundColor: on ? '#76b900' : 'var(--theme-border)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: on ? '22px' : '2px' }} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <SaveBtn saving={saving} onClick={save} />
    </>
  )
}

function AppearanceSection({ theme, toggleTheme }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-semibold text-[14px]" style={{ color: 'var(--theme-text)' }}>Tema</div>
        <div className="text-[12px]" style={{ color: 'var(--theme-text-faint)' }}>
          {theme === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors"
        style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
      >
        {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
      </button>
    </div>
  )
}

function AccountSection({ user, signOut }) {
  const [signingOut,  setSigningOut]  = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteEmail, setDeleteEmail]   = useState('')

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), user: user?.email })], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'body-tech-data.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="text-[13px] py-1" style={{ color: 'var(--theme-text-faint)' }}>{user?.email}</div>
      <button onClick={handleExport} className="w-full py-2.5 rounded-xl text-[13px] font-bold text-left px-4" style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>
        📦 Exportar meus dados (JSON)
      </button>
      <button onClick={handleSignOut} disabled={signingOut} className="btn-outline-dark w-full">
        {signingOut ? 'Saindo...' : 'Sair'}
      </button>
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full py-2.5 rounded-xl text-[13px] font-bold"
          style={{ border: '1px solid #c94040', color: '#c94040' }}
        >
          Excluir conta
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-[13px]" style={{ color: '#c94040' }}>Digite seu email para confirmar a exclusão:</p>
          <input
            className="input-field"
            value={deleteEmail}
            onChange={e => setDeleteEmail(e.target.value)}
            placeholder={user?.email}
          />
          <button
            disabled={deleteEmail !== user?.email}
            className="w-full py-2.5 rounded-xl text-[13px] font-bold"
            style={{
              backgroundColor: deleteEmail === user?.email ? '#c94040' : 'var(--theme-surface-soft)',
              color: deleteEmail === user?.email ? '#fff' : 'var(--theme-text-faint)',
              border: '1px solid var(--theme-border)',
              opacity: deleteEmail !== user?.email ? 0.5 : 1,
            }}
          >
            Confirmar exclusão
          </button>
          <button onClick={() => setConfirmDelete(false)} className="w-full text-center text-[12px]" style={{ color: 'var(--theme-text-faint)' }}>
            Cancelar
          </button>
        </div>
      )}
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const OPEN_KEY = 'bt-settings-open'

export default function Settings({ user }) {
  const { settings, profile, loading, updateSetting } = useSettings()
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')

  const [openIds, setOpenIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(OPEN_KEY) ?? '["profile"]') }
    catch { return ['profile'] }
  })

  function toggleSection(id) {
    setOpenIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(OPEN_KEY, JSON.stringify(next))
      return next
    })
  }

  const sections = [
    { id: 'profile',       icon: '👤', title: 'Perfil',               filled: !!profile?.name },
    { id: 'fasting',       icon: '⏱️', title: 'Protocolo de Jejum',   filled: !!profile?.fasting_start },
    { id: 'goals',         icon: '🎯', title: 'Metas Diárias',        filled: !!profile?.water_goal_ml },
    { id: 'training',      icon: '🏋️', title: 'Treino',               filled: profile?.trains === true },
    { id: 'supplements',   icon: '💊', title: 'Suplementos',          filled: (profile?.active_supplements?.length ?? 0) > 0 },
    { id: 'rules',         icon: '📋', title: 'Regras e Bônus',       filled: false },
    { id: 'notifications', icon: '🔔', title: 'Notificações',         filled: profile?.notifications_enabled === true },
    { id: 'appearance',    icon: '🎨', title: 'Aparência',             filled: true },
    { id: 'account',       icon: '⚙️', title: 'Conta e Dados',        filled: false },
  ]

  const filtered = search.trim()
    ? sections.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    : sections

  if (loading) {
    return <div className="text-center py-10" style={{ color: 'var(--theme-text-faint)' }}>Carregando...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-faint)' }}>Configurações</div>
        <h1 className="text-[24px] font-bold" style={{ color: 'var(--theme-text)' }}>Protocolo</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          className="input-field pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar configuração..."
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px]">🔍</span>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {filtered.map(s => (
          <Accordion key={s.id} {...s} openIds={openIds} onToggle={toggleSection}>
            {s.id === 'profile'       && <ProfileSection       profile={profile} updateSetting={updateSetting} showToast={showToast} user={user} />}
            {s.id === 'fasting'       && <FastingSection       profile={profile} updateSetting={updateSetting} showToast={showToast} />}
            {s.id === 'goals'         && <GoalsSection         profile={profile} updateSetting={updateSetting} showToast={showToast} />}
            {s.id === 'training'      && <TrainingSection      profile={profile} updateSetting={updateSetting} showToast={showToast} />}
            {s.id === 'supplements'   && <SupplementsSection   profile={profile} updateSetting={updateSetting} showToast={showToast} />}
            {s.id === 'rules'         && <RulesSection         userId={user?.id} showToast={showToast} />}
            {s.id === 'notifications' && <NotificationsSection profile={profile} updateSetting={updateSetting} showToast={showToast} userId={user?.id} />}
            {s.id === 'appearance'    && <AppearanceSection    theme={theme} toggleTheme={toggleTheme} />}
            {s.id === 'account'       && <AccountSection       user={user} signOut={signOut} />}
          </Accordion>
        ))}
      </div>

      <div className="text-center text-[10px] uppercase tracking-widest py-4" style={{ color: 'var(--theme-text-faint)' }}>
        Body Tech v1.2.0
      </div>
    </div>
  )
}

// helpers
function matchesProtocol(protocol, start, end) {
  const map = { '16:8': ['22:00','14:00'], '18:6': ['20:00','14:00'], '20:4': ['20:00','16:00'] }
  const [s, e] = map[protocol] ?? []
  return s === start && e === end
}
