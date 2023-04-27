import { parse as pathParse } from 'node:path'
import { outputFile, readFileSync, remove } from 'fs-extra'
import type { SFCBlock } from 'vue/compiler-sfc'
import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc'
import hash from 'hash-sum'
import { trim } from 'lodash-es'
import { replaceExt } from '../common'

const RENDER_FN = '__vue_render__'
const VUEIDS = '__vue_sfc__'
const EXPORT = 'export default'

function parseSfc(filename: string) {
  const source = readFileSync(filename, 'utf-8')
  const { descriptor } = parse(source, { filename })
  return descriptor
}

function getSfcStylePath(filePath: string, ext: string, index: number) {
  const number = index !== 0 ? `-${index + 1}` : ''
  return replaceExt(filePath, `-sfc${number}.${ext}`)
}

function injectStyle(script: string, styles: SFCBlock[], filePath: string) {
  if (styles.length) {
    const imports = styles
      .map((style, index) => {
        const { base } = pathParse(getSfcStylePath(filePath, 'css', index))
        return `import './${base}';`
      })
      .join('\n')
    return `${imports}\n${script}`
  }
  return script
}

function injectRender(script: string, render: string) {
  script = trim(script)
  render = render.replace('export function render', `function ${RENDER_FN}`)
  script += `\n${render}\n${VUEIDS}.render = ${RENDER_FN} \n`
  return script
}

function injectScopeId(script: string, scopeId: string) {
  script += `\n${VUEIDS}._scopeId = '${scopeId}'`
  return script
}

export async function compileSfc(filePath: string): Promise<any> {
  const tasks = [remove(filePath)]
  const source = readFileSync(filePath, 'utf-8')
  const descriptor = parseSfc(filePath)
  const { template, styles } = descriptor
  const hasScoped = styles.some(s => s.scoped)
  const scopeId = hasScoped ? `data-v-${hash(source)}` : ''

  if (descriptor.script || descriptor.scriptSetup) {
    const lang = descriptor.script?.lang || descriptor.scriptSetup?.lang || 'js'
    const scriptFilePath = replaceExt(filePath, `.${lang}`)

    tasks.push(
      new Promise((resolve) => {
        let script = ''
        let bindingMetadata
        if (descriptor.scriptSetup) {
          const { bindings, content } = compileScript(descriptor, { id: scopeId })
          script += content
          bindingMetadata = bindings
        }
        else {
          script += descriptor.script!.content
        }
        script = injectStyle(script, styles, filePath)
        script = script.replace(EXPORT, `const ${VUEIDS} =`)

        if (template) {
          const render = compileTemplate({
            id: scopeId,
            source: template.content,
            filename: filePath,
            compilerOptions: {
              bindingMetadata,
            },
          }).code
          script = injectRender(script, render)
        }
        if (scopeId)
          script = injectScopeId(script, scopeId)
        script += `\n${EXPORT} ${VUEIDS}`
        if (lang === 'ts')
          script = `// @ts-nocheck\n${script}`
        outputFile(scriptFilePath, script).then(resolve).catch(() => { })
      }),
    )
  }

  tasks.push(
    ...styles.map(async (style, index: number) => {
      const cssFilePath = getSfcStylePath(filePath, style.lang || 'css', index)
      const styleSource = trim(style.content)
      return outputFile(cssFilePath, styleSource)
    }),
  )

  return Promise.all(tasks)
}
