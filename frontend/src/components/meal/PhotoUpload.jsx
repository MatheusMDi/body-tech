import { useRef, useState } from 'react'
import { compressImage } from '../../services/photoUpload.js'

export default function PhotoUpload({ value, onChange, onRemove }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(value ?? null)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setCompressing(true)
    try {
      const compressed = await compressImage(file)
      const url = URL.createObjectURL(compressed)
      setPreview(url)
      onChange(compressed, url)
    } catch (err) {
      setError('Não foi possível processar a imagem')
    } finally {
      setCompressing(false)
      e.target.value = ''
    }
  }

  function handleRemove() {
    setPreview(null)
    onRemove?.()
  }

  if (preview) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-sm overflow-hidden border shrink-0" style={{ borderColor: 'var(--theme-border)' }}>
          <img src={preview} alt="Foto do prato" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[12px] font-bold text-primary"
          >
            Trocar foto
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[12px] font-bold"
            style={{ color: 'var(--theme-text-faint)' }}
          >
            Remover
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={compressing}
        className="flex items-center gap-2 px-4 py-2.5 rounded-sm border text-[13px] font-bold transition-colors"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text-muted)' }}
      >
        <span>{compressing ? '⏳' : '📷'}</span>
        <span>{compressing ? 'Processando...' : 'Adicionar foto'}</span>
      </button>
      {error && <p className="text-[11px] mt-1.5" style={{ color: '#c94040' }}>{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
    </div>
  )
}
