import { join } from 'node:path'
import { consola } from 'consola'
import { copy, existsSync, readdir, remove } from 'fs-extra'
import { execa } from 'execa'
import type { Format } from 'esbuild'
import { isAsset, isDemoDir, isDir, isScript, isSfc, isStyle, isTestDir, setModuleEnv, setNodeEnv } from '../common'
import { CSS_LANG, ES_DIR, LIB_DIR, SRC_DIR } from '../common/constant.js'
import { genStyleDepsMap } from '../compiler/gen-style-deps-map'
import { genComponentStyle } from '../compiler/gen-component-style'
import { genPackageStyle } from '../compiler/gen-package-style'
import { compileSfc } from '../compiler/compile-sfc'
import { compileStyle } from '../compiler/compile-style'

async function clean() {
  consola.info('Clean')
  await Promise.all([remove(ES_DIR), remove(LIB_DIR)])
}

async function installDependencies() {
  consola.info('Install Dependencies')
  try {
    await execa('pnpm', ['install', '--prod=false'], { stdio: 'inherit' })
  }
  catch (err) {
    consola.log(err)
    throw err
  }
}

async function copySourceCode() {
  return Promise.all([copy(SRC_DIR, ES_DIR), copy(SRC_DIR, LIB_DIR)])
}

async function buildStyleEntry() {
  await genStyleDepsMap()
  genComponentStyle()
}

function buildPackageStyleEntry() {
  const styleEntryFile = join(LIB_DIR, `index.${CSS_LANG}`)
  genPackageStyle(styleEntryFile, (path: string) => path.replace(SRC_DIR, '.'))
}

async function buildTypeDeclarations() {
  await Promise.all([preCompileDir(ES_DIR), preCompileDir(LIB_DIR)])
  const tsConfig = join(process.cwd(), 'tsconfig.declaration.json')
  if (existsSync(tsConfig))
    await execa('tsc', ['-p', tsConfig], { stdout: 'inherit', stderr: 'inherit' })
}

async function buildESMOutputs() {
  setModuleEnv('esmodule')
  await compileDir(ES_DIR, 'esm')
}

async function preCompileDir(dir: string) {
  const files = await readdir(dir)
  await Promise.all(
    files.map((filename) => {
      const filePath = join(dir, filename)
      if (isDemoDir(filePath) || isTestDir(filePath))
        return remove(filePath)
      if (isDir(filePath))
        return preCompileDir(filePath)
      if (isSfc(filePath))
        return compileSfc(filePath)
      return Promise.resolve()
    }),
  )
}

async function compileFile(filePath: string, format: Format) {
  if (isScript(filePath))
    return compileScript(filePath, format)
  if (isStyle(filePath))
    return compileStyle(filePath)
  if (isAsset(filePath))
    return Promise.resolve()
  return remove(filePath)
}

async function compileDir(dir: string, format: Format) {
  const files = await readdir(dir)
  await Promise.all(
    files.map((filename) => {
      const filePath = join(dir, filename)
      return isDir(filePath)
        ? compileDir(filePath, format)
        : compileFile(filePath, format)
    }),
  )
}

const tasks = [
  {
    name: 'Copy Source Code',
    task: copySourceCode,
  },
  {
    name: 'Copy Source Code',
    task: copySourceCode,
  },
  {
    text: 'Build Component Style Entry',
    task: buildStyleEntry,
  },
  {
    text: 'Build Package Style Entry',
    task: buildPackageStyleEntry,
  },
  {
    text: 'Build Type Declarations',
    task: buildTypeDeclarations,
  },
  {
    text: 'Build ESModule Outputs',
    task: buildESMOutputs,
  },
]

async function runBuildTasks() {

}

export async function build() {
  setNodeEnv('production')
  try {
    await clean()
    await installDependencies()
    await runBuildTasks()
  }
  catch (err) {
    consola.error('Build failed')
    process.exit(1)
  }
}
