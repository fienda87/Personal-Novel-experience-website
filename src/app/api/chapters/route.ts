import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function parseChapter(ch: Record<string, unknown>) {
  if (typeof ch.content === 'string') {
    try { ch.content = JSON.parse(ch.content) } catch { ch.content = [] }
  }
  return ch
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabase.from('chapters').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(parseChapter(data as Record<string, unknown>))
  }

  const { data } = await supabase.from('chapters').select('*')
  return NextResponse.json((data ?? []).map((ch: Record<string, unknown>) => parseChapter(ch)))
}

export async function POST(request: Request) {
  const body = await request.json()
  const { data, error } = await supabase.from('chapters').upsert({
    id: body.id ?? Date.now().toString(),
    title: body.title || 'Untitled',
    number: body.number ?? 1,
    banner_url: body.bannerUrl?.trim() ?? '',
    content: JSON.stringify(body.content ?? []),
    createdAt: body.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const id = body.id

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await supabase.from('chapters').upsert({
    id,
    title: body.title,
    number: body.number,
    banner_url: body.bannerUrl?.trim() ?? '',
    content: JSON.stringify(body.content ?? []),
    createdAt: body.createdAt,
    updatedAt: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('chapters').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
