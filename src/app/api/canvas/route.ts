import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase.from('canvas').select('*').single()
  if (!data) return NextResponse.json({ nodes: [], edges: [] })
  const parsed = data as Record<string, unknown>
  return NextResponse.json({
    nodes: typeof parsed.nodes === 'string' ? JSON.parse(parsed.nodes as string) : (parsed.nodes ?? []),
    edges: typeof parsed.edges === 'string' ? JSON.parse(parsed.edges as string) : (parsed.edges ?? []),
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { error } = await supabase.from('canvas').upsert({
    id: 'canvas-v1',
    nodes: JSON.stringify(body.nodes ?? []),
    edges: JSON.stringify(body.edges ?? []),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync canvas nodes → entities
  for (const node of (body.nodes ?? []) as { id: string; data: Record<string, unknown> }[]) {
    const d = node.data

    const { data: existing } = await supabase.from('entities').select('*').eq('id', node.id).maybeSingle()

    const entity: Record<string, unknown> = {
      id: node.id,
      name: d.label,
      type: d.type,
      image_url: (d.imageUrl as string) || '',
      snippet: (d.snippet as string) || ((existing as Record<string, unknown>)?.snippet as string) || '',
      tags: JSON.stringify(d.tags || (existing as Record<string, unknown>)?.tags || []),
    }

    if (d.type === 'character') {
      entity.strength = d.strength ?? (existing as Record<string, unknown>)?.strength ?? 10
      entity.agility = d.agility ?? (existing as Record<string, unknown>)?.agility ?? 10
      entity.intelligence = d.intelligence ?? (existing as Record<string, unknown>)?.intelligence ?? 10
      entity.charisma = d.charisma ?? (existing as Record<string, unknown>)?.charisma ?? 10
      entity.wisdom = d.wisdom ?? (existing as Record<string, unknown>)?.wisdom ?? 10
      entity.vitality = d.vitality ?? (existing as Record<string, unknown>)?.vitality ?? 10
    }
    if (d.type === 'location') {
      entity.faction = d.faction ?? (existing as Record<string, unknown>)?.faction ?? ''
      entity.city = d.city ?? (existing as Record<string, unknown>)?.city ?? ''
    }
    if (d.type === 'item') {
      entity.rarity = d.rarity ?? (existing as Record<string, unknown>)?.rarity ?? ''
    }

    await supabase.from('entities').upsert(entity)
  }

  return NextResponse.json({ ok: true })
}
