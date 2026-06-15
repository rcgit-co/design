<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { auth } from '../stores/auth.js'
import { ROLES, initials } from '../lib/format.js'
import Icon from './Icon.vue'

const route = useRoute()
const mobileOpen = ref(false)
watch(() => route.path, () => { mobileOpen.value = false })

const nav = [
  { to: '/dashboard', label: 'Обзор', icon: 'dashboard' },
  { to: '/deals', label: 'Сделки', icon: 'deals' },
  { to: '/clients', label: 'Клиенты', icon: 'clients' },
  { to: '/properties', label: 'Объекты', icon: 'properties' },
  { to: '/activities', label: 'Дела', icon: 'activities' },
  { to: '/employees', label: 'Сотрудники', icon: 'employees', manage: true },
  { to: '/agency', label: 'Агентство', icon: 'agency', manage: true },
]
const visibleNav = computed(() => nav.filter((n) => !n.manage || auth.canManage))
</script>

<template>
  <div class="shell" :class="{ 'drawer-open': mobileOpen }">
    <!-- затемнение под выехавшим меню (моб.) -->
    <div class="scrim" @click="mobileOpen = false"></div>

    <aside class="side">
      <div class="brand">
        <span class="mark">Р</span>
        <span class="word">Реалти<em>CRM</em></span>
        <button class="drawer-close ghost" @click="mobileOpen = false" aria-label="Закрыть меню">
          <Icon name="close" :size="18" />
        </button>
      </div>

      <nav>
        <router-link v-for="n in visibleNav" :key="n.to" :to="n.to" class="navlink" active-class="active">
          <span class="ic"><Icon :name="n.icon" :size="19" /></span>
          <span class="lbl">{{ n.label }}</span>
        </router-link>
      </nav>

      <div class="side-foot">
        <span class="dot-live"></span>
        <span>Шлюз <code>/api → :8081</code></span>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <button class="burger" @click="mobileOpen = true" aria-label="Открыть меню">
          <span></span><span></span><span></span>
        </button>

        <router-link to="/agency" v-if="auth.agencyId" class="agency-tag">
          <span class="muted">Агентство</span><code>{{ String(auth.agencyId).slice(0, 8) }}…</code>
        </router-link>
        <router-link v-else to="/agency" class="agency-tag warn">
          <Icon name="alert" :size="15" /> Агентство не привязано
        </router-link>

        <div class="spacer"></div>

        <div class="user">
          <div class="uinfo">
            <strong>{{ auth.displayName }}</strong>
            <span class="badge green"><span class="dot" />{{ ROLES[auth.role] || auth.role }}</span>
          </div>
          <div class="ava">{{ initials(auth.displayName) }}</div>
          <button class="ghost sm logout" @click="auth.logout()" aria-label="Выйти" title="Выйти">
            <Icon name="logout" :size="17" />
          </button>
        </div>
      </header>

      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in"><component :is="Component" /></transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 256px 1fr; min-height: 100vh; }

/* ---------- Сайдбар ---------- */
.side {
  background: var(--sidebar-grad);
  color: #c7cde0;
  display: flex; flex-direction: column; padding: 20px 14px;
  position: sticky; top: 0; height: 100vh;
  border-right: 1px solid rgba(255, 255, 255, .06);
}
.brand { display: flex; align-items: center; gap: 11px; padding: 6px 8px 22px; position: relative; }
.mark {
  width: 38px; height: 38px; border-radius: 11px;
  background: var(--brand-grad); color: #fff;
  display: grid; place-items: center; font-family: var(--serif); font-weight: 800; font-size: 19px;
  box-shadow: 0 6px 16px -4px rgba(99, 102, 241, .6);
}
.word { font-family: var(--serif); font-size: 19px; font-weight: 700; color: #fff; letter-spacing: -.02em; }
.word em { font-style: normal; color: #a5b4fc; font-size: 12px; margin-left: 2px; font-weight: 600; }
.drawer-close { display: none; margin-left: auto; color: #a5b4fc; padding: 6px; }
.drawer-close:hover { background: rgba(255, 255, 255, .08) !important; color: #fff; }

nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.navlink {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 10px;
  color: #aab3cf; font-weight: 500; font-size: 14px;
  position: relative; transition: background .14s, color .14s;
}
.navlink .ic { width: 20px; display: grid; place-items: center; opacity: .85; }
.navlink:hover { background: rgba(255, 255, 255, .06); color: #fff; }
.navlink.active { background: rgba(99, 102, 241, .18); color: #fff; }
.navlink.active .ic { opacity: 1; color: #c7d2fe; }
.navlink.active::before {
  content: ''; position: absolute; left: -14px; top: 50%; transform: translateY(-50%);
  width: 3px; height: 22px; border-radius: 0 3px 3px 0; background: var(--brand-grad);
}

.side-foot {
  display: flex; align-items: center; gap: 8px;
  font-size: 11.5px; padding: 14px 10px 2px; margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, .08); color: #7e88a8;
}
.side-foot code { background: rgba(255, 255, 255, .07); color: #c7d2fe; }
.dot-live { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 3px rgba(52, 211, 153, .2); flex: 0 0 auto; }

/* ---------- Шапка ---------- */
.main { display: flex; flex-direction: column; min-width: 0; }
.topbar {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 28px; background: rgba(255, 255, 255, .8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 20;
}
.spacer { flex: 1; }
.burger { display: none; flex-direction: column; gap: 4px; padding: 9px; }
.burger span { width: 18px; height: 2px; background: var(--ink); border-radius: 2px; }
.agency-tag { display: inline-flex; gap: 8px; align-items: center; font-size: 13px; color: var(--ink-soft); }
.agency-tag.warn { color: var(--gold); font-weight: 600; }
.user { display: flex; align-items: center; gap: 12px; }
.ava {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--brand-grad); color: #fff;
  display: grid; place-items: center; font-weight: 700; font-size: 13px; flex: 0 0 auto;
}
.uinfo { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.uinfo strong { font-size: 13.5px; }
.logout { padding: 8px; color: var(--ink-soft); }
.content { padding: 28px; max-width: 1320px; width: 100%; margin: 0 auto; }
.scrim { display: none; }

/* ---------- Планшет/телефон ---------- */
@media (max-width: 900px) {
  .shell { grid-template-columns: 1fr; }
  .burger { display: flex; }
  .drawer-close { display: grid; }
  .side {
    position: fixed; top: 0; left: 0; z-index: 60; width: 270px; height: 100vh;
    transform: translateX(-100%); transition: transform .24s ease; box-shadow: 0 0 50px rgba(0, 0, 0, .4);
  }
  .drawer-open .side { transform: translateX(0); }
  .scrim { display: block; position: fixed; inset: 0; background: rgba(8, 11, 22, .5); z-index: 55; opacity: 0; pointer-events: none; transition: opacity .22s; }
  .drawer-open .scrim { opacity: 1; pointer-events: auto; }
  .topbar { padding: 11px 16px; }
  .content { padding: 18px 16px; }
  .agency-tag { display: none; }
  .uinfo { display: none; }
}
</style>
