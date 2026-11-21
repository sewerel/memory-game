import { useCallback, useEffect, useReducer } from 'react'
import { deal, flipOutcome, isWon, reducer } from './logic'
import { sound } from './sound'

const MISMATCH_DELAY = 900
const FLIP_DURATION = 400

export function useMemoryGame(images: readonly string[], pairs: number) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    cards: deal(images, pairs),
    open: [],
  }))

  // Flip a mismatched pair back after a short look.
  useEffect(() => {
    if (state.open.length !== 2) return
    const t = setTimeout(() => dispatch({ type: 'hide' }), MISMATCH_DELAY)
    return () => clearTimeout(t)
  }, [state.open])

  const won = isWon(state)
  useEffect(() => {
    if (!won) return
    const t = setTimeout(sound.win, FLIP_DURATION)
    return () => clearTimeout(t)
  }, [won])

  const flip = (index: number) => {
    const outcome = flipOutcome(state, index)
    if (outcome === 'ignored') return
    sound.flip()
    if (outcome === 'match') setTimeout(sound.match, 200)
    if (outcome === 'miss') setTimeout(sound.miss, 350)
    dispatch({ type: 'flip', index })
  }

  // Turn everything face down first, then swap in a new deck once hidden,
  // so the new images aren't revealed mid-flip.
  const restart = useCallback(() => {
    dispatch({ type: 'reset' })
    setTimeout(() => dispatch({ type: 'deal', cards: deal(images, pairs) }), FLIP_DURATION + 50)
  }, [images, pairs])

  return { state, won, flip, restart }
}
