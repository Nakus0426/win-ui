import { join, relative, sep } from 'node:path'
import { existsSync } from 'fs-extra'
import { getComponents, smartOutputFile } from '../common'
import { CSS_LANG, SRC_DIR, STYLE_DEPS_JSON_FILE } from '../common/constant'
import { clearDepsCache, fillExt, getDeps } from './get-deps'

type DepsMap = Record<string, string[]>

function analyzeComponentDeps(components: string[], component: string) {
  const checkList: string[] = []
  const componentEntry = fillExt(join(SRC_DIR, component, 'index')).path
  const record = new Set()

  function search(filePath: string) {
    record.add(filePath)
    getDeps(filePath).forEach((key) => {
      if (record.has(key))
        return
      search(key)
      components
        .filter((item) => {
          const p = relative(SRC_DIR, key)
          const arr = p.split(sep)
          return arr.includes(item)
        })
        .forEach((item) => {
          if (!checkList.includes(item) && item !== component)
            checkList.push(item)
        })
    })
  }

  search(componentEntry)
  return checkList.filter(item => existsSync(join(SRC_DIR, `${item}/index.${CSS_LANG}`)))
}

function getSequence(components: string[], depsMap: DepsMap) {
  const sequence: string[] = []
  const record = new Set()

  function add(item: string) {
    const deps = depsMap[item]
    if (sequence.includes(item) || !deps)
      return
    if (record.has(item)) {
      sequence.push(item)
      return
    }
    record.add(item)
    if (!deps.length) {
      sequence.push(item)
      return
    }
    deps.forEach(add)
    if (sequence.includes(item))
      return
    const maxIndex = Math.max(...deps.map(dep => sequence.indexOf(dep)))
    sequence.splice(maxIndex + 1, 0, item)
  }

  components.forEach(add)
  return sequence
}

export async function genStyleDepsMap() {
  const components = getComponents()
  return new Promise<void>((resolve) => {
    clearDepsCache()
    const map: DepsMap = {}
    components.forEach((component) => {
      map[component] = analyzeComponentDeps(components, component)
    })
    const sequence = getSequence(components, map)
    Object.keys(map).forEach((key) => {
      map[key] = map[key].sort((a, b) => sequence.indexOf(a) - sequence.indexOf(b))
    })
    smartOutputFile(
      STYLE_DEPS_JSON_FILE,
      JSON.stringify({ map, sequence }, null, 2),
    )
    resolve()
  })
}
