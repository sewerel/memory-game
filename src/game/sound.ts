// Sound: recorded clips (per-image voice, bravo) + tiny synthesized effects as fallback.
// Everything goes through one Web Audio context: once it's unlocked by the first tap,
// clips can also play from timers (e.g. bravo after the last match), including on iOS.

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
  if (value) stopClip()
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

// ---------- recorded clips ----------

const buffers = new Map<string, Promise<AudioBuffer | null>>()

/** Fetch + decode clips up front so they play instantly on flip. */
export function preloadClips(urls: readonly string[]) {
  for (const url of urls) {
    if (buffers.has(url)) continue
    buffers.set(
      url,
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((data) => audio().decodeAudioData(data))
        .catch(() => null), // missing/broken clip → just stay silent
    )
  }
}

let current: AudioBufferSourceNode | null = null
let idle: Promise<void> = Promise.resolve()

function stopClip() {
  try {
    current?.stop()
  } catch {
    /* already stopped */
  }
  current = null
}

/** Play a clip, cutting off any clip still playing. Resolves when it ends. */
export function playClip(url: string): Promise<void> {
  stopClip()
  if (muted) return (idle = Promise.resolve())
  preloadClips([url])
  idle = buffers.get(url)!.then(
    (buffer) =>
      new Promise<void>((resolve) => {
        if (!buffer || muted) return resolve()
        const ac = audio()
        const source = ac.createBufferSource()
        source.buffer = buffer
        source.connect(ac.destination)
        source.onended = () => {
          if (current === source) current = null
          resolve()
        }
        current = source
        source.start()
      }),
  )
  return idle
}

/** Resolves once the most recently started clip has finished. */
export const whenClipDone = () => idle

// ---------- synthesized effects ----------

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
