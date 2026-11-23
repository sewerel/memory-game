type Props = {
  src: string
  faceUp: boolean
  matched: boolean
  onFlip: () => void
}

export function Card({ src, faceUp, matched, onFlip }: Props) {
  return (
    <button
      className={`card${faceUp ? ' up' : ''}${matched ? ' matched' : ''}`}
      // React to each finger the moment it lands. A "click" is only produced for a
      // single-finger tap, so with another finger resting on the screen it never fires.
      onPointerDown={(e) => {
        if (e.button === 0) onFlip()
      }}
      // Keyboard (Enter/Space) still works; pointer clicks are already handled above.
      onClick={(e) => {
        if (e.detail === 0) onFlip()
      }}
      aria-label={faceUp ? 'Card, face up' : 'Card, face down'}
      disabled={matched}
    >
      <span className="card-inner">
        <span className="card-face card-back" />
        <span className="card-face card-front">
          <img src={src} alt="" draggable={false} />
        </span>
      </span>
    </button>
  )
}
