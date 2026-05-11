import FastingStatus from '../components/FastingStatus.jsx'
import DailyChecklist from '../components/DailyChecklist.jsx'
import MetricCard from '../components/MetricCard.jsx'
import MealTimeline from '../components/MealTimeline.jsx'
import { useModal } from '../contexts/ModalContext.jsx'
import { useMeals } from '../hooks/useMeals.js'
import { useChecklist } from '../hooks/useChecklist.js'
import { pct, mlToLiters, todayDateString } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

export default function Home({ user }) {
  const { openModal } = useModal()
  const { meals, totals, refresh } = useMeals(user?.id, todayDateString())
  const { checklist, completedCount, totalCount, markTreino, markCaminhada } = useChecklist(user?.id, totals)

  const proteinPct = pct(totals.protein_g, PROTOCOL.PROTEIN_GOAL_G)
  const waterPct = pct(totals.water_ml, PROTOCOL.WATER_GOAL_ML)

  return (
    <div className="space-y-4">
      {/* Fasting status — hero card */}
      <FastingStatus />

      {/* Quick metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Proteína" value={Math.round(totals.protein_g)} unit="g"
          goal={PROTOCOL.PROTEIN_GOAL_G} pct={proteinPct} emoji="🥩"
        />
        <MetricCard
          label="Água" value={mlToLiters(totals.water_ml)} unit="L"
          goal={`${PROTOCOL.WATER_GOAL_ML / 1000}L`} pct={waterPct} emoji="💧"
        />
      </div>

      {/* Log meal CTA */}
      <button
        onClick={() => openModal('meal')}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="square" d="M12 5v14M5 12h14" />
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
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-theme-faint mb-3">
          Refeições de Hoje
        </div>
        <MealTimeline
          meals={meals}
          totals={totals}
          userId={user?.id}
          onRefresh={refresh}
        />
      </div>
    </div>
  )
}
