import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const allowedTypes = new Map([
  ['audio/mpeg', 'mp3'],
  ['audio/mp3', 'mp3'],
  ['audio/wav', 'wav'],
  ['audio/ogg', 'ogg'],
  ['audio/mp4', 'm4a'],
  ['audio/x-m4a', 'm4a'],
  ['audio/webm', 'webm'],
])

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing audio file' }, { status: 400 })
  }

  const extension = allowedTypes.get(file.type)
  if (!extension) {
    return NextResponse.json({ error: 'Only MP3, WAV, OGG, M4A, and WebM audio are supported' }, { status: 400 })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio')
  await fs.mkdir(uploadDir, { recursive: true })

  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`
  const filePath = path.join(uploadDir, fileName)

  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/audio/${fileName}` }, { status: 201 })
}
