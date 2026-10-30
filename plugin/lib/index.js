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

import { solarTerm, yearView, dayKey } from './astro.mjs'

export const name = 'dsh-jieqi'
export const inject = ['webServer']

const ROUTE = '/plugins/dsh-jieqi/api'

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
        sendJson(res, 200, { ok: true, ...solarTerm(date) })
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
}