import { readEnv } from './env.js'

type BasePayload = {
  typ: string
  iat: number
  exp: number
}

function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function bytesToUtf8(value: Uint8Array): string {
  return new TextDecoder().decode(value)
}

function bytesToBase64(value: Uint8Array): string {
  let binary = ''
  for (let index = 0; index < value.length; index += 1) {
    binary += String.fromCharCode(value[index] || 0)
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function toBase64Url(value: Uint8Array): string {
  return bytesToBase64(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function toBase64UrlText(value: string): string {
  return toBase64Url(utf8ToBytes(value))
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')
  return base64ToBytes(base64)
}

function toBufferSource(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    toBufferSource(utf8ToBytes(secret)),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign', 'verify']
  )
}

export function getInviteSigningSecret(serviceRoleKey: string): string {
  return readEnv('INVITE_SIGNING_SECRET') || serviceRoleKey
}

export async function createSignedToken<T extends BasePayload>(payload: T, secret: string): Promise<string> {
  const payloadEncoded = toBase64UrlText(JSON.stringify(payload))
  const key = await importSigningKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, toBufferSource(utf8ToBytes(payloadEncoded)))
  const signatureEncoded = toBase64Url(new Uint8Array(signature))
  return `${payloadEncoded}.${signatureEncoded}`
}

export async function verifySignedToken<T extends BasePayload>(token: string, secret: string): Promise<T | null> {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadEncoded, signatureEncoded] = parts
  if (!payloadEncoded || !signatureEncoded) return null

  try {
    const key = await importSigningKey(secret)
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      toBufferSource(fromBase64Url(signatureEncoded)),
      toBufferSource(utf8ToBytes(payloadEncoded))
    )

    if (!isValid) return null

    const payload = JSON.parse(bytesToUtf8(fromBase64Url(payloadEncoded))) as T
    const now = Math.floor(Date.now() / 1000)

    if (!payload?.typ || typeof payload.typ !== 'string') return null
    if (!Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)) return null
    if (payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}
