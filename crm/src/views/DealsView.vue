<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { dealApi } from '../api/deal.js'
import { refs } from '../stores/refs.js'
import { auth } from '../stores/auth.js'
import { toasts } from '../stores/toast.js'
import { money, date, DEFAULT_STAGES } from '../lib/format.js'
import DataState from '../components/DataState.vue'
import Modal from '../components/Modal.vue'
import DealDetail from '../components/DealDetail.vue'

const loading = ref(true)
const error = ref('')
const deals = ref([])
const stages = ref(DEFAULT_STAGES)
const dragId = ref(null)
const selected = ref(null)   // открытая карточка

const showCreate = ref(false)
const saving = ref(false)
const form = reactive({ title: '', amount: '', stage: 'new', comment: '', client_id: '', property_id: '', owner_user_id: '' })

async function load() {
  loading.value = true; error.value = ''
  try {
    refs.ensureAll() // справочники для имён и селектов (не блокируем доску)
    try {
      const s = await dealApi.stages()
      if (s.items?.length) stages.value = s.items.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((x) => ({ code: x.code, title: x.title || x.code }))
    } catch { /* fallback */ }
    deals.value = (await dealApi.list({ limit: 200, offset: 0 })).items
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)

function stageKey(d) { return d.stage || 'new' }
const byStage = computed(() => {
  const map = {}; stages.value.forEach((s) => (map[s.code] = []))
  deals.value.forEach((d) => { const k = stageKey(d); (map[k] = map[k] || []).push(d) })
  return map
})
function stageTotal(code) { return (byStage.value[code] || []).reduce((s, d) => s + (Number(d.amount) || 0), 0) }

function onDragStart(d) { dragId.value = d.id }
async function onDrop(stage) {
  const id = dragId.value; dragId.value = null
  if (!id) return
  const deal = deals.value.find((x) => x.id === id)
  if (!deal || stageKey(deal) === stage.code) return
  const prev = stageKey(deal); deal.stage = stage.code
  try { await dealApi.setStage(id, stage.code); toasts.ok(`Сделка → «${stage.title}»`) }
  catch (e) { deal.stage = prev; toasts.err(e) }
}

async function create() {
  saving.value = true
  try {
    const payload = {
      title: form.title, amount: form.amount ? Number(form.amount) : null, stage: form.stage, comment: form.comment || null,
      client_id: form.client_id || null, property_id: form.property_id || null, owner_user_id: form.owner_user_id || null,
    }
    const d = await dealApi.create(payload)
    if (d?.id) deals.value.unshift(d); else await load()
    toasts.ok('Сделка создана'); showCreate.value = false
    Object.assign(form, { title: '', amount: '', stage: 'new', comment: '', client_id: '', property_id: '', owner_user_id: '' })
  } catch (e) { toasts.err(e) } finally { saving.value = false }
}

function openCreate() { refs.ensureAll(); showCreate.value = true }
async function onDetailChanged() { deals.value = (await dealApi.list({ limit: 200, offset: 0 })).items }
</script>

<template>
  <div>
    <div class="spread" style="margin-bottom:20px">
      <div><h1 style="font-size:28px">Сделки</h1><p class="muted">Перетаскивайте карточки между стадиями · клик — связи и дела</p></div>
      <button class="primary" @click="openCreate">+ Новая сделка</button>
    </div>

    <DataState :loading="loading" :error="error">
      <div class="board">
        <div v-for="s in stages" :key="s.code" class="col" @dragover.prevent @drop="onDrop(s)">
          <div class="col-head"><span class="ctitle">{{ s.title }}</span><span class="badge gray">{{ (byStage[s.code] || []).length }}</span></div>
          <div class="col-sum muted" v-if="stageTotal(s.code)">{{ money(stageTotal(s.code)) }}</div>
          <div class="cards">
            <div v-for="d in byStage[s.code]" :key="d.id" class="deal" draggable="true" @dragstart="onDragStart(d)" @click="selected = d">
              <div class="dtitle">{{ d.title || 'Без названия' }}</div>
              <div class="damount">{{ money(d.amount, d.currency || '₽') }}</div>
              <div class="chips">
                <span v-if="refs.clientLabel(d.client_id)" class="chip client">{{ refs.clientLabel(d.client_id) }}</span>
                <span v-if="refs.propertyLabel(d.property_id)" class="chip prop">{{ refs.propertyLabel(d.property_id) }}</span>
                <span v-if="refs.employeeLabel(d.owner_user_id)" class="chip owner">{{ refs.employeeLabel(d.owner_user_id) }}</span>
              </div>
              <div class="dmeta muted">{{ date(d.created_at) }}</div>
            </div>
            <div v-if="!(byStage[s.code] || []).length" class="col-empty muted">—</div>
          </div>
        </div>
      </div>
    </DataState>

    <Modal v-if="showCreate" title="Новая сделка" wide @close="showCreate = false">
      <div class="grid" style="gap:14px">
        <div class="row" style="gap:12px">
          <div style="flex:2"><label>Название *</label><input v-model="form.title" placeholder="Продажа 2-к, Ленина 14" /></div>
          <div style="flex:1"><label>Сумма, ₽</label><input v-model="form.amount" type="number" /></div>
          <div style="flex:1"><label>Стадия</label><select v-model="form.stage"><option v-for="s in stages" :key="s.code" :value="s.code">{{ s.title }}</option></select></div>
        </div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Клиент</label><select v-model="form.client_id"><option value="">— не выбран —</option><option v-for="c in refs.clients" :key="c.id" :value="c.id">{{ refs.clientLabel(c.id) }}</option></select></div>
          <div style="flex:1"><label>Объект</label><select v-model="form.property_id"><option value="">— не выбран —</option><option v-for="p in refs.properties" :key="p.id" :value="p.id">{{ p.title }}</option></select></div>
          <div v-if="auth.canManage" style="flex:1"><label>Ответственный</label><select v-model="form.owner_user_id"><option value="">— не назначен —</option><option v-for="u in refs.employees" :key="u.id" :value="u.id">{{ refs.employeeLabel(u.id) }}</option></select></div>
        </div>
        <div><label>Комментарий</label><textarea v-model="form.comment" rows="2" /></div>
      </div>
      <template #footer>
        <button class="ghost" @click="showCreate = false">Отмена</button>
        <button class="primary" :disabled="saving || !form.title" @click="create">{{ saving ? 'Сохраняем…' : 'Создать' }}</button>
      </template>
    </Modal>

    <DealDetail v-if="selected" :deal="selected" :stages="stages" @close="selected = null" @changed="onDetailChanged" />
  </div>
</template>

<style scoped>
.board { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 10px; align-items: flex-start; }
.col { flex: 0 0 280px; background: var(--paper-2); border: 1px solid var(--line); border-radius: 12px; padding: 12px; min-height: 120px; }
.col-head { display: flex; justify-content: space-between; align-items: center; }
.ctitle { font-family: var(--serif); font-weight: 600; font-size: 15px; }
.col-sum { font-size: 12px; margin-top: 2px; }
.cards { margin-top: 12px; display: grid; gap: 9px; min-height: 40px; }
.deal { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 12px; cursor: pointer; box-shadow: var(--shadow); transition: transform .08s, box-shadow .12s; }
.deal:hover { box-shadow: 0 4px 16px rgba(28,33,30,.1); transform: translateY(-1px); }
.dtitle { font-weight: 600; font-size: 13.5px; line-height: 1.35; }
.damount { font-family: var(--serif); font-size: 17px; color: var(--green-deep); margin: 6px 0 6px; }
.chips { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
.chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.chip::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: 0 0 auto; }
.chip.client { background: var(--green-soft); color: var(--green-deep); }
.chip.prop { background: #dbeafe; color: #1d4ed8; }
.chip.owner { background: #fef3c7; color: #b45309; }
.dmeta { font-size: 11.5px; }
.col-empty { text-align: center; padding: 14px 0; font-size: 18px; }
</style>
