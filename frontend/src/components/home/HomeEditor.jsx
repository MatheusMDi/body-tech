import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CardCatalog, { CARD_CATALOG } from './CardCatalog.jsx'
import { DEFAULT_LAYOUTS_BY_CYCLE } from '../../constants/cyclePresets.js'

function cardLabel(id) {
  return CARD_CATALOG.find(c => c.id === id)?.label ?? id
}

function cardIcon(id) {
  return CARD_CATALOG.find(c => c.id === id)?.icon ?? '📦'
}

function cardSize(id) {
  return CARD_CATALOG.find(c => c.id === id)?.size ?? 'small'
}

// ---------------------------------------------------------------------------
// Sortable item
// ---------------------------------------------------------------------------
function SortableCard({ card, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const size = cardSize(card.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        ...style,
        backgroundColor: 'var(--theme-surface-soft)',
      }}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-xl cursor-grab active:cursor-grabbing select-none"
        style={{ color: 'var(--theme-text-faint)', touchAction: 'none' }}
        aria-label="Arrastar"
      >
        ⠿
      </button>

      <span className="text-xl">{cardIcon(card.id)}</span>

      <div className="flex-1">
        <div className="text-[14px] font-semibold" style={{ color: 'var(--theme-text)' }}>
          {cardLabel(card.id)}
        </div>
      </div>

      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-2"
        style={{
          backgroundColor: size === 'large' ? '#76b90022' : 'var(--theme-border)',
          color: size === 'large' ? '#76b900' : 'var(--theme-text-muted)',
        }}
      >
        {size === 'large' ? 'LARGO' : 'PEQUENO'}
      </span>

      {/* Remove button */}
      <button
        onClick={() => onRemove(card.id)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: '#ef444422', color: '#ef4444' }}
        aria-label="Remover card"
      >
        ✕
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HomeEditor
// ---------------------------------------------------------------------------
export default function HomeEditor({ layout, onSave, onCancel, userId }) {
  const [items, setItems] = useState(() =>
    [...(layout ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )
  const [showCatalog, setShowCatalog] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id)
      const newIndex = prev.findIndex(i => i.id === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }))
    })
  }, [])

  function handleRemove(id) {
    setItems(prev => prev.filter(i => i.id !== id).map((item, idx) => ({ ...item, order: idx })))
  }

  function handleAdd(cardId) {
    const catalogEntry = CARD_CATALOG.find(c => c.id === cardId)
    if (!catalogEntry) return
    setItems(prev => [
      ...prev,
      { id: cardId, size: catalogEntry.size, order: prev.length },
    ])
    setShowCatalog(false)
  }

  function handleRestoreDefault() {
    const defaultLayout = DEFAULT_LAYOUTS_BY_CYCLE.default
    setItems([...defaultLayout].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
  }

  function handleSave() {
    onSave(items.map((item, idx) => ({ ...item, order: idx })))
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold" style={{ color: 'var(--theme-text)' }}>
          Editar Home
        </h2>
        <button
          onClick={onCancel}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: 'var(--theme-surface-soft)', color: 'var(--theme-text-muted)' }}
        >
          Cancelar
        </button>
      </div>

      <p className="text-[12px]" style={{ color: 'var(--theme-text-faint)' }}>
        Arraste para reordenar, toque em ✕ para remover.
      </p>

      {/* Sortable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map(card => (
              <SortableCard key={card.id} card={card} onRemove={handleRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add card button */}
      <button
        onClick={() => setShowCatalog(true)}
        className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border-2 border-dashed"
        style={{
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text-muted)',
          backgroundColor: 'transparent',
        }}
      >
        <span className="text-lg">＋</span>
        Adicionar card
      </button>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="btn-primary flex-1 py-3 text-sm font-bold rounded-xl"
        >
          Salvar layout
        </button>
        <button
          onClick={handleRestoreDefault}
          className="btn-outline-dark flex-1 py-3 text-sm font-semibold rounded-xl"
        >
          Restaurar padrão
        </button>
      </div>

      {/* Card catalog modal */}
      {showCatalog && (
        <CardCatalog
          onAdd={handleAdd}
          currentLayout={items}
          onClose={() => setShowCatalog(false)}
        />
      )}
    </div>
  )
}
