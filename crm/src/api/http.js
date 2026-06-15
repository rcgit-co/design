import { auth } from '../stores/auth.js'

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

// Базовый запрос. Пути относительные (/api/...), Vite-прокси шлёт их на шлюз.
export async function http(method, path, { body, query, auth: needAuth = true } = {}) {
  let url = path
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    ).toString()
    if (qs) url += (url.includes('?') ? '&' : '?') + qs
  }

  const headers = { Accept: 'application/json' }
  if (needAuth && auth.token) headers['Authorization'] = 'Bearer ' + auth.token
  let payload
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(url, { method, headers, body: payload })
  } catch (e) {
    throw new ApiError('Сеть недоступна — поднят ли стек и верен ли адрес шлюза?', 0, null)
  }

  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* не JSON */ }

  if (res.status === 401 && needAuth) {
    auth.onUnauthorized()
  }

  if (!res.ok) {
    // Бэкенд при валидации возвращает { success:false, errors:{ field: msg } } или { error: msg }.
    let msg = json?.error || json?.message
    if (!msg && json?.errors) {
      if (typeof json.errors === 'string') msg = json.errors
      else msg = Object.values(json.errors).filter(Boolean).join('; ')
    }
    if (!msg) msg = `Ошибка ${res.status}`
    throw new ApiError(msg, res.status, json)
  }

  // Конверт ответа: { success, data }. Возвращаем содержимое data, иначе — весь json.
  if (json && typeof json === 'object' && 'data' in json) return json.data
  return json
}

// Достать список из ответа независимо от имени ключа.
export function asList(data, ...keys) {
  if (Array.isArray(data)) return { items: data, pagination: null }
  if (!data || typeof data !== 'object') return { items: [], pagination: null }
  for (const k of keys) if (Array.isArray(data[k])) return { items: data[k], pagination: data.pagination || null }
  if (Array.isArray(data.items)) return { items: data.items, pagination: data.pagination || null }
  return { items: [], pagination: data.pagination || null }
}

// Достать одиночную сущность.
export function asOne(data, ...keys) {
  if (!data || typeof data !== 'object') return data
  for (const k of keys) if (data[k] && typeof data[k] === 'object') return data[k]
  return data
}
