import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const allowedTypes = new Map([
  ['audio/mpeg', 'mp3'],
  ['audio/mp3', 'mp3'],
  ['audio/wav', 'wav'],
  ['audio/ogg', 'ogg'],
  ['audio/mp4', 'm4a'],
  ['audio/x-m4a', 'm4a'],
  ['audio/webm', 'webm'],
])

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing audio file' }, { status: 400 })
  }

  const extension = allowedTypes.get(file.type)
  if (!extension) {
    return NextResponse.json({ error: 'Only MP3, WAV, OGG, M4A, and WebM audio are supported' }, { status: 400 })
  }

  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from('audio').upload(fileName, buffer, {
    contentType: file.type,
    cacheControl: '3600',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl }, { status: 201 })
}
