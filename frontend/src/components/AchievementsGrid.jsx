import { useAchievements } from '../hooks/useAchievements.js'
import { useUser } from '../contexts/UserContext.jsx'

function AchievementBadge({ achievement }) {
  const { emoji, label, description, progress, target, unlocked, unlocked_at } = achievement
  const pct = Math.min(100, Math.round(((progress ?? 0) / target) * 100))

  return (
    <div
      className="flex flex-col items-center text-center p-3 border rounded-sm relative overflow-hidden"
      style={{
        borderColor: unlocked ? '#76b900' : 'var(--theme-border)',
        backgroundColor: unlocked ? 'rgba(118,185,0,0.08)' : 'var(--theme-surface-soft)',
        opacity: unlocked ? 1 : 0.65,
      }}
    >
      {unlocked && <div className="absolute top-0 right-0 w-2 h-2 bg-primary" />}

      <div className="text-[28px] mb-1" style={{ filter: unlocked ? 'none' : 'grayscale(100%)' }}>
        {unlocked ? emoji : '🔒'}
      </div>
      <div className="text-[12px] font-bold text-theme leading-tight mb-0.5">{label}</div>
      <div className="text-[10px] text-theme-faint leading-tight mb-2">{description}</div>

      {unlocked ? (
        <div className="text-[10px] text-primary font-bold uppercase tracking-wide">
          ✅ Conquistado
        </div>
      ) : (
        <>
          <div className="w-full h-1 rounded-none overflow-hidden mb-1" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[10px] text-theme-faint">
            {typeof progress === 'number' ? `${progress.toFixed(progress % 1 ? 1 : 0)}/${target}` : '0/' + target}
          </div>
        </>
      )}
    </div>
  )
}

export default function AchievementsGrid() {
  const user = useUser()
  const { achievements, loading } = useAchievements(user?.id)

  if (loading) return (
    <div className="text-center py-6 text-theme-faint text-[13px]">Carregando conquistas...</div>
  )

  const all = Object.values(achievements)
  if (!all.length) return null

  const unlocked = all.filter(a => a.unlocked)
  const locked = all.filter(a => !a.unlocked)

  return (
    <div>
      {unlocked.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
            🏆 Conquistados ({unlocked.length})
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unlocked.map(a => <AchievementBadge key={a.key} achievement={a} />)}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-2">
            🔒 Bloqueados ({locked.length})
          </div>
          <div className="grid grid-cols-2 gap-2">
            {locked.map(a => <AchievementBadge key={a.key} achievement={a} />)}
          </div>
        </div>
      )}
    </div>
  )
}
