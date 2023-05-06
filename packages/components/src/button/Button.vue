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
  <div style="background: url(https://img2.baidu.com/it/u=2319385315,296614944&fm=253&fmt=auto&app=138&f=PNG?w=889&h=500);width: 500px;height: 500px;">
    <div class="button">
      按钮
    </div>
  </div>
</template>

<style scoped lang="scss">
@import './index.scss';
</style>
