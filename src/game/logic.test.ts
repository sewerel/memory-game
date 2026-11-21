import { describe, expect, it } from 'vitest'
import { deal, flipOutcome, isWon, reducer, type State } from './logic'

const fixed: State = {
  cards: ['a', 'b', 'a', 'b'].map((k, id) => ({ id, pairKey: k, src: k, matched: false })),
  open: [],
}

describe('deal', () => {
  it('creates two of each chosen image', () => {
    const cards = deal(['x', 'y', 'z', 'w'], 3)
    expect(cards).toHaveLength(6)
    const counts = new Map<string, number>()
    cards.forEach((c) => counts.set(c.pairKey, (counts.get(c.pairKey) ?? 0) + 1))
    expect([...counts.values()]).toEqual([2, 2, 2])
  })
})

describe('reducer', () => {
  it('marks a pair matched', () => {
    let s = reducer(fixed, { type: 'flip', index: 0 })
    s = reducer(s, { type: 'flip', index: 2 })
    expect(s.open).toEqual([])
    expect(s.cards[0].matched && s.cards[2].matched).toBe(true)
  })

  it('keeps a mismatch open until hidden, and blocks a third flip', () => {
    let s = reducer(fixed, { type: 'flip', index: 0 })
    s = reducer(s, { type: 'flip', index: 1 })
    expect(s.open).toEqual([0, 1])
    expect(flipOutcome(s, 2)).toBe('ignored')
    s = reducer(s, { type: 'hide' })
    expect(s.open).toEqual([])
  })

  it('ignores flipping the same card twice', () => {
    const s = reducer(fixed, { type: 'flip', index: 0 })
    expect(flipOutcome(s, 0)).toBe('ignored')
  })

  it('detects a win', () => {
    let s = fixed
    for (const i of [0, 2, 1, 3]) s = reducer(s, { type: 'flip', index: i })
    expect(isWon(s)).toBe(true)
  })
})
