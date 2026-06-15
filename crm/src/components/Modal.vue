<script setup>
defineProps({ title: String, wide: Boolean })
const emit = defineEmits(['close'])
</script>

<template>
  <transition name="fade">
    <div class="overlay" @click.self="emit('close')">
      <div class="modal card" :class="{ wide }">
        <div class="head spread">
          <h3>{{ title }}</h3>
          <button class="ghost sm" @click="emit('close')">✕</button>
        </div>
        <div class="body"><slot /></div>
        <div class="foot" v-if="$slots.footer"><slot name="footer" /></div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(8, 11, 22, .5);
  backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 150; padding: 24px;
}
.modal { width: 480px; max-width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-lg); }
.modal.wide { width: 680px; }
.head { padding: 18px 22px; border-bottom: 1px solid var(--line); }
.body { padding: 22px; overflow-y: auto; }
.foot { padding: 16px 22px; border-top: 1px solid var(--line); display: flex; justify-content: flex-end; gap: 10px; background: var(--paper); }
</style>
