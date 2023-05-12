import { join } from 'node:path'
import type { InlineConfig } from 'vite'
import type { BundleOption } from '../compiler/compile-bundles.js'
import { setBuildTarget } from '../common/index.js'
import { CWD, ES_DIR, LIB_DIR, PACKAGE_NAME } from '../common/constant.js'

export function getViteConfigForPackage({ minify, formats, external = [] }: BundleOption): InlineConfig {
	setBuildTarget('package')
	const entry = join(ES_DIR, 'index.mjs')
	const shouldReplaceEnv = minify || formats?.includes('umd')
	return {
		root: CWD,
		logLevel: 'silent',
		define: shouldReplaceEnv ? { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) } : undefined,
		build: {
			emptyOutDir: false,
			lib: {
				name: PACKAGE_NAME,
				entry,
				formats,
				fileName: (format: string) => {
					const suffix = format === 'umd' ? '' : `.${format}`
					return minify ? `${PACKAGE_NAME}${suffix}.min.js` : `${PACKAGE_NAME}${suffix}.js`
				},
			},
			minify: minify ? 'terser' : false,
			rollupOptions: {
				external: [...external, 'vue'],
				output: {
					dir: LIB_DIR,
					exports: 'named',
					globals: {
						vue: 'Vue',
					},
				},
			},
		},
	}
}
