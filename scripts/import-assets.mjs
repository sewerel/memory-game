// Import card assets from one folder:
//  - images → square-crop, resize to 512px WebP → src/assets/cards/
//  - sounds → copied as-is                       → src/assets/sounds/
// Names are transliterated to Latin, so a sound pairs with the image of the same name
// (e.g. баба.jpg + baba.mp3 → baba.webp + baba.mp3). bravo.mp3 is the win sound.
// Usage: npm run assets -- "C:/path/to/folder"
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SIZE = 512
const ROOT = path.resolve(import.meta.dirname, '../src/assets')
const CARDS = path.join(ROOT, 'cards')
const SOUNDS = path.join(ROOT, 'sounds')
const IMAGE = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i
const AUDIO = /\.(mp3|m4a|ogg|wav)$/i

// Bulgarian → Latin, so file names are safe in gist URLs and easy to match up.
const BG = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
}

const slug = (name) =>
  [...name.toLowerCase()]
    .map((ch) => BG[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const src = process.argv[2]
if (!src) {
  console.error('Usage: npm run assets -- "<folder with images and sounds>"')
  process.exit(1)
}

await mkdir(CARDS, { recursive: true })
await mkdir(SOUNDS, { recursive: true })
const files = await readdir(src)
let images = 0
let sounds = 0

for (const file of files) {
  const { name, ext } = path.parse(file)
  if (IMAGE.test(file)) {
    const out = `${slug(name)}.webp`
    await sharp(path.join(src, file))
      .rotate() // respect EXIF orientation
      .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile(path.join(CARDS, out))
    console.log(`image  ${file}  →  cards/${out}`)
    images++
  } else if (AUDIO.test(file)) {
    const out = `${slug(name)}${ext.toLowerCase()}`
    await copyFile(path.join(src, file), path.join(SOUNDS, out))
    console.log(`sound  ${file}  →  sounds/${out}`)
    sounds++
  }
}
console.log(`\n${images} image(s), ${sounds} sound(s) imported`)
