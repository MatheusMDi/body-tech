import { useState } from 'react'
import { usePush } from '../hooks/usePush.js'
import { useAuth } from '../hooks/useAuth.js'
import { PROTOCOL } from '../lib/constants.js'

export default function Settings({ user }) {
  const { signOut } = useAuth()
  const { permission, subscribed, subscribe, unsubscribe } = usePush(user?.id)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  function NotifButton() {
    if (!('Notification' in window)) {
      return <div className="text-stone text-[13px]">Notificações não suportadas neste dispositivo.</div>
    }
    if (subscribed) {
      return (
        <button onClick={unsubscribe} className="btn-outline-dark w-full">
          🔕 Desativar Notificações
        </button>
      )
    }
    return (
      <button onClick={subscribe} className="btn-primary w-full">
        🔔 Ativar Notificações Push
      </button>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="pl-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-mute mb-1">Configurações</div>
          <h1 className="text-[24px] font-bold text-on-dark">Protocolo</h1>
        </div>
      </div>

      {/* Protocol summary */}
      <div className="card-dark border border-hairline-strong rounded-sm overflow-hidden relative">
        <div className="corner-square top-0 right-0" />
        <div className="px-5 py-4 border-b border-hairline-strong">
          <div className="text-[11px] font-bold uppercase tracking-widest text-mute">Protocolo Ativo</div>
        </div>
        <div className="divide-y divide-hairline-strong">
          {[
            { label: 'Jejum', value: `18:6 (${PROTOCOL.FASTING_START_HOUR}h → ${PROTOCOL.FASTING_END_HOUR}h)` },
            { label: 'Proteína meta', value: `${PROTOCOL.PROTEIN_GOAL_G}g/dia` },
            { label: 'Água meta', value: `${PROTOCOL.WATER_GOAL_ML / 1000}L/dia` },
            { label: 'Treino CrossFit', value: `${PROTOCOL.WORKOUT_HOUR}h todo dia` },
            { label: 'Caminhada em jejum', value: '1x/semana (manhã)' },
            { label: 'Peso meta', value: `${PROTOCOL.WEIGHT_GOAL_KG}kg` },
            { label: 'Restrições', value: 'Sem açúcar · Sem álcool' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-5 py-3">
              <span className="text-[13px] text-on-dark-mute">{label}</span>
              <span className="text-[13px] font-bold text-on-dark">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suplementos */}
      <div className="card-dark border border-hairline-strong rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline-strong">
          <div className="text-[11px] font-bold uppercase tracking-widest text-mute">Suplementação</div>
        </div>
        <div className="divide-y divide-hairline-strong">
          {[
            { time: '14:00', sup: 'Ômega-3 + Multivitamínico + D3/K2' },
            { time: '17:00', sup: 'Creatina' },
            { time: '21:30', sup: 'ZMA' },
          ].map(({ time, sup }) => (
            <div key={time} className="flex justify-between items-center px-5 py-3">
              <span className="text-primary font-bold text-[13px]">{time}</span>
              <span className="text-[13px] text-on-dark">{sup}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notificações */}
      <div className="card-dark border border-hairline-strong rounded-sm p-5 space-y-3 relative overflow-hidden">
        <div className="corner-square bottom-0 left-0" />
        <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-2">
          Notificações Push
        </div>
        <div className="text-[13px] text-on-dark-mute mb-3">
          Receba lembretes automáticos: abertura/fechamento da janela, pré e pós-treino, suplementos e relatório semanal.
        </div>
        <div className="text-[12px] text-stone mb-3">
          Status: {permission === 'granted' ? (subscribed ? '🔔 Ativas' : '⏸ Permitidas mas inativas') : permission === 'denied' ? '🔕 Bloqueadas no navegador' : '⚪ Não configuradas'}
        </div>
        <NotifButton />
      </div>

      {/* Account */}
      <div className="card-dark border border-hairline-strong rounded-sm p-5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-3">Conta</div>
        <div className="text-[13px] text-on-dark-mute mb-4">{user?.email}</div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-outline-dark w-full"
        >
          {signingOut ? 'Saindo...' : 'Sair'}
        </button>
      </div>

      {/* App info */}
      <div className="text-center text-[10px] text-stone uppercase tracking-widest py-4">
        Body Tech v1.0.0 · Protocolo 18:6
      </div>
    </div>
  )
}
