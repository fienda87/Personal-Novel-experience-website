import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'chapters.json')

type ChapterRecord = {
  id: string
  title: string
  number: number
  bannerUrl?: string
  content: unknown[]
  createdAt: string
  updatedAt: string
}

function readData(): Record<string, unknown> {
  if (!fs.existsSync(dataFile)) return {}
  return JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
}

function writeData(data: Record<string, unknown>) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
}

function normalizeChapter(body: Partial<ChapterRecord>, existing?: Partial<ChapterRecord>): ChapterRecord {
  const now = new Date().toISOString()
  const id = body.id ?? existing?.id ?? Date.now().toString()

  return {
    id,
    title: body.title ?? existing?.title ?? 'Untitled',
    number: body.number ?? existing?.number ?? 1,
    bannerUrl: body.bannerUrl?.trim() ?? existing?.bannerUrl ?? '',
    content: body.content ?? existing?.content ?? [],
    createdAt: existing?.createdAt ?? body.createdAt ?? now,
    updatedAt: now,
  }
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

export async function POST(request: Request) {
  const body = await request.json()
  const data = readData() as Record<string, unknown>
  const chapter = normalizeChapter(body)
  data[chapter.id] = chapter
  writeData(data)
  return NextResponse.json(chapter, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const data = readData() as Record<string, unknown>
  const { searchParams } = new URL(request.url)
  const id = body.id ?? searchParams.get('id')

  if (!id || !data[id]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const chapter = normalizeChapter({ ...body, id }, data[id] as Partial<ChapterRecord>)
  data[id] = chapter
  writeData(data)
  return NextResponse.json(chapter)
}

export async function PATCH(request: Request) {
  return PUT(request)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const data = readData() as Record<string, unknown>
  delete data[id]
  writeData(data)
  return NextResponse.json({ success: true })
}
