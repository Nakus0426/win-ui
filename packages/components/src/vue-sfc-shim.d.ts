/// <reference types="vue/macros-global" />

declare module '*.vue' {
	import { DefineComponent } from 'vue'
	const Component: DefineComponent
	export default Component
}
