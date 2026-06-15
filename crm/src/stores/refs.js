import { reactive } from 'vue'
import { clientApi } from '../api/client.js'
import { propertyApi } from '../api/property.js'
import { profileApi } from '../api/profile.js'
import { clientName } from '../lib/format.js'

// Лёгкий общий кэш справочников для селектов и резолва имён по id.
export const refs = reactive({
  clients: [], properties: [], employees: [],
  _loaded: { clients: false, properties: false, employees: false },

  async ensureClients() {
    if (this._loaded.clients) return
    try { this.clients = (await clientApi.list({ limit: 500, offset: 0 })).items } catch { /* пусто */ }
    this._loaded.clients = true
  },
  async ensureProperties() {
    if (this._loaded.properties) return
    try { this.properties = (await propertyApi.list({ limit: 500, offset: 0 })).items } catch { /* пусто */ }
    this._loaded.properties = true
  },
  async ensureEmployees() {
    if (this._loaded.employees) return
    try { this.employees = (await profileApi.list({ limit: 500, offset: 0 })).items } catch { /* пусто */ }
    this._loaded.employees = true
  },
  async ensureAll() { await Promise.all([this.ensureClients(), this.ensureProperties(), this.ensureEmployees()]) },

  // принудительно перезагрузить (например, после создания клиента)
  invalidate(kind) { this._loaded[kind] = false },

  clientLabel(id) { const c = this.clients.find((x) => x.id === id); return c ? clientName(c) : null },
  propertyLabel(id) { const p = this.properties.find((x) => x.id === id); return p ? (p.title || 'Объект') : null },
  employeeLabel(id) { const u = this.employees.find((x) => x.id === id); return u ? (u.name || u.full_name) : null },
})
