<script setup>
import { ref, onMounted } from 'vue'
import { dealApi } from '../api/deal.js'
import { clientApi } from '../api/client.js'
import { propertyApi } from '../api/property.js'
import { activityApi } from '../api/activity.js'
import { auth } from '../stores/auth.js'
import { money, date, ACTIVITY_TYPES, DEFAULT_STAGES } from '../lib/format.js'
import DataState from '../components/DataState.vue'
import Icon from '../components/Icon.vue'

const loading = ref(true)
const counts = ref({ deals: '—', clients: '—', properties: '—' })
const funnel = ref([])
const today = ref([])

function num(res) { return res?.pagination?.total ?? res?.items?.length ?? '—' }
async function loadCount(fn) { try { return num(await fn({ limit: 1, offset: 0 })) } catch { return '—' } }

onMounted(async () => {
  const [d, c, p] = await Promise.all([
    loadCount(dealApi.list), loadCount(clientApi.list), loadCount(propertyApi.list),
  ])
  counts.value = { deals: d, clients: c, properties: p }

  try {
    const f = await dealApi.funnel()
    const rows = f?.funnel || f?.stages || (Array.isArray(f) ? f : [])
    funnel.value = rows.length
      ? rows.map((r) => ({ label: r.title || r.label || r.stage || r.code, count: r.count ?? r.deals_count ?? 0, amount: r.amount ?? r.total_amount ?? 0 }))
      : DEFAULT_STAGES.map((s) => ({ label: s.title, count: 0, amount: 0 }))
  } catch {
    funnel.value = DEFAULT_STAGES.map((s) => ({ label: s.title, count: 0, amount: 0 }))
  }

  try { today.value = (await activityApi.today()).items } catch { today.value = [] }
  loading.value = false
})

const maxCount = () => Math.max(1, ...funnel.value.map((r) => Number(r.count) || 0))

const kpis = [
  { key: 'deals', label: 'Сделки', icon: 'briefcase', to: '/deals', link: 'Открыть доску' },
  { key: 'clients', label: 'Клиенты', icon: 'clients', to: '/clients', link: 'База клиентов' },
  { key: 'properties', label: 'Объекты', icon: 'home', to: '/properties', link: 'Каталог' },
]
</script>

<template>
  <div>
    <div class="spread" style="margin-bottom:24px">
      <div>
        <h1 style="font-size:30px">Здравствуйте, {{ auth.displayName.split(' ').slice(-1)[0] }} 👋</h1>
        <p class="muted" style="margin-top:4px">Сводка по агентству на сегодня</p>
      </div>
    </div>

    <DataState :loading="loading">
      <div class="kpis">
        <router-link v-for="k in kpis" :key="k.key" :to="k.to" class="card kpi">
          <span class="kicon"><Icon :name="k.icon" :size="22" /></span>
          <span class="muted klabel">{{ k.label }}</span>
          <strong>{{ counts[k.key] }}</strong>
          <span class="klink">{{ k.link }} <Icon name="chevron" :size="14" /></span>
        </router-link>
      </div>

      <div class="two-col">
        <section class="card pad">
          <div class="spread">
            <h3><span class="h-ic"><Icon name="trending" :size="17" /></span> Воронка продаж</h3>
            <router-link to="/deals" class="muted">подробнее</router-link>
          </div>
          <div class="funnel">
            <div v-for="(r,i) in funnel" :key="i" class="frow">
              <span class="flabel">{{ r.label }}</span>
              <div class="ftrack"><div class="ffill" :style="{ width: ((Number(r.count)||0) / maxCount() * 100) + '%' }" /></div>
              <span class="fcount">{{ r.count || 0 }}</span>
              <span class="famount muted">{{ r.amount ? money(r.amount) : '' }}</span>
            </div>
          </div>
        </section>

        <section class="card pad">
          <div class="spread">
            <h3><span class="h-ic"><Icon name="activities" :size="17" /></span> Дела на сегодня</h3>
            <router-link to="/activities" class="muted">все дела</router-link>
          </div>
          <div v-if="!today.length" class="empty">
            <span class="empty-ic"><Icon name="check" :size="22" /></span>
            <span class="muted">На сегодня дел нет</span>
          </div>
          <ul v-else class="acts">
            <li v-for="a in today" :key="a.id">
              <span class="badge gray">{{ ACTIVITY_TYPES[a.type] || a.type }}</span>
              <span class="atitle">{{ a.title }}</span>
              <span class="muted">{{ date(a.due_at, true) }}</span>
            </li>
          </ul>
        </section>
      </div>
    </DataState>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 18px; }
.kpi {
  padding: 20px 22px; display: flex; flex-direction: column; gap: 6px;
  position: relative; overflow: hidden; color: var(--ink);
  transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease;
}
.kpi:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: #d7dcec; }
.kicon {
  width: 44px; height: 44px; border-radius: 12px; margin-bottom: 6px;
  display: grid; place-items: center; color: var(--green-deep); background: var(--green-soft);
}
.klabel { font-size: 13px; font-weight: 500; }
.kpi strong { font-family: var(--serif); font-size: 38px; line-height: 1; }
.klink { display: inline-flex; align-items: center; gap: 3px; font-size: 13px; font-weight: 600; color: var(--green-deep); margin-top: 4px; }
.kpi:hover .klink { gap: 6px; }

.two-col { display: grid; grid-template-columns: 1.3fr 1fr; gap: 16px; }
.pad { padding: 22px 24px; }
h3 { display: inline-flex; align-items: center; gap: 9px; font-size: 16px; }
.h-ic { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: var(--green-soft); color: var(--green-deep); }

.funnel { margin-top: 18px; display: grid; gap: 14px; }
.frow { display: grid; grid-template-columns: 120px 1fr 40px auto; align-items: center; gap: 12px; font-size: 13.5px; }
.flabel { font-weight: 600; }
.ftrack { height: 10px; background: var(--paper-2); border-radius: 6px; overflow: hidden; }
.ffill { height: 100%; background: var(--brand-grad); border-radius: 6px; transition: width .6s cubic-bezier(.22,.61,.36,1); min-width: 3px; }
.fcount { font-weight: 700; text-align: right; }
.famount { font-size: 12px; }

.acts { list-style: none; padding: 0; margin: 18px 0 0; display: grid; gap: 10px; }
.acts li { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; font-size: 13.5px; padding: 8px 0; border-bottom: 1px solid var(--line-soft); }
.acts li:last-child { border-bottom: none; }
.atitle { font-weight: 500; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 34px 0; }
.empty-ic { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: var(--emerald-soft); color: #047857; }

@media (max-width: 900px) { .kpis, .two-col { grid-template-columns: 1fr; } }
</style>
