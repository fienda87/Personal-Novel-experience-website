import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function mapEntity(raw: Record<string, unknown>) {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    imageUrl: raw.image_url as string ?? '',
    snippet: raw.snippet ?? '',
    tags: typeof raw.tags === 'string' ? JSON.parse(raw.tags as string) : (raw.tags ?? []),
    strength: raw.strength,
    agility: raw.agility,
    intelligence: raw.intelligence,
    charisma: raw.charisma,
    wisdom: raw.wisdom,
    vitality: raw.vitality,
    faction: raw.faction ?? '',
    city: raw.city ?? '',
    rarity: raw.rarity ?? '',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabase.from('entities').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(mapEntity(data as Record<string, unknown>))
  }

  const { data } = await supabase.from('entities').select('*')
  return NextResponse.json((data ?? []).map((e: Record<string, unknown>) => mapEntity(e)))
}
