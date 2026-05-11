import { useState, useEffect, useRef } from 'react'
import { useModal } from '../contexts/ModalContext.jsx'

const FAB_ITEMS = [
  { key: 'meal',    emoji: '🍽️', label: 'Refeição' },
  { key: 'water',   emoji: '💧', label: 'Água' },
  { key: 'habits',  emoji: '✅', label: 'Hábito' },
  { key: 'measure', emoji: '📏', label: 'Medida' },
  { key: 'sleep',   emoji: '😴', label: 'Sono' },
]

export default function FAB() {
  const [open, setOpen] = useState(false)
  const { openModal } = useModal()
  const ref = useRef(null)

  useEffect(() => {
    function onOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [open])

  function handleItemClick(key) {
    setOpen(false)
    openModal(key)
  }

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {/* Menu items — appear above FAB */}
      {open && (
        <div className="absolute bottom-full mb-3 flex flex-col items-center gap-2 animate-scale-up">
          {FAB_ITEMS.map((item, i) => (
            <button
              key={item.key}
              onClick={() => handleItemClick(item.key)}
              className="flex items-center gap-2 px-3 py-2 rounded-sm border text-[12px] font-bold whitespace-nowrap shadow-sticky"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                animationDelay: `${i * 30}ms`,
              }}
            >
              <span className="text-[16px]">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center shadow-sticky transition-transform duration-200 active:scale-95"
        style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        aria-label="Menu rápido"
      >
        <svg className="w-6 h-6 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="square" d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}
