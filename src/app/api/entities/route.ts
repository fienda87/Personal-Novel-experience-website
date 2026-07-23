import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabase.from('entities').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  }

  const { data } = await supabase.from('entities').select('*')
  return NextResponse.json(data ?? [])
}
