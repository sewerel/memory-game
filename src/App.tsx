import { useEffect, useState, type CSSProperties } from 'react'
import { Card } from './components/Card'
import { isFaceUp } from './game/logic'
import { isMuted, preloadClips, setMuted } from './game/sound'
import { useMemoryGame } from './game/useMemoryGame'
import { useInstallPrompt } from './pwa'

// Every image in src/assets/cards becomes a card face; a sound in src/assets/sounds with the
// same base name (baba.webp ↔ baba.mp3) plays when that card flips. bravo.* plays on a win.
// All stay separate files in the build.
const imageFiles = import.meta.glob<string>('./assets/cards/*.{svg,png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const soundFiles = import.meta.glob<string>('./assets/sounds/*.{mp3,m4a,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const baseName = (path: string) => path.replace(/^.*\//, '').replace(/\.[^.]+$/, '')
const soundsByName = new Map(Object.entries(soundFiles).map(([p, url]) => [baseName(p), url]))
const soundByImage = new Map(
  Object.entries(imageFiles).map(([p, url]) => [url, soundsByName.get(baseName(p))]),
)

const images = Object.values(imageFiles)
const soundFor = (image: string) => soundByImage.get(image)
const WIN_SOUND = soundsByName.get('bravo')

const COLS = 4
const ROWS = 3
const PAIRS = Math.min((COLS * ROWS) / 2, images.length)

// Preload so faces never pop in and voices play instantly on the first flip.
images.forEach((src) => {
  new Image().src = src
})
preloadClips(Object.values(soundFiles))

export default function App() {
  const { state, won, flip, restart } = useMemoryGame({
    images,
    pairs: PAIRS,
    soundFor,
    winSound: WIN_SOUND,
  })
  const [muted, setMutedState] = useState(isMuted)
  const [showWin, setShowWin] = useState(false)
  const install = useInstallPrompt()

  // Let the last pair finish flipping before showing the win screen.
  useEffect(() => {
    if (!won) return setShowWin(false)
    const t = setTimeout(() => setShowWin(true), 700)
    return () => clearTimeout(t)
  }, [won])

  const toggleMute = () => {
    setMuted(!muted)
    setMutedState(!muted)
  }

  return (
    <div className="app">
      <main className="board" style={{ '--cols': COLS, '--rows': ROWS } as CSSProperties}>
        {state.cards.map((card, i) => (
          <Card
            key={i}
            src={card.src}
            faceUp={isFaceUp(state, i)}
            matched={card.matched}
            onFlip={() => flip(i)}
          />
        ))}
      </main>

      <aside className="controls">
        <button className="icon-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button className="icon-btn" onClick={restart} aria-label="New game">
          ↻
        </button>
        {install && (
          <button className="icon-btn" onClick={install} aria-label="Install app">
            ⤓
          </button>
        )}
      </aside>

      {showWin && (
        <div className="overlay">
          <div className="modal">
            <h1>You found them all!</h1>
            <button className="primary" onClick={restart}>
              Play again
            </button>
          </div>
        </div>
      )}

      <div className="rotate" aria-hidden>
        <div className="rotate-icon">⟳</div>
        <p>Rotate your phone to landscape</p>
      </div>
    </div>
  )
}
