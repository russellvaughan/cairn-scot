export async function readJsonBody(req: any): Promise<Record<string, unknown>> {
  if (req && typeof req.json === 'function') {
    const parsed = await req.json().catch(() => ({}))
    return parsed && typeof parsed === 'object' ? parsed : {}
  }

  if (req?.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>
  }

  if (typeof req?.body === 'string') {
    try {
      const parsed = JSON.parse(req.body)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }

  if (!req || typeof req.on !== 'function') {
    return {}
  }

  return await new Promise(resolve => {
    let data = ''

    req.on('data', (chunk: unknown) => {
      data += String(chunk || '')
    })

    req.on('end', () => {
      if (!data) {
        resolve({})
        return
      }
      try {
        const parsed = JSON.parse(data)
        resolve(parsed && typeof parsed === 'object' ? parsed : {})
      } catch {
        resolve({})
      }
    })

    req.on('error', () => resolve({}))
  })
}

export function sendJson(res: any, status: number, payload: unknown): Response | void {
  if (res && typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status).json(payload)
    return
  }

  if (res && typeof res.setHeader === 'function' && typeof res.end === 'function') {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
    return
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
