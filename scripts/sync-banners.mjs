import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'fs'
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
const bannersDir = join(root, 'public', 'uploads', 'chapter-banners')

async function sync() {
  // Read chapters from DB
  const { data: chapters } = await supabase.from('chapters').select('*')
  if (!chapters) { console.log('No chapters found'); return }

  for (const ch of chapters) {
    // Check if data/chapters.json has a local bannerUrl for this chapter
    const localData = JSON.parse(readFileSync(join(root, 'data', 'chapters.json'), 'utf-8'))
    const localChapter = localData[ch.id]
    if (!localChapter) continue

    const localPath = localChapter.bannerUrl
    if (!localPath || !localPath.startsWith('/uploads/')) continue

    const fileName = localPath.replace('/uploads/chapter-banners/', '')
    const filePath = join(bannersDir, fileName)

    if (!existsSync(filePath)) {
      console.log(`  ✗ File not found: ${fileName}`)
      continue
    }

    // Upload to Supabase Storage
    const buffer = readFileSync(filePath)
    const ext = fileName.split('.').pop()
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'

    const { error: uploadError } = await supabase.storage
      .from('chapter-banners')
      .upload(fileName, buffer, { contentType: mime, upsert: true })

    if (uploadError) {
      console.error(`  ✗ Upload failed for ${fileName}: ${uploadError.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage.from('chapter-banners').getPublicUrl(fileName)

    // Update chapter record
    const { error: updateError } = await supabase
      .from('chapters')
      .update({ banner_url: publicUrl })
      .eq('id', ch.id)

    if (updateError) {
      console.error(`  ✗ DB update failed for ${ch.id}: ${updateError.message}`)
    } else {
      console.log(`  ✓ ${ch.id} → ${publicUrl}`)
    }
  }

  console.log('\nSync complete!')
}

sync().catch(console.error)
