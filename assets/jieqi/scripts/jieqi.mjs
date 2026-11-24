#!/usr/bin/env node
// 24 节气速查：算法在 scripts/astro.mjs（与 dshjieqi-card 插件共用同一份，勿在此重复实现）。
// 用法: node jieqi.mjs [YYYY-MM-DD] [--year] [--json]
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { solarTerm, termsOfYear, dayKey, stamp } from './astro.mjs'

/**
 * 从 references/节气养生速查.md 读 24 条养生句。这份表是唯一来源：卡片（宿主）
 * 与这个命令行脚本都从它读，改养生文案只改那一个文件。
 */
const HERE = dirname(fileURLToPath(import.meta.url))
function healthTips() {
  const tips = {}
  try {
    const raw = readFileSync(join(HERE, '..', 'references', '节气养生速查.md'), 'utf8')
    for (const line of raw.split('\n')) {
      const cells = line.split('|').map((cell) => cell.trim())
      if (cells.length < 5 || !cells[1] || cells[1] === '节气' || /^-+$/.test(cells[1]) || !cells[3]) continue
      tips[cells[1]] = cells[3]
    }
  } catch (error) { /* 养生行留空 */ }
  return tips
}

const HEALTH = healthTips()

const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const yearMode = args.includes('--year')
const dateArg = args.find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg))

const info = solarTerm(dateArg || undefined)
const y = Number(info.date.slice(0, 4))
const terms = termsOfYear(y).sort((left, right) => left.at - right.at)
const lichun = terms.find((term) => term.name === '立春')

const result = {
  date: info.date,
  term: info.term,
  termAt: info.termAt,
  isTermDay: info.isTermDay,
  dayInTerm: info.dayInTerm,
  next: info.next,
  ganzhi: {
    year: info.ganzhi.year,
    yearStart: lichun ? dayKey(lichun.at) : '',
    monthBranch: info.ganzhi.monthBranch,
    monthStart: info.ganzhi.monthStart,
  },
  lunar: info.lunar,
  zodiac: info.zodiac,
  moon: info.moon,
  health: HEALTH[info.term] || '',
}

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}

console.log(`${result.date}　${result.ganzhi.year}年 ${result.ganzhi.monthBranch}月（月建自 ${result.ganzhi.monthStart}）`)
console.log(result.isTermDay
  ? `今日交节：${result.term}（${result.termAt}）`
  : `当前节气：${result.term}（${result.termAt} 交节，第 ${result.dayInTerm} 天）`)
if (result.next) console.log(`下一个节气：${result.next.name}（${result.next.at}，还有 ${result.next.days} 天）`)
if (result.lunar) {
  console.log(`农历：${result.lunar.monthName}${result.lunar.dayName}（属${result.lunar.zodiac}）${result.moon ? ` · ${result.moon.name} ${result.moon.emoji}` : ''}`)
}
if (result.health) console.log(`养生：${result.health}`)
if (yearMode) {
  console.log('')
  for (const term of terms) console.log(`  ${term.name}\t${stamp(term.at)}`)
}
