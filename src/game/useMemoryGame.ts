import { useCallback, useEffect, useReducer } from 'react'
import { deal, flipOutcome, isWon, reducer } from './logic'
import { playClip, sound, whenClipDone } from './sound'

const MISMATCH_DELAY = 1200
const FLIP_DURATION = 400
/** Minimum time the win screen stays up before the next game starts on its own. */
const MIN_WIN_PAUSE = 2500

type Options = {
  images: readonly string[]
  pairs: number
  /** voice clip for a card image, if one exists */
  soundFor: (image: string) => string | undefined
  /** clip played when the game is won (falls back to a synthesized fanfare) */
  winSound?: string
}

export function useMemoryGame({ images, pairs, soundFor, winSound }: Options) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    cards: deal(images, pairs),
    open: [],
  }))

  // Turn everything face down first, then swap in a new deck once hidden,
  // so the new images aren't revealed mid-flip.
  const restart = useCallback(() => {
    dispatch({ type: 'reset' })
    setTimeout(() => dispatch({ type: 'deal', cards: deal(images, pairs) }), FLIP_DURATION + 50)
  }, [images, pairs])

  // Flip a mismatched pair back after a short look.
  useEffect(() => {
    if (state.open.length !== 2) return
    const t = setTimeout(() => dispatch({ type: 'hide' }), MISMATCH_DELAY)
    return () => clearTimeout(t)
  }, [state.open])

  // Win: let the last voice clip finish, play bravo, then start a new game by itself.
  const won = isWon(state)
  useEffect(() => {
    if (!won) return
    let cancelled = false
    const fanfare = whenClipDone().then(() => {
      if (cancelled) return
      if (winSound) return playClip(winSound)
      sound.win()
    })
    const pause = new Promise((r) => setTimeout(r, MIN_WIN_PAUSE))
    Promise.all([fanfare, pause]).then(() => {
      if (!cancelled) restart()
    })
    return () => {
      cancelled = true
    }
  }, [won, winSound, restart])

  const flip = (index: number) => {
    const outcome = flipOutcome(state, index)
    if (outcome === 'ignored') return

    const clip = soundFor(state.cards[index].src)
    if (clip) void playClip(clip)
    else sound.flip()

    const lastPair = state.cards.filter((c) => !c.matched).length === 2
    if (outcome === 'match' && !lastPair) {
      // chime after the voice, so they don't talk over each other
      void whenClipDone().then(sound.match)
    }
    if (outcome === 'miss' && !clip) setTimeout(sound.miss, 350)

    dispatch({ type: 'flip', index })
  }

  return { state, won, flip, restart }
}
