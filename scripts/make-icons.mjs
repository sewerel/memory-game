// Generate the app icon (SVG + PNGs for the PWA manifest) into public/.
// Content stays inside the central 80% so the same image works as a maskable icon.
// Usage: npm run icons
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.resolve(import.meta.dirname, '../public')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <pattern id="stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="28" height="28" fill="#6c5ce7"/>
      <rect width="14" height="28" fill="#5a4fd1"/>
    </pattern>
  </defs>
  <rect width="512" height="512" fill="#1b1d2a"/>
  <g transform="rotate(-12 200 256)">
    <rect x="110" y="166" width="180" height="180" rx="24" fill="url(#stripes)" stroke="#ffffff" stroke-opacity=".25" stroke-width="5"/>
    <circle cx="200" cy="256" r="30" fill="#ffffff" fill-opacity=".28"/>
  </g>
  <g transform="rotate(10 312 256)">
    <rect x="222" y="166" width="180" height="180" rx="24" fill="#ffffff"/>
    <path d="M312 306 C262 272 262 222 290 214 C302 211 310 218 312 228 C314 218 322 211 334 214 C362 222 362 272 312 306 Z" fill="#e63946"/>
  </g>
</svg>
`

await writeFile(path.join(OUT, 'icon.svg'), svg)
for (const size of [192, 512]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT, `icon-${size}.png`))
}
console.log('icons written to public/: icon.svg, icon-192.png, icon-512.png')
