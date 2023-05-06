<script setup lang="ts">
import { computed } from 'vue'
import { buttonProps } from './button'

const props = defineProps(buttonProps)

const buttonClass = computed(() => {
  return `button button--${props.size} button--${props.style}`
})
</script>

<script lang="ts">
export default {
  name: 'WinButton',
}
</script>

<template>
  <button :class="buttonClass">
    按钮
  </button>
</template>

<style scoped lang="scss">
@import './index.scss';
</style>
