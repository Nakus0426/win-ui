import type { LibraryFormats } from 'vite'
import { build } from 'vite'
import { getPackageJson } from '../common/constant.js'
import { getViteConfigForPackage } from '../config/vite-package.js'

export interface BundleOption {
  minify?: boolean
  formats: LibraryFormats[]
  external?: string[]
}

export async function compileBundles() {
  const dependencies = getPackageJson().dependencies || {}
  const external = Object.keys(dependencies)
  const bundleOptions: BundleOption[] = [
    {
      minify: false,
      formats: ['umd'],
    },
    {
      minify: true,
      formats: ['umd'],
    },
    {
      minify: false,
      formats: ['es', 'cjs'],
      external,
    },
  ]
  await Promise.all(
    bundleOptions.map(async config => build(getViteConfigForPackage(config))))
}
