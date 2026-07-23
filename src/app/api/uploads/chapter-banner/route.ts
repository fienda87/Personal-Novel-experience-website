import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing image file' }, { status: 400 })
  }

  const extension = allowedTypes.get(file.type)
  if (!extension) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are supported' }, { status: 400 })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chapter-banners')
  await fs.mkdir(uploadDir, { recursive: true })

  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'chapter-banner'
  const fileName = `${Date.now()}-${safeName}.${extension}`
  const filePath = path.join(uploadDir, fileName)

  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/chapter-banners/${fileName}` }, { status: 201 })
}
