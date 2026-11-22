import { useEffect, useState } from 'react'

/** Register the service worker (production builds only — dev uses Vite's server). */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* not installable here (e.g. plain http) — the game still works */
    })
  })
}

type InstallPromptEvent = Event & { prompt: () => Promise<void> }

/** Returns an install function while Chrome offers to install the app, otherwise null. */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault() // show our own button instead of Chrome's mini-infobar
      setPromptEvent(e as InstallPromptEvent)
    }
    const onInstalled = () => setPromptEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!promptEvent) return null
  return async () => {
    await promptEvent.prompt()
    setPromptEvent(null) // the event can only be used once
  }
}
