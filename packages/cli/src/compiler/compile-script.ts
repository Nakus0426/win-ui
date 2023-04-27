import { sep } from 'node:path'
import { type Format, transform } from 'esbuild'
import { outputFileSync, readFileSync, removeSync } from 'fs-extra'
import { transformAsync } from '@babel/core'
import { isJsx, replaceCSSImportExt, replaceExt } from '../common'
import { replaceScriptImportExt } from './get-deps'

export async function compileScript(filePath: string, format: Format) {
  if (filePath.includes('.d.ts'))
    return
  const extension = '.js'
  let code = readFileSync(filePath, 'utf-8')
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
  removeSync(filePath)
  outputFileSync(jsFilePath, code)
}
