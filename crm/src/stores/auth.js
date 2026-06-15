import { reactive } from 'vue'
import { authApi } from '../api/auth.js'

function decodeJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    // Корректно декодируем UTF-8 (кириллица в claims) без устаревшего escape().
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0))
    return JSON.parse(new TextDecoder('utf-8').decode(bytes))
  } catch { return null }
}

const LS = 'crm_session'
const saved = JSON.parse(localStorage.getItem(LS) || 'null')

export const auth = reactive({
  token: saved?.token || '',
  refreshToken: saved?.refreshToken || '',
  user: saved?.user || null,
  claims: saved?.token ? decodeJwt(saved.token) : null,
  _redirect: null, // выставляется приложением: функция перехода на /login

  get isAuthed() { return !!this.token },
  get role() { return this.claims?.role || this.user?.role || 'agent' },
  get canManage() { return ['owner', 'admin'].includes(this.role) },  // видят всё, управляют сотрудниками/агентством
  get agencyId() { return this.claims?.agency_id || null },
  get displayName() {
    return this.user?.full_name || this.user?.name || this.claims?.login || this.claims?.email || 'Пользователь'
  },

  _persist() {
    localStorage.setItem(LS, JSON.stringify({
      token: this.token, refreshToken: this.refreshToken, user: this.user,
    }))
  },

  _apply(resp) {
    // Бэкенд кладёт токены в data.tokens { access_token, refresh_token, expires_in }.
    const t = resp?.tokens || resp || {}
    const token = t.access_token || t.token || resp?.access_token || resp?.token
    const refresh = t.refresh_token || resp?.refresh_token || ''
    if (token) { this.token = token; this.claims = decodeJwt(token) }
    if (refresh) this.refreshToken = refresh
    if (resp?.user) this.user = resp.user
    this._persist()
  },

  async login(credentials) {
    const resp = await authApi.login(credentials)
    this._apply(resp)
    if (!this.user) { try { this.user = await authApi.me() } catch { /* не критично */ } this._persist() }
    return resp
  },

  async register(payload) {
    const resp = await authApi.register(payload)
    // Часть бэкендов сразу логинит и отдаёт токен, часть — нет.
    if (resp?.token || resp?.access_token) this._apply(resp)
    return resp
  },

  async refreshUser() {
    this.user = await authApi.me()
    this._persist()
  },

  logout() {
    authApi.logout().catch(() => {})
    this.token = ''; this.refreshToken = ''; this.user = null; this.claims = null
    localStorage.removeItem(LS)
    if (this._redirect) this._redirect()
  },

  onUnauthorized() {
    // токен истёк/невалиден
    this.token = ''; this.claims = null
    localStorage.removeItem(LS)
    if (this._redirect) this._redirect()
  },
})
