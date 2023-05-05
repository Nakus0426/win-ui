<script lang="ts">
export default {
  name: 'WButton',
}
</script>

<script setup lang="ts">
const props = defineProps({
  size: String,
})
</script>

<template>
  <button>按钮</button>
</template>

<style lang="scss">
@import './index.scss';
</style>
