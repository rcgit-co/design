<script setup>
defineProps({ loading: Boolean, error: String, empty: Boolean, emptyText: { type: String, default: 'Пока пусто' } })
</script>

<template>
  <div v-if="loading" class="state">
    <div class="spinner" /> <span class="muted">Загрузка…</span>
  </div>
  <div v-else-if="error" class="state err">
    <strong>Не удалось загрузить</strong>
    <span class="muted">{{ error }}</span>
  </div>
  <div v-else-if="empty" class="state">
    <span class="muted">{{ emptyText }}</span>
  </div>
  <slot v-else />
</template>

<style scoped>
.state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 20px; color: var(--ink-soft); }
.state.err strong { color: var(--rose); }
.spinner {
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--green);
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
