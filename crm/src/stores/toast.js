import { reactive } from 'vue'

let seq = 0
export const toasts = reactive({
  items: [],
  push(message, type = 'info') {
    const id = ++seq
    this.items.push({ id, message, type })
    setTimeout(() => this.dismiss(id), 4200)
  },
  ok(m) { this.push(m, 'ok') },
  err(m) { this.push(typeof m === 'string' ? m : (m?.message || 'Ошибка'), 'err') },
  dismiss(id) { this.items = this.items.filter((t) => t.id !== id) },
})
