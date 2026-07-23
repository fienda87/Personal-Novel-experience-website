import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function mapChar(raw: Record<string, unknown>) {
  return {
    id: raw.id,
    name: raw.name,
    title: raw.title,
    role: raw.role,
    faction: raw.faction,
    city: raw.city,
    imageUrl: raw.image_url as string ?? '',
    description: raw.description,
    lore: raw.lore,
    stats: typeof raw.stats === 'string' ? JSON.parse(raw.stats as string) : (raw.stats ?? {}),
    tags: typeof raw.tags === 'string' ? JSON.parse(raw.tags as string) : (raw.tags ?? []),
    relationships: typeof raw.relationships === 'string' ? JSON.parse(raw.relationships as string) : (raw.relationships ?? []),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabase.from('characters').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(mapChar(data as Record<string, unknown>))
  }

  const { data } = await supabase.from('characters').select('*')
  return NextResponse.json((data ?? []).map((ch: Record<string, unknown>) => mapChar(ch)))
}

export async function POST(request: Request) {
  const body = await request.json()
  const { data, error } = await supabase.from('characters').upsert({
    id: body.id,
    name: body.name,
    title: body.title ?? '',
    role: body.role ?? '',
    faction: body.faction ?? '',
    city: body.city ?? '',
    image_url: body.imageUrl ?? '',
    description: body.description ?? '',
    lore: body.lore ?? '',
    stats: JSON.stringify(body.stats ?? {}),
    tags: JSON.stringify(body.tags ?? []),
    relationships: JSON.stringify(body.relationships ?? []),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapChar(data as Record<string, unknown>), { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('characters').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
