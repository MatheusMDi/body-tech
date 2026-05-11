import { useEffect } from 'react'

export default function Modal({ title, children, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderTop: '1px solid var(--theme-border)',
          borderRadius: '24px 24px 0 0',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)', borderRadius: '24px 24px 0 0' }}
        >
          <span className="text-[16px] font-bold" style={{ color: 'var(--theme-text)' }}>{title}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'var(--theme-text-faint)', backgroundColor: 'var(--theme-surface-soft)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
