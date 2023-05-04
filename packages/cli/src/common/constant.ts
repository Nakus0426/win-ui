import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import fe from 'fs-extra'

export const PACKAGE_NAME = 'win-ui'

export const CWD = process.cwd()
export const ROOT = findRootDir(CWD)
export const SRC_DIR = join(ROOT, 'src')
export const STYLE_DIR = join(SRC_DIR, 'style')
export const ES_DIR = join(ROOT, 'es')
export const LIB_DIR = join(ROOT, 'lib')
export const PACKAGE_JSON_FILE = join(ROOT, 'package.json')

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DIST_DIR = join(__dirname, '..', '..', 'dist')
export const CJS_DIR = join(__dirname, '..', '..', 'cjs')

export const CSS_LANG = 'scss'
export const STYLE_EXT = '.scss'

export const STYLE_DEPS_JSON_FILE = join(DIST_DIR, 'style-deps.json')

export const POSTCSS_CONFIG_FILE = join(CJS_DIR, 'postcss.config.cjs')

function findRootDir(dir: string): string {
  if (existsSync(join(dir, 'win.config.mjs')))
    return dir
  const parentDir = dirname(dir)
  if (dir === parentDir)
    return dir
  return findRootDir(parentDir)
}

export function getPackageJson() {
  const rawJson = fe.readFileSync(PACKAGE_JSON_FILE, 'utf-8')
  return JSON.parse(rawJson)
}
