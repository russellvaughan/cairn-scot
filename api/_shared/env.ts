export function readEnv(name: string): string | undefined {
  const env = (globalThis as any)?.process?.env as Record<string, string | undefined> | undefined
  const value = env?.[name]
  return typeof value === 'string' ? value : undefined
}

export function readEnvOr(name: string, fallback: string): string {
  return readEnv(name) || fallback
}

export function readFirstEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = readEnv(name)
    if (value) return value
  }
  return undefined
}
