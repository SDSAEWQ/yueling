/**
 * One-shot smoke test: no dependencies, no network.
 *
 *   node test/smoke.mjs
 *
 * Checks the things that keep breaking when the card is edited:
 *   1. lib/client.js still parses, and the module loader still gets a plugin.
 *   2. The two copies of astro.mjs (plugin + skill script) are identical.
 *   3. The day/hour pillars still land on anchors verified against
 *      lunar-javascript, and the host routes still answer 200.
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const fail = []
const ok = (label) => console.log('  ok   ' + label)
const check = (condition, label, detail) => {
  if (condition) return ok(label)
  fail.push(label + (detail ? ' — ' + detail : ''))
  console.log('  FAIL ' + label + (detail ? ' — ' + detail : ''))
}

// ---------------------------------------------------------------- 1. client
{
  const source = readFileSync(ROOT + 'lib/client.js', 'utf8')
  try {
    new vm.Script(source, { filename: 'client.js' })
    ok('lib/client.js parses')
  } catch (error) {
    check(false, 'lib/client.js parses', error.message)
  }

  const noop = () => {}
  const listeners = []
  const React = new Proxy({ createElement: (type, props, ...children) => ({ type, props, children }) }, {
    get: (target, key) => (key in target ? target[key] : noop),
  })
  const storage = new Map()
  const win = {
    addEventListener: (name, fn) => listeners.push([name, fn]),
    removeEventListener: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    __ModuleLoader__: { load: (spec) => { win.__spec = spec } },
  }
  const sandbox = {
    window: win,
    document: {
      addEventListener: noop, removeEventListener: noop, querySelector: () => null,
      createElement: () => ({ style: {}, addEventListener: noop }),
      head: { appendChild: noop }, documentElement: { style: {} },
    },
    navigator: win.navigator,
    localStorage: win.localStorage,
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout,
    clearTimeout,
    console,
  }
  sandbox.globalThis = sandbox
  vm.runInNewContext(source, sandbox, { filename: 'client.js' })
  const spec = win.__spec
  check(spec && spec.id === 'dshjieqi-card', 'module id is dshjieqi-card')
  let mod = null
  try { mod = spec.factory((name) => (name === 'react' ? React : null)) } catch (error) { check(false, 'factory runs', error.message) }
  check(mod && mod.name === 'dshjieqi-card', 'plugin name is dshjieqi-card')
  check(mod && Array.isArray(mod.inject) && mod.inject.includes('slots'), 'plugin injects slots')
  check(mod && typeof mod.apply === 'function', 'plugin exports apply()')
  check(source.includes('用九：见群龙无首'), 'client.js carries 用九')
  check(source.includes('用六：利永贞'), 'client.js carries 用六')
  check(source.includes('const HEX_TUAN'), 'client.js carries 彖传')
  check(source.includes('const HEX_XIAOXIANG'), 'client.js carries 小象传')
  check(source.includes("'看原文'") && source.includes("'收起原文'"), 'client.js folds the classical text behind 看原文')
  check(!source.includes('styles.castCi') && !source.includes('styles.castTuan'), 'client.js no longer prints 原文 by default')
  check(source.includes('styles.castYaoGloss'), 'client.js paints the plain layer first')
  check(source.includes('已取消所问'), 'client.js confirms a cleared theme')
  check(source.includes("name + ' ✕'"), 'client.js marks the single picked theme')
  check(source.includes('inset 0 0 0 1px var(--jieqi-accent'), 'client.js rings the picked theme without a border')
  check(/const THEMES = \['事业', '感情', '出行', '健康'\]/.test(source), 'client.js keeps 所问 to four themes')
  check(source.includes('styles.festivalRow') && source.includes('info.festival.days === 0'), 'client.js counts down to the next lunar festival')
  check(source.includes("'之卦 ' + HEX_NAMES[castHex.zhi.no]"), 'client.js names the changed hexagram in the plain layer')
  check(source.includes('之卦卦辞：'), 'client.js carries the changed hexagram text in 复制卦意')
  check(source.includes('—— 月令 · 二十四节气'), 'client.js copies a forward-ready note')
}

// ----------------------------------------------------------------- 2. astro
{
  const a = readFileSync(ROOT + 'lib/astro.mjs')
  const b = readFileSync(ROOT + 'assets/jieqi/scripts/astro.mjs')
  const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 12)
  check(hash(a) === hash(b), 'astro.mjs copies are identical', hash(a) + ' vs ' + hash(b))
}

// ----------------------------------------------------------------- 3. hosts
const { solarTerm, yearView, dayGanzhi, hourGanzhi, lunarDate, moonPhase, dayNumber } = await import('../lib/astro.mjs')
{
  // Anchors cross-checked against lunar-javascript (jsDelivr build).
  const anchors = [
    ['2026-10-31', '戊寅'],
    ['1949-10-01', '甲子'],
    ['2000-01-01', '戊午'],
    ['2024-02-10', '甲辰'],
  ]
  for (const [date, want] of anchors) {
    const got = solarTerm(date).ganzhi.day.name
    check(got === want, 'day pillar ' + date + ' = ' + want, got)
  }
  // 2026-10-31 15:19 Beijing is 申时; 五鼠遁 gives 庚申.
  const hour = hourGanzhi(new Date('2026-10-31T07:19:00Z'))
  check(hour.name === '申时', 'hour pillar branch is 申时', hour.name)
  check(hour.full === '庚申时', 'hour pillar stem is 庚申时', hour.full)
  check(hour.range === '15-17', 'hour pillar range is 15-17', hour.range)

  const today = solarTerm('2026-10-31')
  check(today.term === '霜降', '2026-10-31 is 霜降', today.term)
  check(today.ganzhi.hour === null, 'a dated query carries no hour', String(today.ganzhi.hour))
  check(Array.isArray(today.hexagram.lines) && today.hexagram.lines.length === 6, 'hexagram has six lines')
  const year = yearView(2026)
  check(year.terms.length === 24, 'year view has 24 terms', String(year.terms.length))
  check(typeof dayGanzhi(739000).name === 'string', 'dayGanzhi returns a name')

  // 农历 / 月相 anchors, cross-checked against the published calendar.
  const d = (s) => dayNumber(new Date(s + 'T03:00:00Z'))
  const L1 = lunarDate(d('2024-02-10'))
  check(L1 && L1.month === 1 && L1.day === 1 && !L1.isLeap && L1.zodiac === '龙', '2024-02-10 is 正月初一 龙年', JSON.stringify(L1))
  const L2 = lunarDate(d('2023-03-22'))
  check(L2 && L2.isLeap && L2.month === 2 && L2.day === 1, '2023-03-22 is 闰二月初一', JSON.stringify(L2))
  const L3 = lunarDate(d('2025-07-25'))
  check(L3 && L3.isLeap && L3.month === 6 && L3.day === 1, '2025-07-25 is 闰六月初一', JSON.stringify(L3))
  const L4 = lunarDate(d('2024-01-01'))
  check(L4 && L4.year === 2023 && L4.month === 11, '2024-01-01 is 2023年冬月', JSON.stringify(L4))
  const M1 = moonPhase(d('2024-02-24'))
  check(M1 && M1.phase === '望', '2024-02-24 is 满月', JSON.stringify(M1))
  const M2 = moonPhase(d('2024-02-10'))
  check(M2 && M2.phase === '朔', '2024-02-10 is 新月', JSON.stringify(M2))
  const z = solarTerm('2024-02-10')
  check(z.lunar && z.lunar.monthName === '正月' && z.moon && z.zodiac && z.zodiac.day === '龙', 'today carries lunar/zodiac/moon', JSON.stringify({ lunar: z.lunar, zodiac: z.zodiac, moon: z.moon }))

  // 农历节令：只认八个大节，闰月不过节。
  const F1 = solarTerm('2024-02-10')
  check(F1.festival && F1.festival.name === '春节' && F1.festival.days === 0, '2024-02-10 is 春节 itself', JSON.stringify(F1.festival))
  const F2 = solarTerm('2025-10-01')
  check(F2.festival && F2.festival.name === '中秋' && F2.festival.days === 5, '2025-10-01 is five days from 中秋', JSON.stringify(F2.festival))
  const F3 = solarTerm('2026-11-24')
  check(F3.festival && F3.festival.name === '腊八' && F3.festival.days === 52, '2026-11-24 counts down to 腊八', JSON.stringify(F3.festival))
  const F4 = solarTerm('2023-06-22')
  check(F4.festival && F4.festival.name === '端午' && F4.festival.days === 0, '2023-06-22 is 端午 (闰月不过节)', JSON.stringify(F4.festival))
}

// ---------------------------------------------------------------- 4. routes
{
  const routes = new Map()
  const ctx = {
    effect: (fn) => { fn(); return () => {} },
    webServer: { register: (route) => { routes.set(route.path, route.handler) } },
    skills: { registerProvider: (fn) => { ctx.provider = fn } },
  }
  const mod = await import('../lib/index.js')
  mod.apply(ctx)
  check(routes.size === 2, 'two HTTP routes registered', String(routes.size))

  const call = (path, query) => {
    let body = ''
    const res = {
      statusCode: 0, headers: {},
      setHeader: (key, value) => { res.headers[key] = value },
      end: (chunk) => { body = chunk },
    }
    routes.get(path)({ method: 'GET', url: path + (query || '') }, res)
    return { status: res.statusCode, json: body ? JSON.parse(body) : null }
  }

  const today = call('/plugins/dshjieqi-card/api/today', '?date=2026-10-31')
  check(today.status === 200 && today.json.ok, 'today route answers 200')
  check(today.json.term === '霜降', 'today route term is 霜降')
  check(typeof today.json.tip === 'string' && today.json.tip.length > 4, 'today route carries the 养生 tip', JSON.stringify(today.json.tip))
  check(today.json.ganzhi.day && today.json.ganzhi.day.name === '戊寅', 'today route carries the day pillar')

  const bad = call('/plugins/dshjieqi-card/api/today', '?date=2026-13-40')
  check(bad.status === 400, 'today route rejects a bad date', String(bad.status))

  const year = call('/plugins/dshjieqi-card/api/year', '?year=2026')
  check(year.status === 200 && year.json.terms.length === 24, 'year route answers 24 terms')

  const provider = ctx.provider && ctx.provider()
  const list = await provider.list()
  const first = await provider.get(list[0])
  check(list.length === 1 && first.name === 'jieqi', 'skill provider lists jieqi')
  check(first.content.length > 200 && first.content.indexOf('---') !== 0, 'skill body is rendered without frontmatter', String(first.content.length))
}

if (fail.length) {
  console.log('\n' + fail.length + ' check(s) failed')
  process.exit(1)
}
console.log('\nall checks passed')
