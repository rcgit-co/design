<script setup>
import { ref, reactive, onMounted } from 'vue'
import { agencyApi } from '../api/agency.js'
import { auth } from '../stores/auth.js'
import { toasts } from '../stores/toast.js'
import { date, CONTRACT_TYPES, ROLES } from '../lib/format.js'
import DataState from '../components/DataState.vue'
import Modal from '../components/Modal.vue'

const loading = ref(true)
const error = ref('')
const noAgency = ref(false)     // агентство ещё не создано (404)
const justCreated = ref(false)  // только что создали — нужно перелогиниться

const agency = ref(null)
const aid = ref(null)

const info = reactive({ name: '', legal_name: '', legal_address: '' })
const brand = reactive({ color_bg: '#FFFFFF', color_accent: '#2563EB', font: 'Inter' })
const contracts = ref([])

// форма создания
const isOwner = auth.role === 'owner'
const createForm = reactive({ inn: auth.claims?.inn || '', name: '' })
const creating = ref(false)

const savingInfo = ref(false)
const savingBrand = ref(false)
const showContract = ref(false)
const savingContract = ref(false)
const cform = reactive({ number: '', counterparty_name: '', counterparty_inn: '', type: 'developer', signed_at: '', valid_until: '' })

async function load() {
  loading.value = true; error.value = ''; noAgency.value = false
  try {
    const a = await agencyApi.me()
    if (!a || !a.id) { noAgency.value = true; return }   // агентства ещё нет
    agency.value = a
    aid.value = a.id
    Object.assign(info, { name: a.name || '', legal_name: a.legal_name || '', legal_address: a.legal_address || '' })
    const [b, c] = await Promise.allSettled([agencyApi.getBranding(aid.value), agencyApi.contracts(aid.value)])
    if (b.status === 'fulfilled' && b.value) Object.assign(brand, {
      color_bg: b.value.color_bg || '#FFFFFF', color_accent: b.value.color_accent || '#2563EB', font: b.value.font || 'Inter',
    })
    if (c.status === 'fulfilled') contracts.value = c.value.items
  } catch (e) {
    // 404 «не найдено» или 400 «нет ИНН в токене» — значит агентство ещё не создано
    if (e.status === 404 || e.status === 400) noAgency.value = true
    else error.value = e.message
  } finally { loading.value = false }
}
onMounted(load)

async function createAgency() {
  creating.value = true
  try {
    await agencyApi.create({ inn: createForm.inn.replace(/\D/g, ''), name: createForm.name })
    toasts.ok('Агентство создано')
    justCreated.value = true
    noAgency.value = false
  } catch (e) { toasts.err(e) } finally { creating.value = false }
}

async function saveInfo() {
  savingInfo.value = true
  try { await agencyApi.update(aid.value, { ...info }); toasts.ok('Реквизиты сохранены') }
  catch (e) { toasts.err(e) } finally { savingInfo.value = false }
}
async function saveBrand() {
  savingBrand.value = true
  try { await agencyApi.updateBranding(aid.value, { ...brand }); toasts.ok('Брендинг сохранён') }
  catch (e) { toasts.err(e) } finally { savingBrand.value = false }
}
async function addContract() {
  savingContract.value = true
  try {
    await agencyApi.addContract(aid.value, {
      number: cform.number, counterparty_name: cform.counterparty_name || null, counterparty_inn: cform.counterparty_inn || null,
      type: cform.type, signed_at: cform.signed_at || null, valid_until: cform.valid_until || null,
    })
    toasts.ok('Договор добавлен'); showContract.value = false
    Object.assign(cform, { number: '', counterparty_name: '', counterparty_inn: '', type: 'developer', signed_at: '', valid_until: '' })
    contracts.value = (await agencyApi.contracts(aid.value)).items
  } catch (e) { toasts.err(e) } finally { savingContract.value = false }
}
</script>

<template>
  <div>
    <h1 style="font-size:28px;margin-bottom:4px">Агентство</h1>
    <p class="muted" style="margin-bottom:20px">Реквизиты, брендинг и договоры</p>

    <!-- Только что создали — нужно перелогиниться, чтобы agency_id попал в токен -->
    <div v-if="justCreated" class="card pad rebind">
      <h3>Агентство создано 🎉</h3>
      <p style="margin:10px 0 16px">
        Чтобы привязать его к сессии, нужно войти заново — на входе сервер запишет
        <code>agency_id</code> в токен. После этого заработают сделки, клиенты и объекты.
      </p>
      <button class="primary" @click="auth.logout()">Выйти и войти заново</button>
    </div>

    <!-- Агентства ещё нет: форма создания -->
    <div v-else-if="noAgency" class="card pad create">
      <h3>Агентство ещё не создано</h3>
      <p class="muted" style="margin:8px 0 18px">
        В токене нет <code>agency_id</code>, потому что для вашего ИНН ещё нет агентства.
        Создайте его — ИНН должен совпадать с вашим.
      </p>

      <div v-if="!isOwner" class="warn-box">
        Создавать агентство может только владелец (<strong>owner</strong>). Ваша роль — {{ ROLES[auth.role] || auth.role }}.
        Попросите владельца компании создать агентство.
      </div>

      <div v-else class="grid" style="gap:14px;max-width:420px">
        <div>
          <label>ИНН *</label>
          <input v-model="createForm.inn" placeholder="7707083893" />
          <small class="hint">подставлен из вашего токена; должен совпадать с ИНН компании</small>
        </div>
        <div><label>Название агентства *</label><input v-model="createForm.name" placeholder="АН «Парус»" /></div>
        <button class="primary" :disabled="creating || !createForm.inn || !createForm.name" @click="createAgency" style="justify-self:start">
          {{ creating ? 'Создаём…' : 'Создать агентство' }}
        </button>
      </div>
    </div>

    <!-- Агентство есть -->
    <DataState v-else :loading="loading" :error="error">
      <div class="cols">
        <section class="card pad">
          <h3>Реквизиты</h3>
          <div class="grid" style="gap:13px;margin-top:14px">
            <div class="row" style="gap:12px">
              <div style="flex:1"><label>ИНН</label><input :value="agency?.inn" disabled /></div>
              <div style="flex:1"><label>Статус</label><input :value="agency?.status" disabled /></div>
            </div>
            <div><label>Название</label><input v-model="info.name" /></div>
            <div><label>Юр. название</label><input v-model="info.legal_name" /></div>
            <div><label>Юр. адрес</label><input v-model="info.legal_address" /></div>
            <button class="primary" :disabled="savingInfo" @click="saveInfo" style="justify-self:start">{{ savingInfo ? '…' : 'Сохранить реквизиты' }}</button>
          </div>
        </section>

        <section class="card pad">
          <h3>Брендинг</h3>
          <div class="preview" :style="{ background: brand.color_bg, color: brand.color_accent, fontFamily: brand.font }">
            <span class="logo" :style="{ background: brand.color_accent, color: brand.color_bg }">{{ (info.name || 'А')[0] }}</span>
            <div>
              <strong :style="{ fontFamily: brand.font }">{{ info.name || 'Ваше агентство' }}</strong>
              <em>акцент {{ brand.color_accent }} · {{ brand.font }}</em>
            </div>
          </div>
          <div class="grid" style="gap:13px;margin-top:14px">
            <div class="row" style="gap:12px;align-items:flex-end">
              <div><label>Фон</label><input v-model="brand.color_bg" type="color" style="width:56px;height:40px;padding:3px" /></div>
              <div><label>Акцент</label><input v-model="brand.color_accent" type="color" style="width:56px;height:40px;padding:3px" /></div>
              <div style="flex:1"><label>Шрифт</label><input v-model="brand.font" placeholder="Inter" /></div>
            </div>
            <button class="primary" :disabled="savingBrand" @click="saveBrand" style="justify-self:start">{{ savingBrand ? '…' : 'Сохранить брендинг' }}</button>
          </div>
        </section>
      </div>

      <section class="card pad" style="margin-top:16px">
        <div class="spread"><h3>Договоры</h3><button class="sm" @click="showContract = true">+ Договор</button></div>
        <div v-if="contracts.length" class="table-scroll"><table style="margin-top:12px">
          <thead><tr><th>№</th><th>Контрагент</th><th>Тип</th><th>Подписан</th><th>Действует до</th></tr></thead>
          <tbody>
            <tr v-for="c in contracts" :key="c.id">
              <td class="mono">{{ c.number }}</td>
              <td>{{ c.counterparty_name || '—' }}<span class="muted" v-if="c.counterparty_inn"> · {{ c.counterparty_inn }}</span></td>
              <td><span class="badge gray">{{ CONTRACT_TYPES[c.type] || c.type }}</span></td>
              <td class="muted">{{ date(c.signed_at) }}</td>
              <td class="muted">{{ date(c.valid_until) }}</td>
            </tr>
          </tbody>
        </table></div>
        <p v-else class="muted" style="margin-top:12px">Договоров пока нет</p>
      </section>
    </DataState>

    <Modal v-if="showContract" title="Новый договор" @close="showContract = false">
      <div class="grid" style="gap:14px">
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Номер *</label><input v-model="cform.number" /></div>
          <div style="flex:1"><label>Тип</label><select v-model="cform.type"><option v-for="(l,k) in CONTRACT_TYPES" :key="k" :value="k">{{ l }}</option></select></div>
        </div>
        <div><label>Контрагент</label><input v-model="cform.counterparty_name" /></div>
        <div><label>ИНН контрагента</label><input v-model="cform.counterparty_inn" /></div>
        <div class="row" style="gap:12px">
          <div style="flex:1"><label>Подписан</label><input v-model="cform.signed_at" type="date" /></div>
          <div style="flex:1"><label>Действует до</label><input v-model="cform.valid_until" type="date" /></div>
        </div>
      </div>
      <template #footer>
        <button class="ghost" @click="showContract = false">Отмена</button>
        <button class="primary" :disabled="savingContract || !cform.number" @click="addContract">{{ savingContract ? '…' : 'Добавить' }}</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pad { padding: 20px 22px; }
.create h3, .rebind h3 { font-size: 19px; }
.rebind { border-left: 3px solid var(--green); }
.create code, .rebind code { background: var(--paper-2); padding: 1px 6px; border-radius: 5px; font-size: 13px; }
.warn-box { background: #f5ecd9; color: #8a6420; padding: 12px 14px; border-radius: 10px; font-size: 13.5px; max-width: 520px; }
.hint { color: var(--ink-faint); font-size: 11.5px; display: block; margin-top: 5px; }
.preview { margin-top: 14px; border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 14px; border: 1px solid var(--line); }
.preview strong { display: block; font-size: 18px; }
.preview em { font-style: normal; opacity: .8; font-size: 12px; }
.logo { width: 46px; height: 46px; border-radius: 11px; display: grid; place-items: center; font-weight: 700; font-size: 22px; }
input:disabled { opacity: .7; background: var(--paper-2); }
@media (max-width: 860px) { .cols { grid-template-columns: 1fr; } }
</style>
