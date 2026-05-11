import { supabase } from '../lib/supabase.js'

const MAX_DIMENSION = 800
const MAX_BYTES = 400 * 1024
const JPEG_QUALITY = 0.75
const PHOTO_LIMIT = 50

export async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        } else {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      let quality = JPEG_QUALITY
      const tryBlob = (q) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Falha ao comprimir imagem')); return }
            if (blob.size > MAX_BYTES && q > 0.3) {
              tryBlob(q - 0.1)
            } else {
              resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
            }
          },
          'image/jpeg',
          q
        )
      }
      tryBlob(quality)
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida')) }
    img.src = url
  })
}

export async function enforcePhotoLimit(userId) {
  const { data: objects } = await supabase
    .storage
    .from('meal-photos')
    .list(`${userId}`, { sortBy: { column: 'created_at', order: 'asc' } })

  if (!objects || objects.length < PHOTO_LIMIT) return

  const toDelete = objects.slice(0, objects.length - PHOTO_LIMIT + 1)
  const paths = toDelete.map(o => `${userId}/${o.name}`)
  await supabase.storage.from('meal-photos').remove(paths)
}

export async function uploadMealPhoto(file, userId) {
  await enforcePhotoLimit(userId)

  const compressed = await compressImage(file)
  const ext = 'jpg'
  const filename = `${Date.now()}.${ext}`
  const path = `${userId}/${filename}`

  const { error } = await supabase.storage
    .from('meal-photos')
    .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })

  if (error) throw error
  return path
}

export async function deleteMealPhoto(photoPath) {
  if (!photoPath) return
  await supabase.storage.from('meal-photos').remove([photoPath])
}

export async function getPhotoUrl(photoPath) {
  if (!photoPath) return null
  const { data } = await supabase.storage
    .from('meal-photos')
    .createSignedUrl(photoPath, 3600)
  return data?.signedUrl ?? null
}
