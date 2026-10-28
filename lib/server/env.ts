import 'server-only'

/*
 * Server-side configuration. Every getter returns null instead of throwing
 * so routes and pages degrade to a "not configured" state rather than
 * crashing during static generation when a variable is absent.
 */

export interface DiscordOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

const MIN_SESSION_SECRET_LENGTH = 32

function read(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : null
}

export function getDiscordOAuthConfig(): DiscordOAuthConfig | null {
  const clientId = read('DISCORD_CLIENT_ID')
  const clientSecret = read('DISCORD_CLIENT_SECRET')
  const redirectUri = read('DISCORD_REDIRECT_URI')
  if (!clientId || !clientSecret || !redirectUri) return null
  try {
    new URL(redirectUri)
  } catch {
    console.error('[env] DISCORD_REDIRECT_URI is not a valid absolute URL.')
    return null
  }
  return { clientId, clientSecret, redirectUri }
}

export function getDiscordClientId() {
  return read('DISCORD_CLIENT_ID')
}

export function getSessionSecret() {
  const secret = read('SESSION_SECRET')
  if (!secret) return null
  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    console.error(`[env] SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters. Sign-in is disabled until it is fixed.`)
    return null
  }
  return secret
}

/** Optional. Only used server-side to check which guilds the bot has joined. */
export function getBotToken() {
  return read('DISCORD_BOT_TOKEN')
}

const DEFAULT_BOT_PERMISSIONS = '1099780189206'

export function getBotPermissions() {
  const value = read('DISCORD_BOT_PERMISSIONS')
  if (value && /^\d{1,20}$/.test(value)) return value
  if (value) console.error('[env] DISCORD_BOT_PERMISSIONS must be a numeric permission bitfield; using the default.')
  return DEFAULT_BOT_PERMISSIONS
}

export function isOAuthReady() {
  return getDiscordOAuthConfig() !== null && getSessionSecret() !== null
}
