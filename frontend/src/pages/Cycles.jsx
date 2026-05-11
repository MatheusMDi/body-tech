export default function Cycles({ user }) {
  return (
    <div className="space-y-4">
      <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-faint)' }}>
        Ciclos
      </div>
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
      >
        <p style={{ color: 'var(--theme-text-faint)' }} className="text-sm">
          Módulo de ciclos em breve
        </p>
      </div>
    </div>
  )
}
