import { useState, useEffect } from 'react'
import Modal from './Modal.jsx'
import FlagSelector from './FlagSelector.jsx'
import PhotoUpload from './meal/PhotoUpload.jsx'
import { useMeals } from '../hooks/useMeals.js'
import { useToast } from '../contexts/ToastContext.jsx'
import { getFavorites, upsertFavorite } from '../services/favorites.js'
import { uploadMealPhoto, deleteMealPhoto } from '../services/photoUpload.js'
import { isOutsideWindow, todayDateString } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

export default function MealModal({ userId, onClose, initialData = null }) {
  const { addMeal } = useMeals(userId, todayDateString())
  const { showToast } = useToast()

  const [description, setDescription] = useState(initialData?.description ?? '')
  const [protein, setProtein] = useState(initialData?.protein_g ? String(initialData.protein_g) : '')
  const [carbs, setCarbs] = useState(initialData?.carb_g ? String(initialData.carb_g) : '')
  const [flags, setFlags] = useState(initialData?.flags ?? [])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'confirm'
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo_url ?? null)
  const [removedPhoto, setRemovedPhoto] = useState(false)

  const outsideWindow = isOutsideWindow()

  useEffect(() => {
    getFavorites(userId).then(setFavorites)
  }, [userId])

  function fillFromFavorite(fav) {
    setDescription(fav.description)
    setProtein(fav.protein_g ? String(fav.protein_g) : '')
    setCarbs(fav.carb_g ? String(fav.carb_g) : '')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (outsideWindow && step === 'form') { setStep('confirm'); return }
    submit()
  }

  async function submit() {
    setLoading(true)
    const allFlags = outsideWindow ? [...flags, 'FORA_DA_JANELA'] : flags
    const proteinNum = parseFloat(protein) || 0
    const carbNum = parseFloat(carbs) || 0

    let photoPath = initialData?.photo_path ?? null
    let photoUrl = initialData?.photo_url ?? null

    if (removedPhoto && photoPath) {
      await deleteMealPhoto(photoPath)
      photoPath = null
      photoUrl = null
    }

    if (photoFile) {
      try {
        photoPath = await uploadMealPhoto(photoFile, userId)
        photoUrl = photoPreview
      } catch {
        showToast('Foto não pôde ser enviada', 'warning')
      }
    }

    await addMeal({
      description,
      protein_g: proteinNum,
      carb_g: carbNum,
      water_ml: 0,
      flags: allFlags,
      is_outside_window: outsideWindow,
      is_water: false,
      photo_path: photoPath,
      photo_url: photoUrl,
    })

    await upsertFavorite(userId, { description, protein_g: proteinNum, carb_g: carbNum })

    showToast('Refeição registrada', 'success')
    setLoading(false)
    onClose()
  }

  if (step === 'confirm') {
    return (
      <Modal title="⚠️ Confirmar" onClose={onClose}>
        <div className="space-y-4">
          <p className="text-theme text-[15px]">
            Você está em <strong>jejum ativo</strong>. Janela abre às{' '}
            <strong className="text-primary">{PROTOCOL.FASTING_END_HOUR}:00</strong>.
          </p>
          <p className="text-[13px] text-theme-muted">
            A refeição será marcada como <span className="text-warning font-bold">FORA_DA_JANELA</span>.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setStep('form')} className="btn-outline-dark flex-1">Voltar</button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 bg-error text-on-dark font-bold py-[11px] rounded-sm text-[16px]"
            >
              {loading ? 'Salvando...' : 'Confirmar mesmo assim'}
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="🍽️ Refeição" onClose={onClose}>
      {/* Favorites / recents */}
      {favorites.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-theme-faint mb-2">Recentes</div>
          <div className="flex flex-wrap gap-2">
            {favorites.map(fav => (
              <button
                key={fav.id}
                onClick={() => fillFromFavorite(fav)}
                className="px-3 py-1.5 border rounded-sm text-[12px] font-bold text-theme-muted transition-colors active:border-primary active:text-primary"
                style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface-soft)' }}
              >
                {fav.description}
              </button>
            ))}
          </div>
        </div>
      )}

      {outsideWindow && (
        <div className="border border-warning rounded-sm px-4 py-3 text-[13px] text-warning font-bold mb-4">
          ⚠️ Jejum ativo — janela abre às {PROTOCOL.FASTING_END_HOUR}:00
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
            Descrição *
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Frango + batata doce + salada"
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
              Proteína (g)
            </label>
            <input
              type="number"
              value={protein}
              onChange={e => setProtein(e.target.value)}
              placeholder="0"
              min="0" max="500"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
              Carboidrato (g)
            </label>
            <input
              type="number"
              value={carbs}
              onChange={e => setCarbs(e.target.value)}
              placeholder="0"
              min="0" max="500"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
            Flags
          </label>
          <FlagSelector selected={flags} onChange={setFlags} />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-theme-faint mb-2">
            Foto (opcional)
          </label>
          <PhotoUpload
            value={photoPreview}
            onChange={(file, preview) => { setPhotoFile(file); setPhotoPreview(preview); setRemovedPhoto(false) }}
            onRemove={() => { setPhotoFile(null); setPhotoPreview(null); setRemovedPhoto(true) }}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-outline-dark flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Salvando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
