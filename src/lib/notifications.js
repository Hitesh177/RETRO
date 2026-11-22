const NOTIFICATIONS_ENDPOINT = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT || ''

export async function notifyEvent(type, payload = {}) {
  if (!NOTIFICATIONS_ENDPOINT) {
    if (import.meta.env.DEV) {
      console.info('[notifications]', type, payload)
    }
    return { ok: false, skipped: true }
  }

  try {
    const response = await fetch(NOTIFICATIONS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        payload,
        source: 'retro-ai',
        sent_at: new Date().toISOString(),
      }),
      keepalive: true,
    })

    if (!response.ok) {
      throw new Error(`Notification endpoint responded with ${response.status}`)
    }

    return { ok: true }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[notifications] Failed to send event:', type, error?.message || error)
    }
    return { ok: false, error: error?.message || 'Notification delivery failed' }
  }
}
