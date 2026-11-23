import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import { deal, flipOutcome, isWon, reducer } from './logic'
import { playClip, sound, whenClipDone } from './sound'

const MISMATCH_DELAY = 1200
const FLIP_DURATION = 400

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

  // Win: let the last voice clip finish, then play bravo. The win screen stays up
  // until "Играй отново" is pressed — no automatic restart.
  const won = isWon(state)
  useEffect(() => {
    if (!won) return
    let cancelled = false
    void whenClipDone().then(() => {
      if (cancelled) return
      if (winSound) void playClip(winSound)
      else sound.win()
    })
    return () => {
      cancelled = true
    }
  }, [won, winSound])

  // Several fingers can land in the same instant, before React re-renders. Track the
  // state each flip produces so the next finger sees it (sounds stay correct too).
  const latest = useRef(state)
  useLayoutEffect(() => {
    latest.current = state
  }, [state])

  const flip = (index: number) => {
    const current = latest.current
    const outcome = flipOutcome(current, index)
    if (outcome === 'ignored') return

    const clip = soundFor(current.cards[index].src)
    if (clip) void playClip(clip)
    else sound.flip()

    const lastPair = current.cards.filter((c) => !c.matched).length === 2
    if (outcome === 'match' && !lastPair) {
      // chime after the voice, so they don't talk over each other
      void whenClipDone().then(sound.match)
    }
    if (outcome === 'miss' && !clip) setTimeout(sound.miss, 350)

    const action = { type: 'flip', index } as const
    latest.current = reducer(current, action)
    dispatch(action)
  }

  return { state, won, flip, restart }
}
