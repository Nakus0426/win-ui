import { createRequire } from 'node:module'
import postcss from 'postcss'
import { writeFileSync } from 'fs-extra'
import { transform } from 'esbuild'
import postcssrc from 'postcss-load-config'
import { replaceExt } from '../common'
import { POSTCSS_CONFIG_FILE } from '../common/constant'

const _require = createRequire(import.meta.url)

export async function compileCss(source: string | Buffer) {
  const config = await postcssrc({}, POSTCSS_CONFIG_FILE)
  const { css } = await postcss(config.plugins).process(source, { from: undefined })
  const result = await transform(css, {
    loader: 'css',
    minify: true,
    target: ['chrome53', 'safari10'],
  })
  return result.code
}

function tildeImporter(url: string) {
  if (url.includes('~')) {
    url = url.replace('~', '')
    if (!url.includes('.scss'))
      url += '.scss'
    url = require.resolve(url)
  }
  return { file: url }
}

function compileSass(filePath: string) {
  const { renderSync } = _require('sass')
  const { css } = renderSync({ file: filePath, importer: tildeImporter })
  return css
}

export async function compileStyle(filePath: string) {
  const source = await compileSass(filePath)
  const css = await compileCss(source)
  writeFileSync(replaceExt(filePath, '.css'), css)
}
