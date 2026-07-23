import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'gallery.json')

interface GalleryItem {
  id: string
  url: string
  caption: string
  alt: string
  tags: string[]
  createdAt: string
}

function readData(): GalleryItem[] {
  if (!fs.existsSync(dataFile)) return []
  return JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
}

function writeData(data: GalleryItem[]) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
}

export async function GET() {
  return NextResponse.json(readData())
}

export async function POST(request: Request) {
  const body = await request.json()
  const data = readData()
  const item: GalleryItem = {
    id: Date.now().toString(),
    url: body.url,
    caption: body.caption || '',
    alt: body.alt || '',
    tags: body.tags || [],
    createdAt: new Date().toISOString(),
  }
  data.push(item)
  writeData(data)
  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const data = readData()
  writeData(data.filter((item) => item.id !== id))
  return NextResponse.json({ success: true })
}
