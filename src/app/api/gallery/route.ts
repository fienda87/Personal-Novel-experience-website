import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function mapGallery(raw: Record<string, unknown>) {
  return {
    id: raw.id,
    character_id: raw.character_id as string ?? '',
    url: raw.image_url as string ?? raw.url as string ?? '',
    image_url: raw.image_url as string ?? '',
    caption: raw.label as string ?? raw.caption as string ?? '',
    label: raw.label as string ?? '',
    createdAt: raw.created_at as string ?? raw.createdAt as string ?? '',
  }
}

export async function GET() {
  const { data } = await supabase.from('gallery').select('*')
  return NextResponse.json((data ?? []).map((g: Record<string, unknown>) => mapGallery(g)))
}

export async function POST(request: Request) {
  const body = await request.json()
  const { data, error } = await supabase.from('gallery').insert({
    id: Date.now().toString(),
    character_id: body.character_id ?? '',
    image_url: body.image_url ?? body.url ?? '',
    label: body.label ?? body.caption ?? '',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapGallery(data as Record<string, unknown>), { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('gallery').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
