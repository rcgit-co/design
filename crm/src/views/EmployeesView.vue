<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { profileApi } from '../api/profile.js'
import { auth } from '../stores/auth.js'
import { toasts } from '../stores/toast.js'
import { ROLES, date, initials } from '../lib/format.js'
import DataState from '../components/DataState.vue'
import Modal from '../components/Modal.vue'

// Назначаемые роли (владельца назначить нельзя — он один, создатель агентства)
const ASSIGNABLE = { admin: 'Администратор', manager: 'Менеджер', agent: 'Агент' }

const loading = ref(true)
const error = ref('')
const all = ref([])
const search = ref('')
const roleFilter = ref('')

const showForm = ref(false)
const saving = ref(false)
const editing = ref(null)
const form = reactive({ name: '', login: '', email: '', phone: '', role: 'agent', comment: '', password: '' })
const fe = ref({})   // ошибки по полям

const canManage = computed(() => auth.canManage)

async function load() {
  loading.value = true; error.value = ''
  try {
    const res = await profileApi.list({ limit: 200, offset: 0 })
    all.value = res.items
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)

const items = computed(() => {
  const q = search.value.trim().toLowerCase()
  return all.value.filter((u) => {
    if (roleFilter.value && u.role !== roleFilter.value) return false
    if (!q) return true
    return [u.name, u.email, u.phone, u.login].filter(Boolean).join(' ').toLowerCase().includes(q)
  })
})

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', login: '', email: '', phone: '', role: 'agent', comment: '', password: '' })
  fe.value = {}
  showForm.value = true
}
function openEdit(u) {
  editing.value = u
  Object.assign(form, { name: u.name || '', login: u.login || '', email: u.email || '', phone: u.phone || '', role: u.role || 'agent', comment: u.comment || '', password: '' })
  fe.value = {}
  showForm.value = true
}

function validate() {
  const e = {}
  if (!form.name.trim()) e.name = 'Имя обязательно'
  if (!editing.value) {
    // login/password нужны только при создании (создаётся учётка для входа)
    if (!form.login) e.login = 'Логин обязателен'
    else if (!/^[A-Za-z0-9_.\-]{3,50}$/.test(form.login)) e.login = '3–50: латиница, цифры, . _ -'
    if (!form.password || form.password.length < 6) e.password = 'Минимум 6 символов'
  } else if (form.password && form.password.length < 6) {
    e.password = 'Минимум 6 символов'
  }
  if (!form.email) e.email = 'Email обязателен'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Неверный email'
  if (!form.phone) e.phone = 'Телефон обязателен'
  else if (!/^\+?[0-9]{10,15}$/.test(form.phone.replace(/[\s()\-]/g, ''))) e.phone = '10–15 цифр, можно с +'
  fe.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    if (editing.value) {
      const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, comment: form.comment || null }
      if (form.password) payload.password = form.password
      await profileApi.update(editing.value.id, payload)
      toasts.ok('Сотрудник обновлён')
    } else {
      // создание сотрудника = заведение учётной записи для входа
      await profileApi.create({
        name: form.name, login: form.login, email: form.email, phone: form.phone.replace(/[\s()\-]/g, ''),
        role: form.role, comment: form.comment || null, password: form.password,
      })
      toasts.ok('Сотрудник создан, учётная запись для входа заведена')
    }
    showForm.value = false; await load()
  } catch (e) {
    const errs = e?.payload?.errors
    if (errs && typeof errs === 'object') fe.value = { ...fe.value, ...errs }
    toasts.err(e)
  } finally { saving.value = false }
}

async function changeRole(u, role) {
  if (role === u.role) return
  try { await profileApi.changeRole(u.id, role); u.role = role; toasts.ok('Роль изменена') }
  catch (e) { toasts.err(e); await load() }
}
async function toggleActive(u) {
  const active = u.is_active !== false
  try {
    if (active) await profileApi.deactivate(u.id); else await profileApi.activate(u.id)
    u.is_active = !active
    toasts.ok(active ? 'Деактивирован' : 'Активирован')
  } catch (e) { toasts.err(e) }
}
</script>

<template>
  <div>
    <div class="spread" style="margin-bottom:18px">
      <div><h1 style="font-size:28px">Сотрудники</h1><p class="muted">Команда агентства · вход по ИНН агентства + логин + пароль</p></div>
      <button v-if="canManage" class="primary" @click="openCreate">+ Сотрудник</button>
    </div>

    <div class="toolbar card">
      <input v-model="search" placeholder="Поиск по имени, логину, email, телефону…" style="max-width:320px" />
      <select v-model="roleFilter" style="max-width:200px">
        <option value="">Все роли</option>
        <option v-for="(l,k) in ROLES" :key="k" :value="k">{{ l }}</option>
      </select>
    </div>

    <div class="card" style="margin-top:14px;overflow:hidden">
      <DataState :loading="loading" :error="error" :empty="!items.length" empty-text="Сотрудников нет">
        <div class="table-scroll"><table>
          <thead><tr><th>Сотрудник</th><th>Логин</th><th>Контакты</th><th>Роль</th><th>Статус</th><th></th></tr></thead>
          <tbody>
            <tr v-for="u in items" :key="u.id">
              <td><div class="row" style="gap:10px"><span class="ava">{{ initials(u.name) }}</span><strong>{{ u.name || '—' }}</strong></div></td>
              <td class="mono">{{ u.login || '—' }}</td>
              <td class="muted">{{ u.email || '—' }}<br />{{ u.phone || '' }}</td>
              <td>
                <select v-if="canManage && u.role !== 'owner'" :value="u.role" @change="changeRole(u, $event.target.value)" class="role-sel">
                  <option v-for="(l,k) in ASSIGNABLE" :key="k" :value="k">{{ l }}</option>
                </select>
                <span v-else class="badge gray">{{ ROLES[u.role] || u.role }}</span>
              </td>
              <td><span class="badge" :class="u.is_active !== false ? 'green' : 'gray'"><span class="dot" />{{ u.is_active !== false ? 'Активен' : 'Отключён' }}</span></td>
              <td style="text-align:right;white-space:nowrap">
                <template v-if="canManage && u.role !== 'owner'">
                  <button class="sm ghost" @click="openEdit(u)">Изм.</button>
                  <button class="sm" :class="u.is_active !== false ? 'danger' : 'ghost'" @click="toggleActive(u)">{{ u.is_active !== false ? 'Отключить' : 'Включить' }}</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table></div>
      </DataState>
    </div>

    <Modal v-if="showForm" :title="editing ? 'Редактирование сотрудника' : 'Новый сотрудник'" @close="showForm = false">
      <p v-if="!editing" class="muted" style="margin-bottom:14px;font-size:13px">
        Создаётся учётная запись для входа. Сотрудник войдёт по <strong>ИНН агентства</strong> + указанным логину и паролю.
      </p>
      <div class="grid" style="gap:14px">
        <div><label>Имя *</label><input v-model="form.name" :class="{ bad: fe.name }" /><small v-if="fe.name" class="fe">{{ fe.name }}</small></div>
        <div class="row" style="gap:12px">
          <div style="flex:1">
            <label>Логин *</label>
            <input v-model="form.login" :disabled="!!editing" placeholder="ivanov" :class="{ bad: fe.login }" />
            <small v-if="fe.login" class="fe">{{ fe.login }}</small>
            <small v-else-if="editing" class="hint">логин не меняется</small>
          </div>
          <div style="flex:1">
            <label>{{ editing ? 'Новый пароль' : 'Пароль *' }}</label>
            <input v-model="form.password" type="password" :placeholder="editing ? 'оставьте пустым' : 'минимум 6'" :class="{ bad: fe.password }" />
            <small v-if="fe.password" class="fe">{{ fe.password }}</small>
          </div>
        </div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Email *</label><input v-model="form.email" :class="{ bad: fe.email }" /><small v-if="fe.email" class="fe">{{ fe.email }}</small></div>
          <div style="flex:1"><label>Телефон *</label><input v-model="form.phone" placeholder="+7999…" :class="{ bad: fe.phone }" /><small v-if="fe.phone" class="fe">{{ fe.phone }}</small></div>
        </div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Роль</label><select v-model="form.role"><option v-for="(l,k) in ASSIGNABLE" :key="k" :value="k">{{ l }}</option></select></div>
          <div style="flex:1"><label>Комментарий</label><input v-model="form.comment" /></div>
        </div>
      </div>
      <template #footer>
        <button class="ghost" @click="showForm = false">Отмена</button>
        <button class="primary" :disabled="saving" @click="save">{{ saving ? '…' : (editing ? 'Сохранить' : 'Создать сотрудника') }}</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.toolbar { display: flex; gap: 12px; padding: 12px 14px; }
.ava { width: 30px; height: 30px; border-radius: 50%; background: var(--green-soft); color: var(--green-deep); display: grid; place-items: center; font-weight: 700; font-size: 11px; flex: 0 0 auto; }
.role-sel { padding: 5px 8px; font-size: 12.5px; max-width: 150px; }
.fe { color: var(--rose); font-size: 11.5px; display: block; margin-top: 5px; }
.hint { color: var(--ink-faint); font-size: 11.5px; display: block; margin-top: 5px; }
input.bad { border-color: var(--rose); }
</style>
