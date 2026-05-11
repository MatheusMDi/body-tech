import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { formatLoggedAt } from '../lib/utils.js'
import { FLAGS } from '../lib/constants.js'
import { useToast } from '../contexts/ToastContext.jsx'
import Modal from './Modal.jsx'
import MealModal from './MealModal.jsx'

const ALL_FLAGS = { ...FLAGS.AUTO, ...FLAGS.MANUAL }

function FlagChip({ flagId }) {
  const flag = ALL_FLAGS[flagId]
  if (!flag) return <span className="badge-tag">{flagId}</span>

  const colorMap = {
    error: 'border-error text-error',
    warning: 'border-warning text-warning',
    success: 'border-primary text-primary',
    mute: 'border-hairline-strong text-stone',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-sm text-[10px] font-bold uppercase ${colorMap[flag.color] || 'border-hairline-strong text-stone'}`}>
      {flag.emoji} {flag.label}
    </span>
  )
}

function DeleteConfirmModal({ meal, onConfirm, onCancel }) {
  return (
    <Modal title="Confirmar exclusão" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-theme text-[15px]">Excluir <strong>"{meal.description}"</strong>?</p>
        <p className="text-theme-faint text-[13px]">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-outline-dark flex-1">Cancelar</button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-error text-on-dark font-bold py-[11px] rounded-sm text-[16px]"
          >
            Excluir
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function MealTimeline({ meals, totals, userId, onRefresh }) {
  const { showToast } = useToast()
  const [editMeal, setEditMeal] = useState(null)
  const [deleteMeal, setDeleteMeal] = useState(null)

  async function handleDelete(meal) {
    await supabase.from('meals').delete().eq('id', meal.id)
    setDeleteMeal(null)
    showToast('Refeição excluída', 'info')
    onRefresh?.()
  }

  if (!meals || meals.length === 0) {
    return (
      <div
        className="border rounded-sm px-6 py-8 text-center"
        style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
      >
        <div className="text-[32px] mb-2">🍽️</div>
        <div className="text-theme-faint text-[14px]">Nenhuma refeição registrada hoje</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {meals.filter(m => !m.is_water).map((meal, i) => {
          const mealFlags = meal.meal_flags?.map(f => f.flag) ?? []
          const hasNegativeFlag = mealFlags.some(f => ['ALCOOL', 'ACUCAR', 'ULTRAPROCESSADO', 'FORA_DA_JANELA'].includes(f))

          return (
            <div
              key={meal.id}
              className="relative rounded-sm p-4 overflow-hidden border"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: hasNegativeFlag ? '#df6500' : 'var(--theme-border)',
              }}
            >
              {i === 0 && <div className="corner-square top-0 left-0" />}

              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold text-[13px]">{formatLoggedAt(meal.logged_at)}</span>
                  {meal.is_outside_window && (
                    <span className="badge-tag border border-warning text-warning">Fora da janela</span>
                  )}
                </div>
                {/* Edit / delete actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditMeal(meal)}
                    className="p-1.5 text-theme-faint hover:text-primary transition-colors rounded-sm"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="square" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteMeal(meal)}
                    className="p-1.5 text-theme-faint hover:text-error transition-colors rounded-sm"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="square" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="text-theme font-bold text-[15px] mb-2">{meal.description}</div>

              <div className="flex gap-4 text-[12px] mb-2">
                {meal.protein_g > 0 && <span className="text-primary">🥩 {meal.protein_g}g prot</span>}
                {meal.carb_g > 0 && <span className="text-warning">🍚 {meal.carb_g}g carb</span>}
                {meal.water_ml > 0 && <span style={{ color: '#0046a4' }}>💧 {meal.water_ml}ml</span>}
              </div>

              {mealFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mealFlags.map(f => <FlagChip key={f} flagId={f} />)}
                </div>
              )}
            </div>
          )
        })}

        {/* Daily totals */}
        {totals && (
          <div
            className="border border-primary rounded-sm px-4 py-3 flex gap-6"
            style={{ backgroundColor: 'var(--theme-surface)' }}
          >
            <div>
              <span className="text-theme-faint uppercase tracking-wide text-[10px] font-bold block">Total Proteína</span>
              <span className="text-primary font-bold text-[18px]">{Math.round(totals.protein_g)}g</span>
            </div>
            <div>
              <span className="text-theme-faint uppercase tracking-wide text-[10px] font-bold block">Total Água</span>
              <span className="text-theme font-bold text-[18px]">{(totals.water_ml / 1000).toFixed(1)}L</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editMeal && (
        <MealModal
          userId={userId}
          onClose={() => { setEditMeal(null); onRefresh?.() }}
          initialData={{
            description: editMeal.description,
            protein_g: editMeal.protein_g,
            carb_g: editMeal.carb_g,
            flags: editMeal.meal_flags?.map(f => f.flag) ?? [],
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteMeal && (
        <DeleteConfirmModal
          meal={deleteMeal}
          onConfirm={() => handleDelete(deleteMeal)}
          onCancel={() => setDeleteMeal(null)}
        />
      )}
    </>
  )
}
