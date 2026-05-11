import { useState, useEffect, useCallback, Suspense } from 'react'
import { supabase } from '../../lib/supabase.js'
import { DEFAULT_LAYOUTS_BY_CYCLE, CYCLE_TYPE_EMOJI } from '../../constants/cyclePresets.js'
import HomeEditor from './HomeEditor.jsx'

// Card components
import CardFastingTimer from './cards/CardFastingTimer.jsx'
import CardTodayTimeline from './cards/CardTodayTimeline.jsx'
import CardCycleStatus from './cards/CardCycleStatus.jsx'
import CardWodToday from './cards/CardWodToday.jsx'
import CardScoreHero from './cards/CardScoreHero.jsx'
import CardWater from './cards/CardWater.jsx'
import CardProtein from './cards/CardProtein.jsx'
import CardSleep from './cards/CardSleep.jsx'
import CardStreak from './cards/CardStreak.jsx'
import CardWeight from './cards/CardWeight.jsx'
import CardNextMeal from './cards/CardNextMeal.jsx'
import CardSupplements from './cards/CardSupplements.jsx'
import CardRulesToday from './cards/CardRulesToday.jsx'
import CardCalories from './cards/CardCalories.jsx'
import CardWorkoutStreak from './cards/CardWorkoutStreak.jsx'

// ---------------------------------------------------------------------------
// Skeleton fallback for Suspense boundaries
// ---------------------------------------------------------------------------
function CardSkeleton({ size }) {
  return (
    <div
      className="card p-3 animate-pulse"
      style={{ minHeight: size === 'large' ? 120 : 96 }}
    >
      <div className="h-3 w-16 rounded" style={{ background: 'var(--theme-border)' }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Render a single card by id
// ---------------------------------------------------------------------------
function renderCard(card, userId) {
  const props = { key: card.id, userId, layout: card }

  switch (card.id) {
    case 'card_fasting_timer':
      return <CardFastingTimer {...props} />
    case 'card_today_timeline':
      return <CardTodayTimeline {...props} />
    case 'card_cycle_status':
      return <CardCycleStatus {...props} />
    case 'card_wod_today':
      return <CardWodToday {...props} />
    case 'card_score_hero':
      return <CardScoreHero {...props} />
    case 'card_water':
      return <CardWater {...props} />
    case 'card_protein':
      return <CardProtein {...props} />
    case 'card_sleep':
      return <CardSleep {...props} />
    case 'card_streak':
      return <CardStreak {...props} />
    case 'card_weight':
      return <CardWeight {...props} />
    case 'card_next_meal':
      return <CardNextMeal {...props} />
    case 'card_supplements':
      return <CardSupplements {...props} />
    case 'card_rules_today':
      return <CardRulesToday {...props} />
    case 'card_calories':
      return <CardCalories {...props} />
    case 'card_workout_streak':
      return <CardWorkoutStreak {...props} />
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Layout persistence helpers
// ---------------------------------------------------------------------------
async function loadLayoutFromDB(userId) {
  if (!userId) return null
  const { data } = await supabase
    .from('profiles')
    .select('home_layout')
    .eq('id', userId)
    .single()
  return data?.home_layout ?? null
}

async function saveLayoutToDB(userId, layout) {
  if (!userId) return
  await supabase
    .from('profiles')
    .update({ home_layout: layout })
    .eq('id', userId)
}

async function loadActiveCycle(userId) {
  if (!userId) return null
  const { data } = await supabase
    .from('protocol_cycles')
    .select('id, name, type, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  return data ?? null
}

// ---------------------------------------------------------------------------
// LayoutRenderer — handles mixed large/small card rendering
// ---------------------------------------------------------------------------
function LayoutRenderer({ sortedLayout, userId }) {
  // Build segments: consecutive small cards become a 2-col grid; large cards are full-width
  const segments = []
  let smallBuffer = []

  function flushSmall() {
    if (smallBuffer.length > 0) {
      segments.push({ type: 'small-grid', cards: [...smallBuffer] })
      smallBuffer = []
    }
  }

  for (const card of sortedLayout) {
    if (card.size === 'large') {
      flushSmall()
      segments.push({ type: 'large', card })
    } else {
      smallBuffer.push(card)
    }
  }
  flushSmall()

  return (
    <div className="flex flex-col gap-3">
      {segments.map((seg, i) => {
        if (seg.type === 'large') {
          return (
            <Suspense key={seg.card.id} fallback={<CardSkeleton size="large" />}>
              {renderCard(seg.card, userId)}
            </Suspense>
          )
        }

        // 2-col grid for small cards
        return (
          <div key={`grid-${i}`} className="grid grid-cols-2 gap-3">
            {seg.cards.map(card => (
              <Suspense key={card.id} fallback={<CardSkeleton size="small" />}>
                {renderCard(card, userId)}
              </Suspense>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ModularHome
// ---------------------------------------------------------------------------
export default function ModularHome({ user }) {
  const userId = user?.id

  const [layout, setLayout] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [activeCycle, setActiveCycle] = useState(null)
  const [cyclePrompt, setCyclePrompt] = useState(null)
  const [layoutReady, setLayoutReady] = useState(false)

  // Load layout + active cycle on mount
  useEffect(() => {
    if (!userId) {
      setLayout(DEFAULT_LAYOUTS_BY_CYCLE.default)
      setLayoutReady(true)
      return
    }

    let cancelled = false

    async function init() {
      const [savedLayout, cycle] = await Promise.all([
        loadLayoutFromDB(userId),
        loadActiveCycle(userId),
      ])

      if (cancelled) return

      setActiveCycle(cycle)

      if (savedLayout && Array.isArray(savedLayout) && savedLayout.length > 0) {
        setLayout(savedLayout)
        // Show cycle-layout prompt once per cycle (tracked in sessionStorage)
        if (cycle) {
          const promptKey = `cycle_layout_prompt_${cycle.id}`
          const alreadyShown = sessionStorage.getItem(promptKey)
          if (!alreadyShown) {
            setCyclePrompt({ cycle })
          }
        }
      } else {
        // No saved layout — apply cycle preset if available
        const cycleType = cycle?.type ?? 'default'
        const preset = DEFAULT_LAYOUTS_BY_CYCLE[cycleType] ?? DEFAULT_LAYOUTS_BY_CYCLE.default
        setLayout(preset)
      }

      setLayoutReady(true)
    }

    init()
    return () => { cancelled = true }
  }, [userId])

  const handleSaveLayout = useCallback(async (newLayout) => {
    setLayout(newLayout)
    setEditMode(false)
    await saveLayoutToDB(userId, newLayout)
  }, [userId])

  function handleApplyCycleLayout() {
    const cycleType = activeCycle?.type ?? 'default'
    const preset = DEFAULT_LAYOUTS_BY_CYCLE[cycleType] ?? DEFAULT_LAYOUTS_BY_CYCLE.default
    setLayout(preset)
    saveLayoutToDB(userId, preset)
    dismissCyclePrompt()
  }

  function dismissCyclePrompt() {
    if (cyclePrompt?.cycle?.id) {
      sessionStorage.setItem(`cycle_layout_prompt_${cyclePrompt.cycle.id}`, '1')
    }
    setCyclePrompt(null)
  }

  // Sorted visible layout
  const sortedLayout = layout
    ? [...layout].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : DEFAULT_LAYOUTS_BY_CYCLE.default

  if (!layoutReady) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-4 animate-pulse" style={{ minHeight: 96 }}>
            <div className="h-3 w-20 rounded" style={{ background: 'var(--theme-border)' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pb-24">
      {/* Section header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h1 className="text-[20px] font-black" style={{ color: 'var(--theme-text)' }}>
            Olá{user?.user_metadata?.name ? `, ${user.user_metadata.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--theme-text-faint)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--theme-surface-soft)', color: 'var(--theme-text-muted)' }}
          >
            ✏️ Editar
          </button>
        )}
      </div>

      {/* Cycle layout prompt */}
      {!editMode && cyclePrompt && (
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: '#76b90015', border: '1px solid #76b90033' }}
        >
          <div className="flex items-start gap-2">
            <span className="text-xl">{CYCLE_TYPE_EMOJI[cyclePrompt.cycle.type] ?? '🎯'}</span>
            <div>
              <div className="text-[13px] font-bold" style={{ color: 'var(--theme-text)' }}>
                Ciclo ativo: {cyclePrompt.cycle.name || cyclePrompt.cycle.type}
              </div>
              <div className="text-[12px]" style={{ color: 'var(--theme-text-muted)' }}>
                Deseja ajustar os cards para este ciclo?
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyCycleLayout}
              className="btn-primary text-[12px] px-4 py-2 rounded-lg flex-1"
            >
              Sim, ajustar
            </button>
            <button
              onClick={dismissCyclePrompt}
              className="btn-outline-dark text-[12px] px-4 py-2 rounded-lg flex-1"
            >
              Manter meu layout
            </button>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editMode ? (
        <HomeEditor
          layout={sortedLayout}
          onSave={handleSaveLayout}
          onCancel={() => setEditMode(false)}
          userId={userId}
        />
      ) : (
        <LayoutRenderer sortedLayout={sortedLayout} userId={userId} />
      )}
    </div>
  )
}
