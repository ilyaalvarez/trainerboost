// Server-side helper to fire-and-forget a push notification to a user.
// Call from API routes and server actions only — never from client components.
export async function sendPushToUser(userId: string, title: string, body: string, url?: string) {
  const secret = process.env.INTERNAL_API_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  if (!secret) return

  fetch(`${appUrl}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
    body: JSON.stringify({ userId, title, body, url }),
  }).catch(() => {
    // fire-and-forget, never throw
  })
}
