import type { PathLike } from 'node:fs'

interface VueSlot {
  name: string
  description: string
}

export interface VueEventArgument {
  name: string
  type: string
}

interface VueEvent {
  name: string
  description?: string
  arguments?: VueEventArgument[]
}

interface VueAttribute {
  name: string
  default: string
  description: string
  value: {
    kind: 'expression'
    type: string
  }
}

export interface VueTag {
  name: string
  slots?: VueSlot[]
  events?: VueEvent[]
  attributes?: VueAttribute[]
  description?: string
}

export interface Options {
  name: string
  path: PathLike
  test: RegExp
  version: string
  outputDir?: string
  tagPrefix?: string
}
