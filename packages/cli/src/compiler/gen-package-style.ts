import { createRequire } from 'node:module'
import { join } from 'node:path'
import fe from 'fs-extra'
import { CSS_LANG, SRC_DIR, STYLE_DEPS_JSON_FILE } from '../common/constant.js'
import { getCssBaseFile, normalizePath, smartOutputFile } from '../common/index.js'

export function genPackageStyle(outputPath?: string, pathResolver?: (path: string) => string) {
	const require = createRequire(import.meta.url)
	const styleDepsJson = require(STYLE_DEPS_JSON_FILE) as unknown as { sequence: string[] }
	const ext = `.${CSS_LANG}`
	let content = ''
	let baseFile = getCssBaseFile()
	if (baseFile) {
		if (pathResolver) baseFile = pathResolver(baseFile)
		content += `@import "${normalizePath(baseFile)}";\n`
	}
	content += styleDepsJson.sequence
		.map((name: string) => {
			let path = join(SRC_DIR, `${name}/index${ext}`)
			if (!fe.existsSync(path)) return ''
			if (pathResolver) path = pathResolver(path)
			return `@import "${normalizePath(path)}";`
		})
		.filter((item: string) => !!item)
		.join('\n')
	if (outputPath) smartOutputFile(outputPath, content)
	else return content
}
