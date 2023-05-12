import { join } from 'node:path'
import fe from 'fs-extra'
import { SCRIPT_EXTS, STYLE_EXTS } from '../common/constant.js'

let depsMap: Record<string, string[]> = {}
let existsCache: Record<string, boolean> = {}

function matchImports(code: string): string[] {
	const imports =
		code.match(/import\s+?(?:(?:(?:[\w*\s{},]*)\s+from(\s+)?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/g) || []
	return imports.filter((line) => !line.includes('import type'))
}

function matchExportFroms(code: string): string[] {
	const exportFroms =
		code.match(/@?export\s+?(?:(?:(?:[\w*\s{},]*)\s+from(\s+)?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/g) || []
	return exportFroms.filter((line) => !line.includes('export type'))
}

export function clearDepsCache() {
	depsMap = {}
	existsCache = {}
}

export function fillExt(filePath: string) {
	for (let i = 0; i < SCRIPT_EXTS.length; i++) {
		const completePath = `${filePath}${SCRIPT_EXTS[i]}`
		if (fe.existsSync(completePath)) return { path: completePath, isIndex: false }
	}

	for (let i = 0; i < SCRIPT_EXTS.length; i++) {
		const completePath = `${filePath}/index${SCRIPT_EXTS[i]}`
		if (fe.existsSync(completePath)) return { path: completePath, isIndex: true }
	}

	return { path: '', isIndex: false }
}

function getImportRelativePath(code: string) {
	const divider = code.includes('"') ? '"' : "'"
	return code.split(divider)[1]
}

function getPathByImport(code: string, filePath: string) {
	const relativePath = getImportRelativePath(code)
	if (relativePath.includes('.')) return fillExt(join(filePath, '..', relativePath))
	return null
}

export function getDeps(filePath: string) {
	if (depsMap[filePath]) return depsMap[filePath]
	const code = fe.readFileSync(filePath, 'utf-8')
	const imports = matchImports(code)
	const paths = imports.map((item) => getPathByImport(item, filePath)?.path).filter((item) => !!item) as string[]
	depsMap[filePath] = paths
	paths.forEach(getDeps)
	return paths
}

export function replaceScriptImportExt(code: string, filePath: string, ext: string) {
	const imports = [...matchImports(code), ...matchExportFroms(code)]

	const updateImport = (index: number, newImport: string) => {
		code = code.replace(imports[index], newImport)
		imports[index] = newImport
	}

	imports.forEach((line, index) => {
		if (line.includes('.vue')) updateImport(index, line.replace('.vue', ext))
	})

	if (ext === '.mjs' || ext === '.cjs') {
		imports.forEach((line, index) => {
			if (STYLE_EXTS.some((ext) => line.includes(ext))) return
			if (line.includes(ext)) return
			const pathInfo = getPathByImport(line, filePath)
			if (pathInfo) {
				const relativePath = getImportRelativePath(line)
				if (pathInfo.isIndex) {
					const newLine = line.replace(relativePath, `${relativePath}/index${ext}`)
					updateImport(index, newLine)
				} else {
					const newLine = line.replace(relativePath, relativePath + ext)
					updateImport(index, newLine)
				}
			}
		})
	}
	return code
}
