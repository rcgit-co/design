<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { propertyApi } from '../api/property.js'
import { toasts } from '../stores/toast.js'
import { money, PROPERTY_STATUS, PROPERTY_TYPES } from '../lib/format.js'
import DataState from '../components/DataState.vue'
import Modal from '../components/Modal.vue'

const loading = ref(true)
const error = ref('')
const all = ref([])
const filters = reactive({ search: '', type: '', rooms: '', price_min: '', price_max: '', status: '' })

const showForm = ref(false)
const saving = ref(false)
const editing = ref(null)
const form = reactive({ title: '', type: 'flat', rooms: '', floor: '', total_floors: '', area: '', price: '', finishing: '', address: '', description: '' })

async function load() {
  loading.value = true; error.value = ''
  try {
    const res = await propertyApi.list({ limit: 200, offset: 0 })
    all.value = res.items
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)

const items = computed(() => {
  const q = filters.search.trim().toLowerCase()
  return all.value.filter((p) => {
    if (filters.type && p.type !== filters.type) return false
    if (filters.status && p.status !== filters.status) return false
    if (filters.rooms && Number(p.rooms) < Number(filters.rooms)) return false
    if (filters.price_min && Number(p.price) < Number(filters.price_min)) return false
    if (filters.price_max && Number(p.price) > Number(filters.price_max)) return false
    if (q && !`${p.title} ${p.address || ''}`.toLowerCase().includes(q)) return false
    return true
  })
})

function openCreate() {
  editing.value = null
  Object.assign(form, { title: '', type: 'flat', rooms: '', floor: '', total_floors: '', area: '', price: '', finishing: '', address: '', description: '' })
  showForm.value = true
}
function openEdit(p) {
  editing.value = p
  Object.assign(form, { title: p.title || '', type: p.type || 'flat', rooms: p.rooms ?? '', floor: p.floor ?? '', total_floors: p.total_floors ?? '', area: p.area ?? '', price: p.price ?? '', finishing: p.finishing || '', address: p.address || '', description: p.description || '' })
  showForm.value = true
}
function numOrNull(v) { return v === '' || v == null ? null : Number(v) }
async function save() {
  saving.value = true
  try {
    const payload = {
      title: form.title, type: form.type, finishing: form.finishing || null, address: form.address || null, description: form.description || null,
      rooms: numOrNull(form.rooms), floor: numOrNull(form.floor), total_floors: numOrNull(form.total_floors), area: numOrNull(form.area), price: numOrNull(form.price),
    }
    if (editing.value) { await propertyApi.update(editing.value.id, payload); toasts.ok('Объект обновлён') }
    else { await propertyApi.create(payload); toasts.ok('Объект добавлен') }
    showForm.value = false; await load()
  } catch (e) { toasts.err(e) } finally { saving.value = false }
}
async function setStatus(p, status) {
  try { await propertyApi.setStatus(p.id, status); p.status = status; toasts.ok('Статус изменён') }
  catch (e) { toasts.err(e) }
}
</script>

<template>
  <div>
    <div class="spread" style="margin-bottom:18px">
      <div><h1 style="font-size:28px">Объекты</h1><p class="muted">Каталог недвижимости агентства</p></div>
      <button class="primary" @click="openCreate">+ Объект</button>
    </div>

    <div class="toolbar card">
      <input v-model="filters.search" placeholder="Поиск…" style="flex:2;min-width:160px" />
      <select v-model="filters.type"><option value="">Тип</option><option v-for="(l,k) in PROPERTY_TYPES" :key="k" :value="k">{{ l }}</option></select>
      <select v-model="filters.rooms"><option value="">Комнат</option><option v-for="n in [1,2,3,4]" :key="n" :value="n">{{ n }}+</option></select>
      <input v-model="filters.price_min" type="number" placeholder="Цена от" style="max-width:120px" />
      <input v-model="filters.price_max" type="number" placeholder="до" style="max-width:120px" />
      <select v-model="filters.status"><option value="">Статус</option><option v-for="(v,k) in PROPERTY_STATUS" :key="k" :value="k">{{ v.label }}</option></select>
    </div>

    <div style="margin-top:14px">
      <DataState :loading="loading" :error="error" :empty="!items.length" empty-text="Объектов не найдено">
        <div class="grid-cards">
          <div v-for="p in items" :key="p.id" class="card prop">
            <div class="ptop">
              <span class="badge" :class="(PROPERTY_STATUS[p.status]||{}).cls || 'gray'">{{ (PROPERTY_STATUS[p.status]||{}).label || p.status || '—' }}</span>
              <span class="muted ptype">{{ PROPERTY_TYPES[p.type] || p.type }}</span>
            </div>
            <h3 class="ptitle">{{ p.title || 'Объект' }}</h3>
            <div class="pprice">{{ money(p.price) }}</div>
            <div class="pmeta muted">
              <span v-if="p.rooms">{{ p.rooms }}-комн.</span>
              <span v-if="p.area">{{ p.area }} м²</span>
              <span v-if="p.floor">{{ p.floor }}<span v-if="p.total_floors">/{{ p.total_floors }}</span> эт.</span>
            </div>
            <div class="paddr muted">{{ p.address || '' }}</div>
            <div class="pactions">
              <select :value="p.status" @change="setStatus(p, $event.target.value)" class="sm-select">
                <option v-for="(v,k) in PROPERTY_STATUS" :key="k" :value="k">{{ v.label }}</option>
              </select>
              <button class="sm ghost" @click="openEdit(p)">Изм.</button>
            </div>
          </div>
        </div>
      </DataState>
    </div>

    <Modal v-if="showForm" :title="editing ? 'Редактирование объекта' : 'Новый объект'" wide @close="showForm = false">
      <div class="grid" style="gap:14px">
        <div><label>Название *</label><input v-model="form.title" placeholder="2-к квартира, ул. Ленина 14" /></div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Тип</label><select v-model="form.type"><option v-for="(l,k) in PROPERTY_TYPES" :key="k" :value="k">{{ l }}</option></select></div>
          <div style="flex:1"><label>Комнат</label><input v-model="form.rooms" type="number" /></div>
          <div style="flex:1"><label>Площадь, м²</label><input v-model="form.area" type="number" /></div>
        </div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Этаж</label><input v-model="form.floor" type="number" /></div>
          <div style="flex:1"><label>Этажей</label><input v-model="form.total_floors" type="number" /></div>
          <div style="flex:1"><label>Отделка</label><input v-model="form.finishing" placeholder="чистовая" /></div>
        </div>
        <div><label>Цена, ₽</label><input v-model="form.price" type="number" /></div>
        <div><label>Адрес</label><input v-model="form.address" /></div>
        <div><label>Описание</label><textarea v-model="form.description" rows="3" /></div>
      </div>
      <template #footer>
        <button class="ghost" @click="showForm = false">Отмена</button>
        <button class="primary" :disabled="saving || !form.title" @click="save">{{ saving ? '…' : 'Сохранить' }}</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.toolbar { display: flex; gap: 10px; padding: 12px 14px; flex-wrap: wrap; }
.toolbar select { max-width: 130px; }
.grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(248px, 1fr)); gap: 16px; }
.prop { padding: 16px 18px; display: flex; flex-direction: column; gap: 4px; }
.ptop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.ptype { font-size: 12px; }
.ptitle { font-size: 16px; line-height: 1.3; }
.pprice { font-family: var(--serif); font-size: 22px; color: var(--green-deep); margin: 4px 0; }
.pmeta { display: flex; gap: 12px; font-size: 13px; flex-wrap: wrap; }
.paddr { font-size: 12.5px; min-height: 16px; }
.pactions { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
.sm-select { padding: 5px 8px; font-size: 12px; flex: 1; }
</style>
