<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { clientApi } from '../api/client.js'
import { toasts } from '../stores/toast.js'
import { date, CLIENT_STATUS, INTERACTION_TYPES, clientName, initials } from '../lib/format.js'
import DataState from '../components/DataState.vue'
import Modal from '../components/Modal.vue'

const loading = ref(true)
const error = ref('')
const all = ref([])
const search = ref('')
const statusFilter = ref('')

const showForm = ref(false)
const saving = ref(false)
const editing = ref(null)
const form = reactive({ last_name: '', first_name: '', middle_name: '', phone: '', email: '', source: '', status: 'lead' })

const detail = ref(null)
const tags = ref([]); const notes = ref([]); const interactions = ref([])
const newTag = ref(''); const newNote = ref('')
const inter = reactive({ type: 'call', summary: '', direction: 'out' })
const detailLoading = ref(false)

async function load() {
  loading.value = true; error.value = ''
  try {
    const res = await clientApi.list({ limit: 200, offset: 0 })
    all.value = res.items
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)

const items = computed(() => {
  const q = search.value.trim().toLowerCase()
  return all.value.filter((c) => {
    if (statusFilter.value && c.status !== statusFilter.value) return false
    if (!q) return true
    return [clientName(c), c.phone, c.email].filter(Boolean).join(' ').toLowerCase().includes(q)
  })
})

function openCreate() {
  editing.value = null
  Object.assign(form, { last_name: '', first_name: '', middle_name: '', phone: '', email: '', source: '', status: 'lead' })
  showForm.value = true
}
function openEdit(c) {
  editing.value = c
  Object.assign(form, { last_name: c.last_name || '', first_name: c.first_name || '', middle_name: c.middle_name || '', phone: c.phone || '', email: c.email || '', source: c.source || '', status: c.status || 'lead' })
  showForm.value = true
}
async function save() {
  saving.value = true
  try {
    if (editing.value) { await clientApi.update(editing.value.id, { ...form }); toasts.ok('Клиент обновлён') }
    else { await clientApi.create({ ...form }); toasts.ok('Клиент добавлен') }
    showForm.value = false; await load()
  } catch (e) { toasts.err(e) } finally { saving.value = false }
}
async function convert(c) {
  try { await clientApi.convert(c.id); toasts.ok('Лид → контакт'); await load() }
  catch (e) { toasts.err(e) }
}

async function openDetail(c) {
  detail.value = c; detailLoading.value = true
  tags.value = []; notes.value = []; interactions.value = []
  try {
    const [tg, nt, it] = await Promise.allSettled([
      clientApi.tags(c.id), clientApi.notes(c.id), clientApi.interactions(c.id),
    ])
    if (tg.status === 'fulfilled') tags.value = tg.value.items
    if (nt.status === 'fulfilled') notes.value = nt.value.items
    if (it.status === 'fulfilled') interactions.value = it.value.items
  } finally { detailLoading.value = false }
}
async function addTag() {
  if (!newTag.value.trim()) return
  try { await clientApi.addTag(detail.value.id, newTag.value.trim()); tags.value.push({ tag: newTag.value.trim() }); newTag.value = '' }
  catch (e) { toasts.err(e) }
}
async function addNote() {
  if (!newNote.value.trim()) return
  try { await clientApi.addNote(detail.value.id, newNote.value.trim()); notes.value.unshift({ body: newNote.value.trim(), created_at: new Date().toISOString() }); newNote.value = '' }
  catch (e) { toasts.err(e) }
}
async function addInteraction() {
  if (!inter.summary.trim()) return
  try {
    await clientApi.addInteraction(detail.value.id, { type: inter.type, summary: inter.summary.trim(), direction: inter.direction })
    interactions.value.unshift({ type: inter.type, summary: inter.summary.trim(), direction: inter.direction, occurred_at: new Date().toISOString() })
    inter.summary = ''
  } catch (e) { toasts.err(e) }
}
function tagText(t) { return typeof t === 'string' ? t : (t.tag || t.name) }
</script>

<template>
  <div>
    <div class="spread" style="margin-bottom:18px">
      <div><h1 style="font-size:28px">Клиенты</h1><p class="muted">Лиды и контакты агентства</p></div>
      <button class="primary" @click="openCreate">+ Клиент</button>
    </div>

    <div class="toolbar card">
      <input v-model="search" placeholder="Поиск по ФИО, телефону, email…" style="max-width:340px" />
      <select v-model="statusFilter" style="max-width:180px">
        <option value="">Все</option>
        <option value="lead">Лиды</option>
        <option value="contact">Контакты</option>
      </select>
    </div>

    <div class="card" style="margin-top:14px;overflow:hidden">
      <DataState :loading="loading" :error="error" :empty="!items.length" empty-text="Клиентов нет">
        <div class="table-scroll"><table>
          <thead><tr><th>Клиент</th><th>Контакты</th><th>Статус</th><th>Источник</th><th></th></tr></thead>
          <tbody>
            <tr v-for="c in items" :key="c.id">
              <td>
                <div class="row" style="gap:10px">
                  <span class="ava">{{ initials(clientName(c)) }}</span>
                  <a href="#" @click.prevent="openDetail(c)"><strong>{{ clientName(c) }}</strong></a>
                </div>
              </td>
              <td class="muted">{{ c.phone || '—' }}<br />{{ c.email || '' }}</td>
              <td><span class="badge" :class="(CLIENT_STATUS[c.status]||{}).cls || 'gray'">{{ (CLIENT_STATUS[c.status]||{}).label || c.status }}</span></td>
              <td class="muted">{{ c.source || '—' }}</td>
              <td style="text-align:right;white-space:nowrap">
                <button v-if="c.status === 'lead'" class="sm ghost" @click="convert(c)">В контакт</button>
                <button class="sm ghost" @click="openEdit(c)">Изм.</button>
              </td>
            </tr>
          </tbody>
        </table></div>
      </DataState>
    </div>

    <Modal v-if="showForm" :title="editing ? 'Редактирование клиента' : 'Новый клиент'" @close="showForm = false">
      <div class="grid" style="gap:14px">
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Фамилия</label><input v-model="form.last_name" /></div>
          <div style="flex:1"><label>Имя *</label><input v-model="form.first_name" /></div>
        </div>
        <div><label>Отчество</label><input v-model="form.middle_name" /></div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Телефон</label><input v-model="form.phone" placeholder="+7…" /></div>
          <div style="flex:1"><label>Email</label><input v-model="form.email" /></div>
        </div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Статус</label><select v-model="form.status"><option value="lead">Лид</option><option value="contact">Контакт</option></select></div>
          <div style="flex:1"><label>Источник</label><input v-model="form.source" placeholder="сайт, реклама…" /></div>
        </div>
      </div>
      <template #footer>
        <button class="ghost" @click="showForm = false">Отмена</button>
        <button class="primary" :disabled="saving || !form.first_name" @click="save">{{ saving ? '…' : 'Сохранить' }}</button>
      </template>
    </Modal>

    <Modal v-if="detail" :title="clientName(detail)" wide @close="detail = null">
      <DataState :loading="detailLoading">
        <div class="dgrid">
          <div>
            <h4>Теги</h4>
            <div class="tags">
              <span v-for="(tg,i) in tags" :key="i" class="badge blue">{{ tagText(tg) }}</span>
              <span v-if="!tags.length" class="muted">нет тегов</span>
            </div>
            <div class="row" style="margin-top:10px;gap:8px">
              <input v-model="newTag" placeholder="новый тег" @keyup.enter="addTag" />
              <button class="sm" @click="addTag">+</button>
            </div>

            <h4 style="margin-top:22px">Взаимодействия</h4>
            <div class="row" style="gap:8px;margin-bottom:10px">
              <select v-model="inter.type" style="max-width:120px"><option v-for="(l,k) in INTERACTION_TYPES" :key="k" :value="k">{{ l }}</option></select>
              <input v-model="inter.summary" placeholder="что произошло" @keyup.enter="addInteraction" />
              <button class="sm" @click="addInteraction">+</button>
            </div>
            <ul class="timeline">
              <li v-for="(it,i) in interactions" :key="i">
                <span class="muted">{{ date(it.occurred_at || it.created_at, true) }}</span>
                <div>{{ INTERACTION_TYPES[it.type] || it.type }}: {{ it.summary || '—' }}</div>
              </li>
              <li v-if="!interactions.length" class="muted">пока пусто</li>
            </ul>
          </div>
          <div>
            <h4>Заметки</h4>
            <div class="row" style="gap:8px;margin-bottom:12px">
              <input v-model="newNote" placeholder="добавить заметку" @keyup.enter="addNote" />
              <button class="sm" @click="addNote">+</button>
            </div>
            <ul class="notes">
              <li v-for="(n,i) in notes" :key="i" class="card" style="padding:11px 13px">
                <div>{{ n.body || n.note || n.text }}</div>
                <span class="muted" style="font-size:11.5px">{{ date(n.created_at, true) }}</span>
              </li>
              <li v-if="!notes.length" class="muted">нет заметок</li>
            </ul>
          </div>
        </div>
      </DataState>
    </Modal>
  </div>
</template>

<style scoped>
.toolbar { display: flex; gap: 12px; padding: 12px 14px; }
.ava { width: 30px; height: 30px; border-radius: 50%; background: var(--green-soft); color: var(--green-deep); display: grid; place-items: center; font-weight: 700; font-size: 11px; flex: 0 0 auto; }
.dgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.dgrid h4 { font-size: 15px; margin-bottom: 10px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.timeline { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.timeline li { font-size: 13px; border-left: 2px solid var(--line); padding-left: 12px; }
.timeline .muted { font-size: 11.5px; }
.notes { list-style: none; padding: 0; margin: 0; display: grid; gap: 9px; }
@media (max-width: 720px) { .dgrid { grid-template-columns: 1fr; } }
</style>
