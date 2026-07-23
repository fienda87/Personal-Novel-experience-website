import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  // Chapters
  const chaptersRaw = JSON.parse(readFileSync(join(root, 'data', 'chapters.json'), 'utf-8'))
  for (const ch of Object.values(chaptersRaw)) {
    const { content, bannerUrl, ...rest } = ch
    const { error } = await supabase.from('chapters').upsert({
      ...rest,
      banner_url: bannerUrl || '',
      content: JSON.stringify(content),
    }, { onConflict: 'id' })
    if (error) console.error('Chapter error:', rest.id, error.message)
    else console.log('✓ Chapter:', rest.id)
  }

  // Characters
  const charsRaw = JSON.parse(readFileSync(join(root, 'data', 'characters.json'), 'utf-8'))
  for (const ch of Object.values(charsRaw)) {
    const { imageUrl, stats, tags, relationships, ...rest } = ch
    const { error } = await supabase.from('characters').upsert({
      ...rest,
      image_url: imageUrl || '',
      stats: JSON.stringify(stats || {}),
      tags: JSON.stringify(tags || []),
      relationships: JSON.stringify(relationships || []),
    }, { onConflict: 'id' })
    if (error) console.error('Character error:', rest.id, error.message)
    else console.log('✓ Character:', rest.id)
  }

  // Entities
  const entitiesRaw = JSON.parse(readFileSync(join(root, 'data', 'entities.json'), 'utf-8'))
  for (const ent of Object.values(entitiesRaw)) {
    const { imageUrl, tags, ...rest } = ent
    const { error } = await supabase.from('entities').upsert({
      ...rest,
      image_url: imageUrl || '',
      tags: JSON.stringify(tags || []),
    }, { onConflict: 'id' })
    if (error) console.error('Entity error:', rest.id, error.message)
    else console.log('✓ Entity:', rest.id)
  }

  // Canvas
  const canvasRaw = JSON.parse(readFileSync(join(root, 'data', 'canvas.json'), 'utf-8'))
  const { error: canvasError } = await supabase.from('canvas').upsert({
    id: 'canvas-v1',
    nodes: JSON.stringify(canvasRaw.nodes || []),
    edges: JSON.stringify(canvasRaw.edges || []),
  }, { onConflict: 'id' })
  if (canvasError) console.error('Canvas error:', canvasError.message)
  else console.log('✓ Canvas')

  // Gallery
  const galleryRaw = JSON.parse(readFileSync(join(root, 'data', 'gallery.json'), 'utf-8'))
  if (Array.isArray(galleryRaw) && galleryRaw.length > 0) {
    for (const item of galleryRaw) {
      const { error } = await supabase.from('gallery').upsert(item, { onConflict: 'id' })
      if (error) console.error('Gallery error:', error.message)
      else console.log('✓ Gallery:', item.id)
    }
  } else {
    console.log('✓ Gallery: empty, skipped')
  }

  console.log('\nSeed complete!')
}

seed().catch(console.error)
