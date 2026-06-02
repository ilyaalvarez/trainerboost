const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id)
}

export function isValidUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

// Minimal RFC 5322-aligned email check (no external deps)
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && EMAIL_RE.test(email) && email.length <= 254
}

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

export const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'] as const

export function safeImageExt(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return (ALLOWED_IMAGE_EXTS as readonly string[]).includes(ext) ? ext : 'jpg'
}
