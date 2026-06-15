<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth.js'
import { toasts } from '../stores/toast.js'
import Icon from '../components/Icon.vue'

const router = useRouter()
const form = reactive({ inn: '', login: '', password: '' })
const busy = ref(false)

async function submit() {
  busy.value = true
  try {
    await auth.login({ inn: form.inn, login: form.login, password: form.password })
    toasts.ok('Вход выполнен')
    router.replace('/dashboard')
  } catch (e) {
    toasts.err(e)
  } finally {
    busy.value = false
  }
}

const perks = [
  { icon: 'deals', text: 'Канбан сделок и воронка продаж' },
  { icon: 'clients', text: 'База клиентов и лидов' },
  { icon: 'properties', text: 'Каталог объектов и ЖК' },
  { icon: 'activities', text: 'Календарь дел и показов' },
]
</script>

<template>
  <div class="auth">
    <div class="pane art">
      <div class="art-bg" aria-hidden="true"></div>
      <div class="art-inner">
        <span class="mark">Р</span>
        <h1>Реалти<span>CRM</span></h1>
        <p>Сделки, клиенты и объекты агентства недвижимости — в одном окне.</p>
        <ul>
          <li v-for="(perk, i) in perks" :key="i">
            <span class="pic"><Icon :name="perk.icon" :size="18" /></span>{{ perk.text }}
          </li>
        </ul>
      </div>
    </div>

    <div class="pane form-side">
      <div class="form-box">
        <h2>Вход в систему</h2>
        <p class="muted">Введите реквизиты вашего агентства</p>

        <form @submit.prevent="submit">
          <div class="grid" style="gap:16px;margin-top:24px">
            <div>
              <label for="li-inn">ИНН агентства</label>
              <input id="li-inn" v-model="form.inn" placeholder="7707083893" autocomplete="off" />
            </div>
            <div>
              <label for="li-login">Логин</label>
              <input id="li-login" v-model="form.login" placeholder="ivanov" autocomplete="username" />
            </div>
            <div>
              <label for="li-pass">Пароль</label>
              <input id="li-pass" v-model="form.password" type="password" placeholder="••••••••" autocomplete="current-password" />
            </div>
            <button class="primary" :disabled="busy" type="submit" style="margin-top:4px">
              {{ busy ? 'Входим…' : 'Войти' }}
            </button>
          </div>
        </form>

        <p class="alt">Нет аккаунта агентства? <router-link to="/register">Зарегистрировать</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth { display: grid; grid-template-columns: 1.05fr 1fr; min-height: 100vh; }

.art {
  position: relative; overflow: hidden;
  background: var(--sidebar-grad); color: #c7d2fe;
  display: grid; place-items: center; padding: 40px;
}
.art-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 18% 22%, rgba(139, 92, 246, .35), transparent 42%),
    radial-gradient(circle at 85% 80%, rgba(99, 102, 241, .3), transparent 45%);
}
.art-inner { position: relative; max-width: 380px; }
.art-inner .mark {
  display: inline-grid; place-items: center; width: 52px; height: 52px; border-radius: 14px;
  background: var(--brand-grad); color: #fff; font-family: var(--serif); font-weight: 800; font-size: 27px;
  box-shadow: 0 10px 30px -8px rgba(99, 102, 241, .7);
}
.art-inner h1 { color: #fff; font-size: 40px; margin: 20px 0 14px; }
.art-inner h1 span { color: #a5b4fc; font-size: 22px; }
.art-inner p { font-size: 16px; line-height: 1.6; color: #aab3cf; }
.art-inner ul { list-style: none; padding: 0; margin: 30px 0 0; display: grid; gap: 14px; }
.art-inner li { display: flex; align-items: center; gap: 12px; font-size: 15px; color: #dfe3f0; }
.pic { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; background: rgba(255, 255, 255, .08); color: #c7d2fe; flex: 0 0 auto; }

.form-side { display: grid; place-items: center; padding: 40px; }
.form-box { width: 350px; max-width: 100%; }
.form-box h2 { font-size: 28px; }
.alt { margin-top: 24px; font-size: 13.5px; }

@media (max-width: 820px) { .auth { grid-template-columns: 1fr; } .art { display: none; } }
</style>
