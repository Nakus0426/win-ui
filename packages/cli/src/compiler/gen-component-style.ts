import { createRequire } from 'node:module'
import { join, relative, sep } from 'node:path'
import fe from 'fs-extra'
import { CSS_LANG, ES_DIR, LIB_DIR, SRC_DIR, STYLE_DEPS_JSON_FILE } from '../common/constant.js'
import { getComponents, getCssBaseFile, replaceExt } from '../common/index.js'
import { checkStyleExists } from './gen-style-deps-map.js'

const OUTPUT_CONFIG = [
  {
    dir: ES_DIR,
    template: (dep: string) => `import '${dep}';`,
  },
  {
    dir: LIB_DIR,
    template: (dep: string) => `require('${dep}');`,
  },
]

function getDeps(component: string): string[] {
  const require = createRequire(import.meta.url)
  const styleDepsJson = require(STYLE_DEPS_JSON_FILE)

  if (styleDepsJson.map[component]) {
    const deps = styleDepsJson.map[component].slice(0)

    if (checkStyleExists(component))
      deps.push(component)

    return deps
  }

  return []
}

function getRelativePath(component: string, style: string, ext: string) {
  return relative(join(ES_DIR, `${component}/style`), join(ES_DIR, `${component}/index${ext}`))
}

function genEntry(params: {
  ext: string
  filename: string
  component: string
  baseFile: string | null
}) {
  const { ext, filename, component, baseFile } = params
  const deps = getDeps(component)
  const depsPath = deps.map(dep => getRelativePath(component, dep, ext))
  OUTPUT_CONFIG.forEach(({ dir, template }) => {
    const outputDir = join(dir, component, 'style')
    const outputFile = join(outputDir, filename)
    let content = ''
    if (baseFile) {
      const compiledBaseFile = replaceExt(baseFile.replace(SRC_DIR, dir), ext)
      content += template(relative(outputDir, compiledBaseFile))
      content += '\n'
    }
    content += depsPath.map(template).join('\n')
    content = content.replace(new RegExp(`\\${sep}`, 'g'), '/')
    fe.outputFileSync(outputFile, content)
  })
}

export function genComponentStyle(cache = true) {
  if (!cache) {
    const require = createRequire(import.meta.url)
    delete require.cache[STYLE_DEPS_JSON_FILE]
  }
  const components = getComponents()
  const baseFile = getCssBaseFile()
  components.forEach((component) => {
    genEntry({
      baseFile,
      component,
      filename: 'index.js',
      ext: '.css',
    })
    genEntry({
      baseFile,
      component,
      filename: `${CSS_LANG}.js`,
      ext: `.${CSS_LANG}`,
    })
  })
}
