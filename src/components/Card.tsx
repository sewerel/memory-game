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
      onClick={onFlip}
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
