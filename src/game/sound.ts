// Tiny synthesized sound effects (Web Audio) — no audio files needed.
// Swap for real samples later if you want.

let ctx: AudioContext | null = null
let muted = readMuted()

function readMuted() {
  try {
    return localStorage.getItem('memory-muted') === '1'
  } catch {
    return false
  }
}

export function isMuted() {
  return muted
}

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem('memory-muted', value ? '1' : '0')
  } catch {
    /* storage unavailable — fine */
  }
}

function audio() {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime + at
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sound = {
  flip: () => tone(520, 0, 0.08, 'triangle', 0.12),
  match: () => {
    tone(660, 0, 0.12)
    tone(880, 0.1, 0.18)
  },
  miss: () => {
    tone(260, 0, 0.12, 'square', 0.05)
    tone(196, 0.12, 0.18, 'square', 0.05)
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.15)),
}
