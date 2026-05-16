// src/lib/upload.ts
import { createServerFn } from '@tanstack/react-start'
import { supabase } from './supabase'

export const uploadPhoto = createServerFn({ method: 'POST' })
  .inputValidator((data: { base64: string; filename: string; mimeType: string }) => data)
  .handler(async ({ data }) => {
    const base64 = data.base64.replace(/^data:.+;base64,/, '')
    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    
    const filename = `${crypto.randomUUID()}-${data.filename}`
    
    const { error } = await supabase.storage
      .from('mosque-photos')
      .upload(filename, buffer, {
        contentType: data.mimeType,
        upsert: false,
      })

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = supabase.storage
      .from('mosque-photos')
      .getPublicUrl(filename)

    return publicUrl
  })