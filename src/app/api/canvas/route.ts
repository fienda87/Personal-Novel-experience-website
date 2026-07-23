import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const canvasFile = path.join(process.cwd(), 'data', 'canvas.json')
const entitiesFile = path.join(process.cwd(), 'data', 'entities.json')

function readFile(file: string) {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

export async function GET() {
  return NextResponse.json(readFile(canvasFile) ?? { nodes: [], edges: [] })
}

export async function POST(request: Request) {
  const body = await request.json()
  fs.writeFileSync(canvasFile, JSON.stringify(body, null, 2))

  // Sync canvas nodes → entities.json
  const existingEntities: Record<string, unknown> = readFile(entitiesFile) ?? {}

  for (const node of (body.nodes ?? []) as { id: string; data: Record<string, unknown> }[]) {
    const d = node.data
    const existing = existingEntities[node.id] as Record<string, unknown> | undefined

    const entity: Record<string, unknown> = {
      id: node.id,
      name: d.label,
      type: d.type,
      imageUrl: d.imageUrl || '',
      snippet: d.snippet || (existing?.snippet as string) || '',
      tags: d.tags || (existing?.tags as string[]) || [],
    }

    if (d.type === 'character') {
      entity.strength = d.strength ?? (existing?.strength ?? 10)
      entity.agility = d.agility ?? (existing?.agility ?? 10)
      entity.intelligence = d.intelligence ?? (existing?.intelligence ?? 10)
      entity.charisma = d.charisma ?? (existing?.charisma ?? 10)
      entity.wisdom = d.wisdom ?? (existing?.wisdom ?? 10)
      entity.vitality = d.vitality ?? (existing?.vitality ?? 10)
    }
    if (d.type === 'location') {
      entity.faction = d.faction ?? (existing?.faction as string) ?? ''
      entity.city = d.city ?? (existing?.city as string) ?? ''
    }
    if (d.type === 'item') {
      entity.rarity = d.rarity ?? (existing?.rarity as string) ?? ''
    }

    existingEntities[node.id] = entity
  }

  fs.writeFileSync(entitiesFile, JSON.stringify(existingEntities, null, 2))

  return NextResponse.json({ ok: true })
}
