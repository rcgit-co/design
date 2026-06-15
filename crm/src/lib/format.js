export function money(v, currency = '₽') {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ' + currency
}

export function date(v, withTime = false) {
  if (!v) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  const opts = withTime
    ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }
  return d.toLocaleString('ru-RU', opts)
}

// ФИО клиента из first/last/middle
export function clientName(c = {}) {
  const parts = [c.last_name, c.first_name, c.middle_name].filter(Boolean)
  return parts.join(' ').trim() || 'Без имени'
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '·'
}

// Роли по rank: agent < manager < admin < owner
export const ROLES = {
  owner: 'Владелец',
  admin: 'Администратор',
  manager: 'Менеджер',
  agent: 'Агент',
}

export const ACTIVITY_TYPES = {
  call: 'Звонок',
  meeting: 'Встреча',
  showing: 'Показ',
  task: 'Задача',
}

export const ACTIVITY_STATUS = {
  planned: { label: 'Запланировано', cls: 'gold' },
  done: { label: 'Выполнено', cls: 'green' },
  canceled: { label: 'Отменено', cls: 'gray' },
}

// property.status: active | sold | withdrawn | archived
export const PROPERTY_STATUS = {
  active: { label: 'В продаже', cls: 'green' },
  sold: { label: 'Продан', cls: 'blue' },
  withdrawn: { label: 'Снят', cls: 'gold' },
  archived: { label: 'Архив', cls: 'gray' },
}

export const PROPERTY_TYPES = { flat: 'Квартира', house: 'Дом', commercial: 'Коммерция', land: 'Участок' }

// client.status: lead | contact
export const CLIENT_STATUS = {
  lead: { label: 'Лид', cls: 'gold' },
  contact: { label: 'Контакт', cls: 'green' },
}

export const INTERACTION_TYPES = { call: 'Звонок', meeting: 'Встреча', email: 'Email', message: 'Сообщение', note: 'Заметка' }

export const CONTRACT_TYPES = { developer: 'Застройщик', owner: 'Собственник', other: 'Прочее' }

// Стадии сделки: new | in_progress | deal | archived (fallback, если /stages недоступен)
export const DEFAULT_STAGES = [
  { code: 'new', title: 'Новая' },
  { code: 'in_progress', title: 'В работе' },
  { code: 'deal', title: 'Сделка' },
  { code: 'archived', title: 'Архив' },
]
