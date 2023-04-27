import { join } from 'node:path'
import { existsSync, readFileSync } from 'fs-extra'

const SCRIPT_EXTS = [
  '.js',
  '.jsx',
  '.vue',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
]
const IMPORT_RE = /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from(\s+)?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/g

let depsMap: Record<string, string[]> = {}
let existsCache: Record<string, boolean> = {}

function matchImports(code: string): string[] {
  const imports = code.match(IMPORT_RE) || []
  return imports.filter(line => !line.includes('import type'))
}

export function clearDepsCache() {
  depsMap = {}
  existsCache = {}
}

export function fillExt(filePath: string) {
  for (let i = 0; i < SCRIPT_EXTS.length; i++) {
    const completePath = `${filePath}${SCRIPT_EXTS[i]}`
    if (existsSync(completePath))
      return { path: completePath, isIndex: false }
  }

  for (let i = 0; i < SCRIPT_EXTS.length; i++) {
    const completePath = `${filePath}/index${SCRIPT_EXTS[i]}`
    if (existsSync(completePath))
      return { path: completePath, isIndex: true }
  }

  return { path: '', isIndex: false }
}

function getImportRelativePath(code: string) {
  const divider = code.includes('"') ? '"' : '\''
  return code.split(divider)[1]
}

function getPathByImport(code: string, filePath: string) {
  const relativePath = getImportRelativePath(code)
  if (relativePath.includes('.'))
    return fillExt(join(filePath, '..', relativePath))
  return null
}

export function getDeps(filePath: string) {
  if (depsMap[filePath])
    return depsMap[filePath]
  const code = readFileSync(filePath, 'utf-8')
  const imports = matchImports(code)
  const paths = imports
    .map(item => getPathByImport(item, filePath)?.path)
    .filter(item => !!item) as string[]
  depsMap[filePath] = paths
  paths.forEach(getDeps)
  return paths
}
