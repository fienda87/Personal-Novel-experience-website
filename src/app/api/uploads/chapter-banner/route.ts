import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing image file' }, { status: 400 })
  }

  const extension = allowedTypes.get(file.type)
  if (!extension) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are supported' }, { status: 400 })
  }

  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from('chapter-banners').upload(fileName, buffer, {
    contentType: file.type,
    cacheControl: '3600',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('chapter-banners').getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl }, { status: 201 })
}
