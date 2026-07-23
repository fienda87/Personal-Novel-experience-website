import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabase.from('characters').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  }

  const { data } = await supabase.from('characters').select('*')
  return NextResponse.json(data ?? [])
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
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('characters').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
