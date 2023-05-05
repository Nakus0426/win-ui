import { sep } from 'node:path'
import { type Format, transform } from 'esbuild'
import fe from 'fs-extra'
import { transformAsync } from '@babel/core'
import { isJsx, replaceCSSImportExt, replaceExt } from '../common/index.js'
import { replaceScriptImportExt } from './get-deps.js'

export async function compileScript(filePath: string, format: Format) {
  if (filePath.includes('.d.ts'))
    return
  const extensions: Record<string, string> = { esm: '.mjs' }
  const extension = extensions?.[format] || '.js'
  let code = fe.readFileSync(filePath, 'utf-8')
  if (!filePath.includes(`${sep}style${sep}`))
    code = replaceCSSImportExt(code)
  code = replaceScriptImportExt(code, filePath, extension)
  if (isJsx(filePath)) {
    const babelResult = await transformAsync(code, {
      filename: filePath,
      babelrc: false,
      presets: ['@babel/preset-typescript'],
      plugins: [['@vue/babel-plugin-jsx', { enableObjectSlots: false }]],
    })
    if (babelResult?.code)
      ({ code } = babelResult)
  }
  const esbuildResult = await transform(code, {
    loader: 'ts',
    target: 'es2016',
    format,
  });
  ({ code } = esbuildResult)
  const jsFilePath = replaceExt(filePath, extension)
  fe.removeSync(filePath)
  fe.outputFileSync(jsFilePath, code)
}
