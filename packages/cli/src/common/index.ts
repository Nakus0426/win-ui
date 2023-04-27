import { join, sep } from 'node:path'
import { existsSync, lstatSync, outputFileSync, readFileSync, readdirSync } from 'fs-extra'
import { CSS_LANG, SRC_DIR, STYLE_DIR } from './constant'

export const EXT_REGEXP = /\.\w+$/
export const SFC_REGEXP = /\.(vue)$/
export const DEMO_REGEXP = new RegExp(`\\${sep}demo$`)
export const TEST_REGEXP = new RegExp(`\\${sep}test$`)
export const ASSET_REGEXP = /\.(png|jpe?g|gif|webp|ico|jfif|svg|woff2?|ttf)$/i
export const STYLE_REGEXP = /\.(css|less|scss)$/
export const SCRIPT_REGEXP = /\.(js|ts|jsx|tsx)$/
export const JSX_REGEXP = /\.(j|t)sx$/

export function setNodeEnv(env: 'production' | 'development' | 'test') {
  process.env.NODE_ENV = env
}

export function setModuleEnv(value: 'esmodule' | 'commonjs') {
  process.env.BABEL_MODULE = value
}

export function hasDefaultExport(code: string) {
  return code.includes('export default') || code.includes('export { default }')
}

export function getComponents() {
  const dirs = readdirSync(SRC_DIR)
  const EXCLUDES = '.DS_Store'
  const ENTRY_EXTS = 'ts'
  return dirs
    .filter(dir => EXCLUDES !== dir)
    .filter((dir) => {
      const path = join(SRC_DIR, dir, `index.${ENTRY_EXTS}`)
      if (existsSync(path))
        return hasDefaultExport(readFileSync(path, 'utf-8'))
      return false
    })
}

export function smartOutputFile(filePath: string, content: string) {
  if (existsSync(filePath)) {
    const previousContent = readFileSync(filePath, 'utf-8')
    if (previousContent === content)
      return
  }
  outputFileSync(filePath, content)
}

export function getCssBaseFile() {
  const path = join(STYLE_DIR, `base.${CSS_LANG}`)
  return existsSync(path) ? path : null
}

export function replaceExt(path: string, ext: string) {
  return path.replace(EXT_REGEXP, ext)
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

export const isDir = (dir: string) => lstatSync(dir).isDirectory()
export const isDemoDir = (dir: string) => DEMO_REGEXP.test(dir)
export const isTestDir = (dir: string) => TEST_REGEXP.test(dir)
export const isAsset = (path: string) => ASSET_REGEXP.test(path)
export const isSfc = (path: string) => SFC_REGEXP.test(path)
export const isStyle = (path: string) => STYLE_REGEXP.test(path)
export const isScript = (path: string) => SCRIPT_REGEXP.test(path)
export const isJsx = (path: string) => JSX_REGEXP.test(path)
