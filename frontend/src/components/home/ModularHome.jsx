import { useModules } from '../../contexts/ModuleContext.jsx'
import { useModal } from '../../contexts/ModalContext.jsx'
import { useSettings } from '../../contexts/SettingsContext.jsx'
import { useMeals } from '../../hooks/useMeals.js'
import { useChecklist } from '../../hooks/useChecklist.js'
import { pct, mlToLiters, todayDateString } from '../../lib/utils.js'
import FastingStatus from '../FastingStatus.jsx'
import DailyChecklist from '../DailyChecklist.jsx'
import MetricCard from '../MetricCard.jsx'
import MealTimeline from '../MealTimeline.jsx'
import DailyScore from '../rules/DailyScore.jsx'
import CardCycleStatus from './cards/CardCycleStatus.jsx'
import CardFastingTimer from './cards/CardFastingTimer.jsx'
import CardTodayTimeline from './cards/CardTodayTimeline.jsx'
import CardWodToday from './cards/CardWodToday.jsx'

export default function ModularHome({ user }) {
  const { isModuleActive } = useModules()
  const { openModal } = useModal()
  const { settings } = useSettings()
  const { meals, totals, refresh } = useMeals(user?.id, todayDateString())
  const { checklist, completedCount, totalCount, markTreino, markCaminhada } = useChecklist(user?.id, totals)

  const proteinPct = pct(totals.protein_g, settings.proteinGoalG)
  const waterPct   = pct(totals.water_ml,  settings.waterGoalMl)

  return (
    <div className="space-y-4">
      {/* Fasting hero */}
      {isModuleActive('fasting') && <FastingStatus />}

      {/* Quick metrics */}
      <div className="grid grid-cols-2 gap-3">
        {isModuleActive('nutrition') && (
          <MetricCard
            label="Proteína" value={Math.round(totals.protein_g)} unit="g"
            goal={settings.proteinGoalG} pct={proteinPct} emoji="🥩"
          />
        )}
        {isModuleActive('water') && (
          <MetricCard
            label="Água" value={mlToLiters(totals.water_ml)} unit="L"
            goal={`${settings.waterGoalL.toFixed(1)}L`} pct={waterPct} emoji="💧"
          />
        )}
      </div>

      {/* Active cycle status */}
      {isModuleActive('cycles') && <CardCycleStatus userId={user?.id} />}

      {/* Today's WOD */}
      {isModuleActive('workout') && <CardWodToday userId={user?.id} />}

      {/* Daily score */}
      {isModuleActive('score') && <DailyScore userId={user?.id} />}

      {/* Log meal CTA */}
      <button
        onClick={() => openModal('meal')}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
        Registrar Refeição
      </button>

      {/* Daily checklist */}
      <DailyChecklist
        checklist={checklist}
        onMarkTreino={markTreino}
        onMarkCaminhada={markCaminhada}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Today's meals */}
      {isModuleActive('nutrition') && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-text-faint)' }}>
            Refeições de Hoje
          </div>
          <MealTimeline
            meals={meals}
            totals={totals}
            userId={user?.id}
            onRefresh={refresh}
          />
        </div>
      )}
    </div>
  )
}
