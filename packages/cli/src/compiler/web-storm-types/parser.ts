const TITLE_REG = /^(#+)\s+([^\n]*)/
const TABLE_REG = /^\|.+\r?\n\|\s*-+/
const TD_REG = /\s*`[^`]+`\s*|([^|`]+)/g
const TABLE_SPLIT_LINE_REG = /^\|\s*-/

interface TableContent {
  head: string[]
  body: string[][]
}

interface Article {
  type: string
  content?: string
  table?: TableContent
  level?: number
}

export type Articles = Article[]

function readLine(input: string) {
  const end = input.indexOf('\n')
  return input.substring(0, end !== -1 ? end : input.length)
}

function splitTableLine(line: string) {
  line = line.replace(/\\\|/g, 'JOIN')
  const items = line
    .split('|')
    .map(item => item.trim().replace(/JOIN/g, '|'))
  items.pop()
  items.shift()
  return items
}

function tableParse(input: string) {
  let start = 0
  let isHead = true
  const end = input.length
  const table: TableContent = { head: [], body: [] }
  while (start < end) {
    const target = input.substring(start)
    const line = readLine(target)
    if (!/^\|/.test(target))
      break
    if (TABLE_SPLIT_LINE_REG.test(target)) {
      isHead = false
    }
    else if (!isHead && line.includes('|')) {
      const matched = line.trim().match(TD_REG)
      if (matched)
        table.body.push(splitTableLine(line))
    }
    start += line.length + 1
  }
  return {
    table,
    usedLength: start,
  }
}

export function mdParser(input: string): Articles {
  const article = []
  let start = 0
  while (start < input.length) {
    const target = input.substring(start)
    let match = TITLE_REG.exec(target)
    if (match) {
      article.push({ type: 'title', content: match[2], level: match[1].length })
      start += match.index + match[0].length
    }
    match = TABLE_REG.exec(target)
    if (match) {
      const { table, usedLength } = tableParse(target.substr(match.index))
      article.push({
        type: 'table',
        table,
      })
      start += match.index + usedLength
    }
    else {
      start += readLine(target).length + 1
    }
  }
  return article
}
