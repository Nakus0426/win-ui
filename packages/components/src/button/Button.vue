<script setup lang="ts">
import { createNamespace } from '../utils'
import { buttonProps } from './button'

defineOptions({ name: 'win-button' })

const props = defineProps(buttonProps)

const { bem, classes } = createNamespace('button')
</script>

<template>
	<button
		:class="
			classes(bem(), bem(`--${props.size}`), bem(`--${props.theme}`), bem(`--${props.layout}`), [
				props.disabeld,
				bem('--disabled'),
			])
		"
	>
		button
	</button>
</template>

<style scoped lang="scss">
@import './index.scss';
</style>
