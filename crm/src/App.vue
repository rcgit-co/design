<script setup>
import Toasts from './components/Toasts.vue'
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <Toasts />
</template>
