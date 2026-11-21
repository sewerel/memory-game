import { useEffect, useState, type CSSProperties } from 'react'
import { Card } from './components/Card'
import { isFaceUp } from './game/logic'
import { isMuted, setMuted } from './game/sound'
import { useMemoryGame } from './game/useMemoryGame'

// Every image in src/assets/cards becomes a card face (kept as separate files in the build).
const images = Object.values(
  import.meta.glob<string>('./assets/cards/*.{svg,png,jpg,jpeg,webp,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)

const COLS = 6
const ROWS = 4
const PAIRS = Math.min((COLS * ROWS) / 2, images.length)

// Preload so faces never pop in on the first flip.
images.forEach((src) => {
  new Image().src = src
})

export default function App() {
  const { state, won, flip, restart } = useMemoryGame(images, PAIRS)
  const [muted, setMutedState] = useState(isMuted)
  const [showWin, setShowWin] = useState(false)

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
