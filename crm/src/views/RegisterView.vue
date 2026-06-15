<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth.js'
import { authApi } from '../api/auth.js'
import { agencyApi } from '../api/agency.js'
import { toasts } from '../stores/toast.js'

const router = useRouter()
// Компания создаётся по ИНН; первый пользователь становится владельцем.
// Здесь же сразу заводим агентство и логинимся, чтобы agency_id попал в токен.
const form = reactive({ inn: '', full_name: '', email: '', login: '', phone: '', password: '', agency_name: '' })
const busy = ref(false)
const step = ref('')          // текст текущего шага
const errors = ref({})
const generalError = ref('')

function validate() {
  const e = {}
  const inn = form.inn.replace(/\D/g, '')
  if (![10, 12].includes(inn.length)) e.inn = 'ИНН — 10 или 12 цифр (с корректной контрольной суммой)'
  if (!form.full_name) e.full_name = 'Укажите ФИО'
  if (!form.email) e.email = 'Укажите email'
  if (!form.password || form.password.length < 6) e.password = 'Минимум 6 символов'
  else if (!/[A-Za-zА-Яа-я]/.test(form.password) || !/[0-9]/.test(form.password)) e.password = 'Нужна хотя бы одна буква и одна цифра'
  if (form.login && form.login.length < 3) e.login = 'Логин — от 3 символов'
  if (!form.agency_name) e.agency_name = 'Укажите название агентства'
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  generalError.value = ''
  if (!validate()) return
  busy.value = true
  const inn = form.inn.replace(/\D/g, '')
  const loginId = form.login || form.email   // вход принимает и логин, и email
  try {
    // Повторная регистрация агентства запрещена: если ИНН занят — отправляем на вход.
    step.value = 'Проверяем ИНН…'
    try {
      const chk = await authApi.checkInn(inn)
      if (chk && chk.available === false) {
        errors.value = { ...errors.value, inn: 'Агентство с этим ИНН уже зарегистрировано' }
        generalError.value = 'Агентство с этим ИНН уже зарегистрировано. Войдите под своей учётной записью, либо попросите владельца добавить вас как сотрудника.'
        busy.value = false; step.value = ''
        return
      }
    } catch { /* проверка не критична — продолжаем, бэк всё равно проверит */ }

    // 1) Регистрация владельца + компании
    step.value = 'Регистрируем владельца…'
    await auth.register({ inn, full_name: form.full_name, email: form.email, login: form.login || null, phone: form.phone || null, password: form.password })

    // 2) Нужен токен владельца, чтобы создать агентство (если register его не вернул — логинимся)
    if (!auth.isAuthed) {
      step.value = 'Входим…'
      await auth.login({ inn, login: loginId, password: form.password })
    }

    // 3) Сразу создаём агентство (роль owner). 409 = уже существует — это ок.
    step.value = 'Создаём агентство…'
    try {
      await agencyApi.create({ inn, name: form.agency_name })
    } catch (e) {
      if (e.status !== 409) toasts.err('Агентство не создано: ' + e.message)
    }

    // 4) Повторный вход — теперь auth положит agency_id в токен
    step.value = 'Привязываем агентство…'
    await auth.login({ inn, login: loginId, password: form.password })

    if (auth.agencyId) toasts.ok('Готово — агентство привязано')
    else toasts.err('Агентство создано, но agency_id не привязался. Проверьте, что agency-сервис доступен (AGENCY_URL, INTERNAL_API_TOKEN), и войдите снова.')
    router.replace('/dashboard')
  } catch (e) {
    const fieldErrors = e?.payload?.errors
    if (fieldErrors && typeof fieldErrors === 'object') errors.value = { ...errors.value, ...fieldErrors }
    generalError.value = e.message
    toasts.err(e)
  } finally { busy.value = false; step.value = '' }
}
</script>

<template>
  <div class="auth">
    <div class="form-side">
      <div class="form-box card">
        <h2>Регистрация агентства</h2>
        <p class="muted">Создаём владельца и агентство сразу — после регистрации можно работать.</p>

        <div v-if="generalError" class="err-banner">{{ generalError }}</div>

        <form @submit.prevent="submit" novalidate>
          <div class="grid two">
            <div class="full">
              <label>Название агентства *</label>
              <input v-model="form.agency_name" placeholder="АН «Парус»" :class="{ bad: errors.agency_name }" />
              <small v-if="errors.agency_name" class="fe">{{ errors.agency_name }}</small>
            </div>
            <div>
              <label>ИНН *</label>
              <input v-model="form.inn" placeholder="7707083893" :class="{ bad: errors.inn }" />
              <small v-if="errors.inn" class="fe">{{ errors.inn }}</small>
              <small v-else class="hint">10 или 12 цифр, реальный ИНН</small>
            </div>
            <div>
              <label>Телефон</label>
              <input v-model="form.phone" placeholder="+7…" />
            </div>
            <div class="full">
              <label>ФИО владельца *</label>
              <input v-model="form.full_name" placeholder="Иван Иванов" :class="{ bad: errors.full_name }" />
              <small v-if="errors.full_name" class="fe">{{ errors.full_name }}</small>
            </div>
            <div>
              <label>Email *</label>
              <input v-model="form.email" type="email" placeholder="owner@agency.ru" :class="{ bad: errors.email }" />
              <small v-if="errors.email" class="fe">{{ errors.email }}</small>
            </div>
            <div>
              <label>Логин</label>
              <input v-model="form.login" placeholder="ivanov" :class="{ bad: errors.login }" />
              <small v-if="errors.login" class="fe">{{ errors.login }}</small>
            </div>
            <div class="full">
              <label>Пароль *</label>
              <input v-model="form.password" type="password" placeholder="минимум 6: буквы + цифры" :class="{ bad: errors.password }" />
              <small v-if="errors.password" class="fe">{{ errors.password }}</small>
              <small v-else class="hint">от 6 символов, хотя бы одна буква и одна цифра</small>
            </div>
            <div class="full">
              <button class="primary" :disabled="busy" type="submit" style="width:100%">
                {{ busy ? (step || 'Создаём…') : 'Зарегистрировать и создать агентство' }}
              </button>
            </div>
          </div>
        </form>

        <p class="alt">Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth { display: grid; place-items: center; min-height: 100vh; padding: 40px;
  background:
    radial-gradient(circle at 12% 8%, rgba(139, 92, 246, .1), transparent 40%),
    radial-gradient(circle at 92% 95%, rgba(99, 102, 241, .1), transparent 42%); }
.form-box { width: 480px; max-width: 100%; padding: 32px; }
.form-box h2 { font-size: 26px; }
.grid.two { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 22px; }
.grid.two .full { grid-column: 1 / -1; }
.alt { margin-top: 22px; font-size: 13.5px; text-align: center; }
@media (max-width: 520px) { .grid.two { grid-template-columns: 1fr; } .form-box { padding: 22px; } }
.err-banner { margin-top: 16px; background: #ffe4e6; color: #be123c; padding: 11px 14px; border-radius: 10px; font-size: 13px; border: 1px solid #fecdd3; }
.fe { color: var(--rose); font-size: 11.5px; display: block; margin-top: 5px; }
.hint { color: var(--ink-faint); font-size: 11.5px; display: block; margin-top: 5px; }
input.bad { border-color: var(--rose); }
input.bad:focus { box-shadow: 0 0 0 3px rgba(225, 29, 72, .15); }
</style>
