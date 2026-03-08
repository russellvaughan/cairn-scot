import { createHmac, timingSafeEqual } from 'node:crypto'

type BasePayload = {
  typ: string
  iat: number
  exp: number
}

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function fromBase64Url(input: string): Buffer {
  return Buffer.from(input, 'base64url')
}

function sign(payloadEncoded: string, secret: string): string {
  return toBase64Url(createHmac('sha256', secret).update(payloadEncoded).digest())
}

export function getInviteSigningSecret(serviceRoleKey: string): string {
  return process.env.INVITE_SIGNING_SECRET || serviceRoleKey
}

export function createSignedToken<T extends BasePayload>(payload: T, secret: string): string {
  const payloadEncoded = toBase64Url(JSON.stringify(payload))
  const signatureEncoded = sign(payloadEncoded, secret)
  return `${payloadEncoded}.${signatureEncoded}`
}

export function verifySignedToken<T extends BasePayload>(token: string, secret: string): T | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadEncoded, signatureEncoded] = parts
  if (!payloadEncoded || !signatureEncoded) return null

  const expectedSignature = sign(payloadEncoded, secret)
  const expectedBuffer = fromBase64Url(expectedSignature)
  const receivedBuffer = fromBase64Url(signatureEncoded)

  if (expectedBuffer.length !== receivedBuffer.length) return null
  if (!timingSafeEqual(expectedBuffer, receivedBuffer)) return null

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded).toString('utf8')) as T
    const now = Math.floor(Date.now() / 1000)

    if (!payload?.typ || typeof payload.typ !== 'string') return null
    if (!Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)) return null
    if (payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}
