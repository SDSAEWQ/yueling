#!/usr/bin/env node
// 24 节气速查：算法在 scripts/astro.mjs（与 dshjieqi-card 插件共用同一份，勿在此重复实现）。
// 用法: node jieqi.mjs [YYYY-MM-DD] [--year] [--json]
import { solarTerm, termsOfYear, dayKey, stamp } from './astro.mjs'

/** 一句当令养生，随节气切换。 */
const HEALTH = {
  立春: '肝气始生，宜舒展、少怒，早睡早起，饮食减酸增甘。',
  雨水: '湿气渐起，宜健脾祛湿，少食生冷，注意“春捂”。',
  惊蛰: '阳气动，宜动不宜静，防春困与过敏，饮食清淡。',
  春分: '阴阳平分，作息求“中”，忌大补大泻，情志宜平。',
  清明: '肝木当令，宜踏青疏肝，忌久坐郁结。',
  谷雨: '湿温并重，宜祛湿健脾，护关节，莫贪凉。',
  立夏: '心火渐旺，宜静心，午间小憩，少食辛辣。',
  小满: '湿热初盛，宜清淡，防皮肤病与口疮。',
  芒种: '暑湿交蒸，宜午休、勤换衣，忌大汗当风。',
  夏至: '一阴生，宜养心敛阳，晚睡早起，忌冷饮伤脾。',
  小暑: '暑热伤气，宜补气生津（如西洋参、绿豆），忌暴晒。',
  大暑: '湿热最盛，宜避暑养心，饮食清补，忌贪凉。',
  立秋: '燥气始，宜润肺，少辛增酸，注意“秋老虎”。',
  处暑: '暑气渐退，宜早卧早起，防秋燥与感冒。',
  白露: '昼夜温差大，宜护颈背，忌赤膊贪凉。',
  秋分: '阴阳再平，宜收敛神气，饮食平和。',
  寒露: '凉燥伤肺，宜润燥，脚部保暖，少食生冷。',
  霜降: '燥寒并至，宜平补（山药、栗子），护胃护膝，忌过食辛辣。',
  立冬: '阳气内藏，宜早卧晚起，温补有度，忌大汗。',
  小雪: '寒始盛，宜温阳，多晒太阳，调畅情志。',
  大雪: '宜进补、藏精，护头颈腰足，忌熬夜。',
  冬至: '一阳生，宜静养、艾灸关元，早睡，忌房劳。',
  小寒: '寒气最重，宜温补脾肾，防心脑血管。',
  大寒: '岁末藏养，宜温而不燥，为立春生发蓄力。',
}

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
if (result.health) console.log(`养生：${result.health}`)
if (yearMode) {
  console.log('')
  for (const term of terms) console.log(`  ${term.name}\t${stamp(term.at)}`)
}