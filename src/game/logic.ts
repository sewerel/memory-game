export type Card = {
  id: number
  pairKey: string
  src: string
  matched: boolean
}

export type State = {
  cards: Card[]
  /** indices of face-up, not-yet-matched cards (max 2) */
  open: number[]
}

export type Action =
  | { type: 'flip'; index: number }
  | { type: 'hide' }
  | { type: 'reset' }
  | { type: 'deal'; cards: Card[] }

export type FlipOutcome = 'ignored' | 'flip' | 'match' | 'miss'

export function shuffle<T>(items: readonly T[], rand = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick `pairs` random images and return a shuffled deck with two of each. */
export function deal(images: readonly string[], pairs: number, rand = Math.random): Card[] {
  const chosen = shuffle(images, rand).slice(0, pairs)
  return shuffle(
    chosen.flatMap((src) => [src, src]),
    rand,
  ).map((src, id) => ({ id, pairKey: src, src, matched: false }))
}

/** What flipping card `index` would do, without changing state. */
export function flipOutcome(state: State, index: number): FlipOutcome {
  const card = state.cards[index]
  if (!card || card.matched || state.open.length >= 2 || state.open.includes(index)) {
    return 'ignored'
  }
  if (state.open.length === 0) return 'flip'
  return state.cards[state.open[0]].pairKey === card.pairKey ? 'match' : 'miss'
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'flip': {
      const outcome = flipOutcome(state, action.index)
      if (outcome === 'ignored') return state
      if (outcome === 'match') {
        const done = new Set([...state.open, action.index])
        return {
          cards: state.cards.map((c, i) => (done.has(i) ? { ...c, matched: true } : c)),
          open: [],
        }
      }
      return { ...state, open: [...state.open, action.index] }
    }
    case 'hide':
      return { ...state, open: [] }
    case 'reset':
      return { cards: state.cards.map((c) => ({ ...c, matched: false })), open: [] }
    case 'deal':
      return { cards: action.cards, open: [] }
  }
}

export const isFaceUp = (state: State, index: number) =>
  state.cards[index].matched || state.open.includes(index)

export const isWon = (state: State) =>
  state.cards.length > 0 && state.cards.every((c) => c.matched)
