<script setup lang="ts">
import { Button } from '@win-ui/components/src/button'
</script>

<template>
	<div>theme</div>
	<Button />
	<Button theme="accent" />
	<div>size</div>
	<Button size="small" />
	<Button theme="accent" size="small" />
	<div>disabled</div>
	<Button disabeld />
	<Button theme="accent" disabeld />
	<button style="border: 1px solid ;"></button>
</template>

<style lang="scss"></style>
