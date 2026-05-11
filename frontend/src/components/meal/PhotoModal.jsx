import { useEffect } from 'react'

export default function PhotoModal({ src, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-sm border text-[20px]"
        style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        ×
      </button>
      <img
        src={src}
        alt="Foto do prato"
        className="max-w-full max-h-[90vh] object-contain rounded-sm"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}
