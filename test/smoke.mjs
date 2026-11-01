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
}

// ----------------------------------------------------------------- 2. astro
{
  const a = readFileSync(ROOT + 'lib/astro.mjs')
  const b = readFileSync(ROOT + 'assets/jieqi/scripts/astro.mjs')
  const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 12)
  check(hash(a) === hash(b), 'astro.mjs copies are identical', hash(a) + ' vs ' + hash(b))
}

// ----------------------------------------------------------------- 3. hosts
const { solarTerm, yearView, dayGanzhi, hourGanzhi } = await import('../lib/astro.mjs')
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
