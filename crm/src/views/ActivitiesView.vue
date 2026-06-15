<script setup>
import { ref, reactive, onMounted } from 'vue'
import { activityApi } from '../api/activity.js'
import { toasts } from '../stores/toast.js'
import { date, ACTIVITY_TYPES } from '../lib/format.js'
import DataState from '../components/DataState.vue'
import Modal from '../components/Modal.vue'

const tab = ref('today')
const tabs = [
  { key: 'today', label: 'Сегодня' },
  { key: 'upcoming', label: 'Ближайшие' },
  { key: 'all', label: 'Все' },
]
const loading = ref(true)
const error = ref('')
const items = ref([])

const showForm = ref(false)
const saving = ref(false)
const form = reactive({ type: 'call', title: '', due_at: '', description: '' })

const rescheduling = ref(null)
const newDue = ref('')

async function load() {
  loading.value = true; error.value = ''
  try {
    let res
    if (tab.value === 'today') res = await activityApi.today()
    else if (tab.value === 'upcoming') res = await activityApi.upcoming()
    else res = await activityApi.list({ limit: 200, offset: 0 })
    items.value = res.items
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)
function switchTab(k) { tab.value = k; load() }

function toIso(local) { return local ? new Date(local).toISOString() : null }

async function create() {
  saving.value = true
  try {
    await activityApi.create({ type: form.type, title: form.title, due_at: toIso(form.due_at), description: form.description || null })
    toasts.ok('Дело создано'); showForm.value = false
    Object.assign(form, { type: 'call', title: '', due_at: '', description: '' })
    await load()
  } catch (e) { toasts.err(e) } finally { saving.value = false }
}
async function complete(a) {
  try { await activityApi.complete(a.id); toasts.ok('Выполнено'); await load() }
  catch (e) { toasts.err(e) }
}
async function doReschedule() {
  if (!newDue.value) return
  try { await activityApi.reschedule(rescheduling.value.id, toIso(newDue.value)); toasts.ok('Перенесено'); rescheduling.value = null; await load() }
  catch (e) { toasts.err(e) }
}
function isDone(a) { return a.status === 'done' || a.completed_at }
function due(a) { return a.due_at }
</script>

<template>
  <div>
    <div class="spread" style="margin-bottom:18px">
      <div><h1 style="font-size:28px">Дела</h1><p class="muted">Звонки, встречи, показы и задачи</p></div>
      <button class="primary" @click="showForm = true">+ Дело</button>
    </div>

    <div class="tabs">
      <button v-for="tb in tabs" :key="tb.key" :class="{ on: tab === tb.key }" @click="switchTab(tb.key)">{{ tb.label }}</button>
    </div>

    <div class="card" style="overflow:hidden">
      <DataState :loading="loading" :error="error" :empty="!items.length" empty-text="Дел нет">
        <ul class="list">
          <li v-for="a in items" :key="a.id" :class="{ done: isDone(a) }">
            <button class="check" :class="{ on: isDone(a) }" @click="!isDone(a) && complete(a)" :title="isDone(a) ? 'Выполнено' : 'Отметить выполненным'">✓</button>
            <span class="badge gray type">{{ ACTIVITY_TYPES[a.type] || a.type }}</span>
            <div class="info">
              <strong>{{ a.title }}</strong>
              <span class="muted" v-if="a.description">{{ a.description }}</span>
            </div>
            <span class="when muted">{{ date(due(a), true) }}</span>
            <button class="sm ghost" v-if="!isDone(a)" @click="rescheduling = a; newDue = ''">Перенести</button>
          </li>
        </ul>
      </DataState>
    </div>

    <Modal v-if="showForm" title="Новое дело" @close="showForm = false">
      <div class="grid" style="gap:14px">
        <div><label>Тип</label><select v-model="form.type"><option v-for="(l,k) in ACTIVITY_TYPES" :key="k" :value="k">{{ l }}</option></select></div>
        <div><label>Название *</label><input v-model="form.title" placeholder="Звонок клиенту по объекту" /></div>
        <div><label>Срок</label><input v-model="form.due_at" type="datetime-local" /></div>
        <div><label>Описание</label><textarea v-model="form.description" rows="3" /></div>
      </div>
      <template #footer>
        <button class="ghost" @click="showForm = false">Отмена</button>
        <button class="primary" :disabled="saving || !form.title" @click="create">{{ saving ? '…' : 'Создать' }}</button>
      </template>
    </Modal>

    <Modal v-if="rescheduling" title="Перенести дело" @close="rescheduling = null">
      <label>Новый срок</label>
      <input v-model="newDue" type="datetime-local" />
      <template #footer>
        <button class="ghost" @click="rescheduling = null">Отмена</button>
        <button class="primary" :disabled="!newDue" @click="doReschedule">Перенести</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.tabs { display: inline-flex; gap: 4px; margin-bottom: 16px; padding: 4px; background: var(--paper-2); border-radius: 12px; }
.tabs button { background: transparent; border: none; color: var(--ink-soft); box-shadow: none; border-radius: 9px; padding: 8px 16px; }
.tabs button:hover:not(.on) { background: rgba(255, 255, 255, .6); color: var(--ink); }
.tabs button.on { background: var(--card); color: var(--green-deep); box-shadow: var(--shadow-sm); }
.list { list-style: none; margin: 0; padding: 0; }
.list li { display: flex; align-items: center; gap: 14px; padding: 13px 18px; border-bottom: 1px solid var(--line-soft); }
.list li:last-child { border-bottom: none; }
.list li.done { opacity: .55; }
.list li.done strong { text-decoration: line-through; }
.check { width: 26px; height: 26px; border-radius: 50%; padding: 0; display: grid; place-items: center; color: transparent; flex: 0 0 auto; }
.check:hover { border-color: var(--green); color: var(--green); }
.check.on { background: var(--green); border-color: var(--green); color: #fff; }
.type { flex: 0 0 auto; }
.info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.info span { font-size: 12.5px; }
.when { font-size: 12.5px; white-space: nowrap; }
@media (max-width: 600px) { .list li { flex-wrap: wrap; } .info { flex: 1 1 100%; order: 3; } .when { order: 2; } }
</style>
