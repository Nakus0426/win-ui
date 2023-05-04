import { join, sep } from 'node:path'
import fe from 'fs-extra'
import { CSS_LANG, SRC_DIR, STYLE_DIR } from './constant.js'

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
  const dirs = fe.readdirSync(SRC_DIR)
  const EXCLUDES = '.DS_Store'
  const ENTRY_EXTS = 'ts'
  return dirs
    .filter(dir => EXCLUDES !== dir)
    .filter((dir) => {
      const path = join(SRC_DIR, dir, `index.${ENTRY_EXTS}`)
      if (fe.existsSync(path))
        return hasDefaultExport(fe.readFileSync(path, 'utf-8'))
      return false
    })
}

export function smartOutputFile(filePath: string, content: string) {
  if (fe.existsSync(filePath)) {
    const previousContent = fe.readFileSync(filePath, 'utf-8')
    if (previousContent === content)
      return
  }
  fe.outputFileSync(filePath, content)
}

export function getCssBaseFile() {
  const path = join(STYLE_DIR, `base.${CSS_LANG}`)
  return fe.existsSync(path) ? path : null
}

export function replaceExt(path: string, ext: string) {
  return path.replace(EXT_REGEXP, ext)
}

export function replaceCSSImportExt(code: string) {
  return code.replace(/import\s+?(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/g, str => str.replace(`.${CSS_LANG}`, '.css'))
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

export function setBuildTarget(value: 'site' | 'package') {
  process.env.BUILD_TARGET = value
}

export const isDir = (dir: string) => fe.lstatSync(dir).isDirectory()
export const isDemoDir = (dir: string) => DEMO_REGEXP.test(dir)
export const isTestDir = (dir: string) => TEST_REGEXP.test(dir)
export const isAsset = (path: string) => ASSET_REGEXP.test(path)
export const isSfc = (path: string) => SFC_REGEXP.test(path)
export const isStyle = (path: string) => STYLE_REGEXP.test(path)
export const isScript = (path: string) => SCRIPT_REGEXP.test(path)
export const isJsx = (path: string) => JSX_REGEXP.test(path)
