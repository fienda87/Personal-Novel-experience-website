import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'entities.json')

function readData(): Record<string, unknown> {
  if (!fs.existsSync(dataFile)) return {}
  return JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
}

export async function GET(request: Request) {
  const data = readData()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const entry = (data as Record<string, unknown>)[id]
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(entry)
  }
  return NextResponse.json(Object.values(data))
}
