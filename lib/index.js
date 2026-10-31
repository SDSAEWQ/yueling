/**
 * dsh-jieqi — Host half.
 *
 * All astronomy lives in ./astro.mjs; this file only answers HTTP:
 *
 *   GET /plugins/dsh-jieqi/api/today[?date=YYYY-MM-DD]
 *   GET /plugins/dsh-jieqi/api/year?year=YYYY
 *
 * No state, no writes: the routes only answer what day it is.
 */

import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { solarTerm, yearView, dayKey } from './astro.mjs'

export const name = 'dsh-jieqi'
export const inject = ['webServer', 'skills']

const SKILL_DIR = fileURLToPath(new URL('../assets/jieqi/', import.meta.url))
const SKILL_FILE = new URL('../assets/jieqi/SKILL.md', import.meta.url)
const SKILL_SCRIPT = join(SKILL_DIR, 'scripts', 'jieqi.mjs')
/** The 24 养生 sentences the card shows under the term it is already reading. */
const TIP_FILE = fileURLToPath(new URL('../assets/jieqi/references/节气养生速查.md', import.meta.url))
const SKILL_DESCRIPTION = '二十四节气与干支历速查，按天文黄经精确计算（不凭记忆）。当用户提到节气、今天什么节气、现在是什么节气、某个节气名（立春/霜降/冬至等）、距下一个节气还有几天、交节时刻、节气月建、流年干支、节气养生时使用。触发词：节气、二十四节气、今天什么节气、交节、月建、流年干支、霜降、立冬、冬至、春分。'

/** Skill candidate advertised by the bundled provider. */
export const jieqiSkill = {
  name: 'jieqi',
  description: SKILL_DESCRIPTION,
  invocation: { modelInvocable: true, userInvocable: true },
  provider: 'jieqi',
  source: 'dsh-jieqi',
  resourceBase: { kind: 'directory', path: SKILL_DIR },
  rank: 600,
  locator: SKILL_FILE,
}

function stripFrontmatter(text) {
  if (!text.startsWith('---\n')) return text
  const end = text.indexOf('\n---\n', 4)
  return end === -1 ? text : text.slice(end + 5).replace(/^\n+/, '')
}

function renderBody(raw) {
  return stripFrontmatter(raw)
    .replaceAll('node scripts/jieqi.mjs', 'node "' + SKILL_SCRIPT + '"')
    .replace('在 skill 目录下运行（Windows 上 node 在 PATH 里）：', '脚本随插件安装，已写成绝对路径（Windows 上 node 在 PATH 里）：')
}

/** Immutable skill provider: one bundled skill, body read on demand. */
export const jieqiSkillProvider = {
  name: 'jieqi',
  list: () => Promise.resolve([jieqiSkill]),
  async get() {
    return {
      name: jieqiSkill.name,
      description: jieqiSkill.description,
      invocation: jieqiSkill.invocation,
      provider: jieqiSkill.provider,
      source: jieqiSkill.source,
      resourceBase: jieqiSkill.resourceBase,
      content: renderBody(await readFile(SKILL_FILE, 'utf8')),
    }
  },
}

const ROUTE = '/plugins/dsh-jieqi/api'

/** The skill's own table is the only source: | 节气 | 月建 | 一句话 |. */
let TIP_CACHE = null
function healthTips() {
  if (TIP_CACHE) return TIP_CACHE
  const tips = {}
  try {
    for (const line of readFileSync(TIP_FILE, 'utf8').split('\n')) {
      const cells = line.split('|').map((cell) => cell.trim())
      if (cells.length < 5 || !cells[1] || cells[1] === '节气' || /^-+$/.test(cells[1]) || !cells[3]) continue
      tips[cells[1]] = cells[3]
    }
  } catch (error) { /* the card simply omits the line */ }
  TIP_CACHE = tips
  return tips
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

function guard(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') return true
  sendJson(res, 405, { ok: false, error: '只接受 GET' })
  return false
}

export { solarTerm, yearView }

export function apply(ctx) {
  const server = ctx.webServer
  ctx.effect(() => server.register({
    kind: 'exact',
    path: ROUTE + '/today',
    handler: (req, res) => {
      try {
        if (!guard(req, res)) return
        const url = new URL(req.url, 'http://127.0.0.1')
        const date = url.searchParams.get('date')
        if (date !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date + 'T03:00:00Z').getTime()))) {
          sendJson(res, 400, { ok: false, error: 'date 需为 YYYY-MM-DD 的真实日期' })
          return
        }
        const today = solarTerm(date)
        sendJson(res, 200, { ok: true, ...today, tip: healthTips()[today.term] || '' })
      } catch (error) {
        sendJson(res, 500, { ok: false, error: String((error && error.message) || error) })
      }
    },
  }), 'dsh-jieqi: today route')

  ctx.effect(() => server.register({
    kind: 'exact',
    path: ROUTE + '/year',
    handler: (req, res) => {
      try {
        if (!guard(req, res)) return
        const url = new URL(req.url, 'http://127.0.0.1')
        const raw = url.searchParams.get('year')
        const year = raw === null ? Number(dayKey(new Date()).slice(0, 4)) : Number(raw)
        if (!Number.isInteger(year) || year < 1900 || year > 2200) {
          sendJson(res, 400, { ok: false, error: 'year 需为 1900-2200 的整数' })
          return
        }
        sendJson(res, 200, { ok: true, ...yearView(year) })
      } catch (error) {
        sendJson(res, 500, { ok: false, error: String((error && error.message) || error) })
      }
    },
  }), 'dsh-jieqi: year route')

  ctx.effect(() => ctx.skills.registerProvider(() => jieqiSkillProvider), 'dsh-jieqi: jieqi skill provider')
}