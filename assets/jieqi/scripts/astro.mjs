/**
 * dsh-jieqi — the astronomy, in one place.
 *
 * The 24 solar terms are the instants when the Sun's apparent ecliptic
 * longitude reaches 15° steps. This module finds them with Meeus' low
 * precision solar theory (Astronomical Algorithms, ch. 25): the series is
 * truncated, so an instant can sit a few minutes away from the published
 * value. ΔT (TT − UT) is applied, which is worth about a minute by itself.
 *
 * Everything else — the sexagenary year, the month branch, the 三伏 and
 * 数九 spans — is derived from those instants here, so the host routes and
 * the jieqi skill cannot disagree with each other.
 */

/** [name, apparent longitude of the Sun in degrees]. */
export const TERMS = [
  ['春分', 0], ['清明', 15], ['谷雨', 30], ['立夏', 45], ['小满', 60], ['芒种', 75],
  ['夏至', 90], ['小暑', 105], ['大暑', 120], ['立秋', 135], ['处暑', 150], ['白露', 165],
  ['秋分', 180], ['寒露', 195], ['霜降', 210], ['立冬', 225], ['小雪', 240], ['大雪', 255],
  ['冬至', 270], ['小寒', 285], ['大寒', 300], ['立春', 315], ['雨水', 330], ['惊蛰', 345],
]

/** The twelve 节 that start a month; 立春 starts 寅. */
export const MONTH_BRANCH = {
  立春: '寅', 惊蛰: '卯', 清明: '辰', 立夏: '巳', 芒种: '午', 小暑: '未',
  立秋: '申', 白露: '酉', 寒露: '戌', 立冬: '亥', 大雪: '子', 小寒: '丑',
}

export const STEMS = '甲乙丙丁戊己庚辛壬癸'
export const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'

/**
 * 十二消息卦: each month branch owns one hexagram, yang growing from 复 to 乾
 * and yin growing from 姤 to 坤. lines[0] is the bottom (初爻) line.
 */
export const GUA = {
  子: { name: '复', symbol: '䷗', line: '一阳来复', lines: [1, 0, 0, 0, 0, 0] },
  丑: { name: '临', symbol: '䷒', line: '二阳浸长', lines: [1, 1, 0, 0, 0, 0] },
  寅: { name: '泰', symbol: '䷊', line: '三阳开泰', lines: [1, 1, 1, 0, 0, 0] },
  卯: { name: '大壮', symbol: '䷡', line: '四阳壮盛', lines: [1, 1, 1, 1, 0, 0] },
  辰: { name: '夬', symbol: '䷪', line: '五阳决阴', lines: [1, 1, 1, 1, 1, 0] },
  巳: { name: '乾', symbol: '䷀', line: '六阳纯乾', lines: [1, 1, 1, 1, 1, 1] },
  午: { name: '姤', symbol: '䷫', line: '一阴始生', lines: [0, 1, 1, 1, 1, 1] },
  未: { name: '遁', symbol: '䷠', line: '二阴渐长', lines: [0, 0, 1, 1, 1, 1] },
  申: { name: '否', symbol: '䷋', line: '天地不交', lines: [0, 0, 0, 1, 1, 1] },
  酉: { name: '观', symbol: '䷓', line: '四阴盛长', lines: [0, 0, 0, 0, 1, 1] },
  戌: { name: '剥', symbol: '䷖', line: '五阴剥阳', lines: [0, 0, 0, 0, 0, 1] },
  亥: { name: '坤', symbol: '䷁', line: '六阴纯坤', lines: [0, 0, 0, 0, 0, 0] },
}

export const NUMERALS = '一二三四五六七八九'

export const BJ_OFFSET = 8 * 3600000
export const DAY_MS = 86400000

const rad = (deg) => (deg * Math.PI) / 180

/** Apparent longitude of the Sun, degrees in [0, 360). Takes a TT Julian day. */
export function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M))
    + (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M))
    + 0.000289 * Math.sin(rad(3 * M))
  const omega = 125.04 - 1934.136 * T
  const lam = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega))
  return ((lam % 360) + 360) % 360
}

/** Signed difference a - b, folded into (-180, 180]. */
export function foldDiff(a, b) {
  let d = a - b
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

/** Bisect the TT Julian day in [lo, hi] where the Sun reaches the target longitude. */
export function solve(target, lo, hi) {
  let a = lo
  let b = hi
  for (let i = 0; i < 60; i += 1) {
    const mid = (a + b) / 2
    if (foldDiff(sunLongitude(mid), target) < 0) a = mid
    else b = mid
  }
  return (a + b) / 2
}

/**
 * ΔT = TT − UT in seconds, from the Espenak–Meeus polynomials. The 2005–2050
 * branch was fitted before the recent flattening, so it overshoots by a few
 * seconds today; that is far below the series' own error.
 */
export function deltaT(ms) {
  const date = new Date(ms)
  const y = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12
  let t
  if (y < 1920) {
    t = y - 1900
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * t * t * t * t
  }
  if (y < 1941) {
    t = y - 1920
    return 21.20 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t * t * t
  }
  if (y < 1961) {
    t = y - 1950
    return 29.07 + 0.407 * t - (t * t) / 233 + (t * t * t) / 2547
  }
  if (y < 1986) {
    t = y - 1975
    return 45.45 + 1.067 * t - (t * t) / 260 - (t * t * t) / 718
  }
  if (y < 2005) {
    t = y - 2000
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3
      + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5
  }
  if (y < 2050) {
    t = y - 2000
    return 62.92 + 0.32217 * t + 0.005589 * t * t
  }
  if (y < 2150) {
    t = (y - 1820) / 100
    return -20 + 32 * t * t - 0.5628 * (2150 - y)
  }
  t = (y - 1820) / 100
  return -20 + 32 * t * t
}

const dateToJd = (ms) => ms / DAY_MS + 2440587.5
/** TT Julian day → UTC milliseconds, undoing ΔT. */
const jdToMs = (jd, seconds) => (jd - seconds / 86400 - 2440587.5) * DAY_MS

/** Every term instant that falls inside the given calendar year (UTC ms). */
export function termsOfYear(year) {
  const out = []
  // Start on Jan 1: the first term of a calendar year is 小寒 (never before
  // Jan 5), and starting in December would find last year's 冬至 first and stop.
  const seconds = deltaT(Date.UTC(year, 6, 1))
  const shift = seconds / 86400
  const start = dateToJd(Date.UTC(year, 0, 1)) + shift
  const end = dateToJd(Date.UTC(year, 11, 31)) + shift
  for (const entry of TERMS) {
    const termName = entry[0]
    const lon = entry[1]
    let previous = sunLongitude(start)
    for (let jd = start + 5; jd <= end; jd += 5) {
      const current = sunLongitude(jd)
      const before = foldDiff(previous, lon)
      const after = foldDiff(current, lon)
      if (before <= 0 && after >= 0 && after - before < 90) {
        out.push({ name: termName, at: new Date(jdToMs(solve(lon, jd - 5, jd), seconds)) })
        break
      }
      previous = current
    }
  }
  return out
}

/** China Standard Time has no DST, so a fixed offset is exact. */
export const beijing = (date) => new Date(date.getTime() + BJ_OFFSET)
export const dayKey = (date) => beijing(date).toISOString().slice(0, 10)
export const stamp = (date) => beijing(date).toISOString().slice(0, 16).replace('T', ' ')
export const dayNumber = (date) => Math.floor(beijing(date).getTime() / DAY_MS)

/** A Beijing calendar day as 'YYYY-MM-DD', from its day number. */
export const dateOfDay = (dayNum) => new Date(dayNum * DAY_MS).toISOString().slice(0, 10)

export function ganzhiYear(year) {
  const stem = STEMS[(((year - 4) % 10) + 10) % 10]
  const branch = BRANCHES[(((year - 4) % 12) + 12) % 12]
  return stem + branch
}

/**
 * The sexagenary day index (0 = 甲子). The offset comes from the standard
 * identity JDN + 49 = index (mod 60); day numbers here count Beijing
 * calendar days from 1970-01-01, whose JDN is 2440588, hence +17.
 */
export function dayIndex(dayNum) {
  return (((dayNum + 17) % 60) + 60) % 60
}

/** The sexagenary day: 0 = 甲子, 10 = 甲戌, and so on. */
export function dayGanzhi(dayNum) {
  const index = dayIndex(dayNum)
  const stem = STEMS[index % 10]
  const branch = BRANCHES[index % 12]
  return { index, stem, branch, name: stem + branch }
}

/**
 * 时辰: a two-hour branch, 子时 spanning 23:00-01:00. Its stem follows the
 * day's own stem (五鼠遁: 甲己日甲子时, 乙庚日丙子时, 丙辛日戊子时 ...).
 */
export function hourGanzhi(date) {
  const hours = beijing(date).getUTCHours()
  const index = Math.floor(((hours + 1) % 24) / 2)
  const start = index === 0 ? 23 : index * 2 - 1
  const pad = (value) => String(value).padStart(2, '0')
  const day = dayGanzhi(dayNumber(date))
  const stem = STEMS[((day.index % 5) * 2 + index) % 10]
  return {
    index,
    name: BRANCHES[index] + '时',
    full: stem + BRANCHES[index] + '时',
    range: pad(start) + '-' + pad((start + 2) % 24),
  }
}

/** First 庚 day on or after the given day number. */
export function nextGeng(dayNum) {
  let d = dayNum
  while (dayIndex(d) % 10 !== 6) d += 1
  return d
}

/**
 * 三伏: 初伏 is the third 庚 day counted from 夏至 (the day itself counts),
 * 中伏 the fourth, 末伏 the first 庚 day after 立秋. 中伏 runs 10 or 20 days.
 */
export function fuOfYear(year) {
  const terms = termsOfYear(year)
  const xiazhi = terms.find((term) => term.name === '夏至')
  const liqiu = terms.find((term) => term.name === '立秋')
  if (!xiazhi || !liqiu) return null
  const gengs = []
  let d = dayNumber(xiazhi.at)
  while (gengs.length < 4) {
    if (dayIndex(d) % 10 === 6) gengs.push(d)
    d += 1
  }
  const initial = gengs[2]
  const middle = gengs[3]
  const last = nextGeng(dayNumber(liqiu.at))
  if (!(initial < middle && middle <= last)) return null
  return {
    initial: { day: initial, date: dateOfDay(initial) },
    middle: { day: middle, date: dateOfDay(middle) },
    last: { day: last, date: dateOfDay(last) },
    days: last + 10 - initial,
  }
}

/** Where today sits inside 三伏, if anywhere. */
export function fuAt(dayNum, fu) {
  if (!fu) return null
  if (dayNum < fu.initial.day || dayNum > fu.last.day + 9) return null
  const phase = dayNum < fu.middle.day ? '初伏' : dayNum < fu.last.day ? '中伏' : '末伏'
  const start = phase === '初伏' ? fu.initial.day : phase === '中伏' ? fu.middle.day : fu.last.day
  return {
    phase,
    day: dayNum - start + 1,
    initial: fu.initial.date,
    last: fu.last.date,
    until: dateOfDay(fu.last.day + 9),
  }
}

/** 数九: nine nine-day periods counted from 冬至. */
export function jiuAt(dayNum) {
  const year = Number(dateOfDay(dayNum).slice(0, 4))
  const starts = [year, year - 1]
    .map((y) => termsOfYear(y).find((term) => term.name === '冬至'))
    .filter(Boolean)
    .map((term) => dayNumber(term.at))
    .filter((d) => d <= dayNum)
  if (starts.length === 0) return null
  const start = Math.max(...starts)
  const diff = dayNum - start
  if (diff < 0 || diff >= 81) return null
  const index = Math.floor(diff / 9)
  return {
    name: NUMERALS[index] + '九',
    index: index + 1,
    day: (diff % 9) + 1,
    start: dateOfDay(start),
  }
}

/**
 * Everything the card needs for one day.
 * @param {string} [date] - YYYY-MM-DD; defaults to today in Beijing time.
 */
export function solarTerm(date) {
  const at = date ? new Date(date + 'T03:00:00Z') : new Date()
  const year = Number(dayKey(at).slice(0, 4))
  const all = [...termsOfYear(year - 1), ...termsOfYear(year), ...termsOfYear(year + 1)]
    .sort((left, right) => left.at - right.at)
  const today = dayNumber(at)
  const todays = all.find((term) => dayNumber(term.at) === today)
  const next = all.find((term) => dayNumber(term.at) > today)
  const current = todays || [...all].reverse().find((term) => dayNumber(term.at) < today)
  const monthStart = [...all].reverse()
    .find((term) => MONTH_BRANCH[term.name] && dayNumber(term.at) <= today)
  const lichun = all.find((term) => term.name === '立春' && dayKey(term.at).slice(0, 4) === String(year))
  const gzYear = lichun && today < dayNumber(lichun.at) ? year - 1 : year
  const branch = monthStart ? MONTH_BRANCH[monthStart.name] : ''
  const gua = GUA[branch] || null
  return {
    date: dayKey(at),
    term: current.name,
    termAt: stamp(current.at),
    isTermDay: Boolean(todays),
    dayInTerm: today - dayNumber(current.at) + 1,
    next: next ? { name: next.name, at: stamp(next.at), days: dayNumber(next.at) - today } : null,
    ganzhi: {
      year: ganzhiYear(gzYear),
      monthBranch: branch,
      monthStart: monthStart ? monthStart.name : '',
      day: dayGanzhi(today),
      // A dated lookup has no live hour; only today does.
      hour: date ? null : hourGanzhi(at),
    },
    hexagram: gua ? { name: gua.name, symbol: gua.symbol, line: gua.line, lines: gua.lines } : null,
    fu: fuAt(today, fuOfYear(year)),
    jiu: jiuAt(today),
  }
}

/** The whole year at a glance: every term, plus 三伏 and the 数九 start. */
export function yearView(year) {
  const terms = termsOfYear(year)
  const lichun = terms.find((term) => term.name === '立春')
  const dongzhi = terms.find((term) => term.name === '冬至')
  const fu = fuOfYear(year)
  return {
    year,
    ganzhi: ganzhiYear(year),
    lichun: lichun ? dayKey(lichun.at) : '',
    terms: terms
      .sort((left, right) => left.at - right.at)
      .map((term) => ({
        name: term.name,
        at: stamp(term.at),
        date: dayKey(term.at),
        jie: Boolean(MONTH_BRANCH[term.name]),
        branch: MONTH_BRANCH[term.name] || '',
      })),
    fu: fu
      ? { initial: fu.initial.date, middle: fu.middle.date, last: fu.last.date, days: fu.days }
      : null,
    jiu: dongzhi ? dayKey(dongzhi.at) : '',
  }
}