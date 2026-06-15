<script setup>
import { ref, reactive, onMounted } from 'vue'
import { dealApi } from '../api/deal.js'
import { activityApi } from '../api/activity.js'
import { refs } from '../stores/refs.js'
import { auth } from '../stores/auth.js'
import { toasts } from '../stores/toast.js'
import { money, date, ACTIVITY_TYPES } from '../lib/format.js'
import Modal from './Modal.vue'

const props = defineProps({ deal: Object, stages: Array })
const emit = defineEmits(['close', 'changed'])

const d = reactive({ ...props.deal })
const savingMain = ref(false)

const activities = ref([])
const history = ref([])
const loadingExtra = ref(true)
const newAct = reactive({ title: '', type: 'call', due_at: '' })
const addingAct = ref(false)

onMounted(async () => {
  await refs.ensureAll()
  try {
    const [a, h] = await Promise.allSettled([
      activityApi.list({ deal_id: d.id, limit: 50, offset: 0 }),
      dealApi.history(d.id),
    ])
    if (a.status === 'fulfilled') activities.value = a.value.items
    if (h.status === 'fulfilled') history.value = h.value.items
  } finally { loadingExtra.value = false }
})

async function saveMain() {
  savingMain.value = true
  try {
    await dealApi.update(d.id, { title: d.title, amount: d.amount ? Number(d.amount) : null, comment: d.comment || null })
    toasts.ok('Сохранено'); emit('changed')
  } catch (e) { toasts.err(e) } finally { savingMain.value = false }
}
async function changeStage(e) {
  const stage = e.target.value
  try { await dealApi.setStage(d.id, stage); d.stage = stage; toasts.ok('Стадия изменена'); emit('changed') }
  catch (err) { toasts.err(err) }
}
async function changeClient(e) {
  const v = e.target.value || null
  try { await dealApi.update(d.id, { client_id: v }); d.client_id = v; toasts.ok('Клиент привязан'); emit('changed') }
  catch (err) { toasts.err(err) }
}
async function changeProperty(e) {
  const v = e.target.value || null
  try { await dealApi.update(d.id, { property_id: v }); d.property_id = v; toasts.ok('Объект привязан'); emit('changed') }
  catch (err) { toasts.err(err) }
}
async function changeOwner(e) {
  const v = e.target.value || null
  try { await dealApi.assign(d.id, v); d.owner_user_id = v; toasts.ok('Ответственный назначен'); emit('changed') }
  catch (err) { toasts.err(err) }
}

async function addActivity() {
  if (!newAct.title.trim()) return
  addingAct.value = true
  try {
    const a = await activityApi.create({
      title: newAct.title.trim(), type: newAct.type,
      due_at: newAct.due_at ? new Date(newAct.due_at).toISOString() : null,
      deal_id: d.id, client_id: d.client_id || null, property_id: d.property_id || null,
    })
    activities.value.unshift(a)
    Object.assign(newAct, { title: '', type: 'call', due_at: '' })
    toasts.ok('Дело создано и привязано')
  } catch (e) { toasts.err(e) } finally { addingAct.value = false }
}
async function completeAct(a) {
  try { await activityApi.complete(a.id); a.status = 'done'; toasts.ok('Выполнено') }
  catch (e) { toasts.err(e) }
}
function isDone(a) { return a.status === 'done' || a.completed_at }
function eventLabel(ev) {
  return { created: 'создана', stage_changed: 'смена стадии', assigned: 'назначен ответственный', closed: 'закрыта', updated: 'изменена' }[ev] || ev
}
</script>

<template>
  <Modal :title="d.title || 'Сделка'" wide @close="emit('close')">
    <div class="dd">
      <!-- Основное -->
      <div class="block">
        <div class="row" style="gap:12px">
          <div style="flex:2"><label>Название</label><input v-model="d.title" /></div>
          <div style="flex:1"><label>Сумма, ₽</label><input v-model="d.amount" type="number" /></div>
          <div style="flex:1"><label>Стадия</label>
            <select :value="d.stage" @change="changeStage"><option v-for="s in stages" :key="s.code" :value="s.code">{{ s.title }}</option></select>
          </div>
        </div>
        <div style="margin-top:12px"><label>Комментарий</label><textarea v-model="d.comment" rows="2" /></div>
        <button class="primary sm" style="margin-top:12px" :disabled="savingMain" @click="saveMain">{{ savingMain ? '…' : 'Сохранить' }}</button>
      </div>

      <!-- Связи -->
      <div class="block">
        <h4>Связи</h4>
        <div class="links">
          <div>
            <label>Клиент</label>
            <select :value="d.client_id || ''" @change="changeClient">
              <option value="">— не выбран —</option>
              <option v-for="c in refs.clients" :key="c.id" :value="c.id">{{ refs.clientLabel(c.id) }}</option>
            </select>
          </div>
          <div>
            <label>Объект</label>
            <select :value="d.property_id || ''" @change="changeProperty">
              <option value="">— не выбран —</option>
              <option v-for="p in refs.properties" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>
          <div v-if="auth.canManage">
            <label>Ответственный</label>
            <select :value="d.owner_user_id || ''" @change="changeOwner">
              <option value="">— не назначен —</option>
              <option v-for="u in refs.employees" :key="u.id" :value="u.id">{{ refs.employeeLabel(u.id) }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Дела по сделке -->
      <div class="block">
        <h4>Дела по сделке</h4>
        <div class="addact">
          <select v-model="newAct.type" style="max-width:120px"><option v-for="(l,k) in ACTIVITY_TYPES" :key="k" :value="k">{{ l }}</option></select>
          <input v-model="newAct.title" placeholder="что сделать" @keyup.enter="addActivity" />
          <input v-model="newAct.due_at" type="datetime-local" style="max-width:190px" />
          <button class="sm" :disabled="addingAct || !newAct.title" @click="addActivity">+</button>
        </div>
        <ul class="acts" v-if="!loadingExtra">
          <li v-for="a in activities" :key="a.id" :class="{ done: isDone(a) }">
            <button class="chk" :class="{ on: isDone(a) }" @click="!isDone(a) && completeAct(a)">✓</button>
            <span class="badge gray">{{ ACTIVITY_TYPES[a.type] || a.type }}</span>
            <span class="t">{{ a.title }}</span>
            <span class="muted">{{ date(a.due_at, true) }}</span>
          </li>
          <li v-if="!activities.length" class="muted">дел пока нет</li>
        </ul>
        <div v-else class="muted">загрузка…</div>
      </div>

      <!-- История -->
      <div class="block" v-if="history.length">
        <h4>История</h4>
        <ul class="hist">
          <li v-for="(h,i) in history" :key="i">
            <span class="muted">{{ date(h.created_at, true) }}</span>
            <span>{{ eventLabel(h.event) }}<span v-if="h.from_value || h.to_value" class="muted"> · {{ h.from_value || '—' }} → {{ h.to_value || '—' }}</span></span>
          </li>
        </ul>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.dd { display: grid; gap: 20px; }
.block h4 { font-size: 15px; margin-bottom: 10px; }
.links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.addact { display: flex; gap: 8px; margin-bottom: 12px; }
.acts, .hist { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.acts li { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.acts li.done { opacity: .55; }
.acts li.done .t { text-decoration: line-through; }
.acts .t { flex: 1; font-weight: 500; }
.chk { width: 22px; height: 22px; border-radius: 50%; padding: 0; display: grid; place-items: center; color: transparent; flex: 0 0 auto; }
.chk:hover { border-color: var(--green); color: var(--green); }
.chk.on { background: var(--green); border-color: var(--green); color: #fff; }
.hist li { display: grid; grid-template-columns: 150px 1fr; gap: 10px; font-size: 12.5px; }
@media (max-width: 640px) { .links { grid-template-columns: 1fr; } .addact { flex-wrap: wrap; } .addact > * { max-width: none !important; flex: 1 1 100%; } .hist li { grid-template-columns: 1fr; gap: 2px; } }
</style>
