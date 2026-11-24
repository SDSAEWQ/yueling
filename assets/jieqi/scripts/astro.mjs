/**
 * dshjieqi-card — the astronomy, in one place.
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
  const dayGz = dayGanzhi(today)
  const lunar = lunarDate(today)
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
      day: dayGz,
      // A dated lookup has no live hour; only today does.
      hour: date ? null : hourGanzhi(at),
    },
    hexagram: gua ? { name: gua.name, symbol: gua.symbol, line: gua.line, lines: gua.lines } : null,
    fu: fuAt(today, fuOfYear(year)),
    jiu: jiuAt(today),
    lunar: lunar ? { year: lunar.year, month: lunar.month, day: lunar.day, isLeap: lunar.isLeap, monthName: lunar.monthName, dayName: lunar.dayName, zodiac: lunar.zodiac } : null,
    zodiac: {
      year: lunar ? lunar.zodiac : (ZODIAC[ganzhiYear(gzYear)[1]] || ''),
      day: ZODIAC[dayGz.branch] || '',
    },
    moon: moonPhase(today),
    festival: nextFestival(today),
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

// ---------------------------------------------------------------------------
// 月相与农历：同一套 Meeus 低精度理论，月亮视黄经在本地算出来。
// 朔（新月）是月亮追上太阳、黄经相合的那一刻；农历月从一次朔到下一次朔。
// 农历的置闰规则照紫金山天文台现行算法：冬至必在十一月、大寒必在十二月，
// 正月必含雨水；一个不含任何中气的朔望月，就是上一个月的闰月。

/** 月亮视黄经（度，[0,360)）。Meeus《Astronomical Algorithms》第 47 章，截到 0.004°。 */
export function moonLongitude(jd) {
  const T = (jd - 2451545.0) / 36525
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
    + (T * T * T) / 538841 - (T * T * T * T) / 65194000
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
    + (T * T * T) / 545868 - (T * T * T * T) / 113065000
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
    + (T * T * T) / 69699 - (T * T * T * T) / 14712000
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T
    - (T * T * T) / 3526000 + (T * T * T * T) / 863310000
  const s = Math.sin
  const lam = Lp
    + 6.288774 * s(rad(Mp))
    + 1.274027 * s(rad(2 * D - Mp))
    + 0.658314 * s(rad(2 * D))
    + 0.213618 * s(rad(2 * Mp))
    - 0.185116 * s(rad(M))
    - 0.114332 * s(rad(2 * F))
    + 0.058793 * s(rad(2 * D - 2 * Mp))
    + 0.057066 * s(rad(2 * D - M - Mp))
    + 0.053322 * s(rad(2 * D + Mp))
    + 0.045758 * s(rad(2 * D - M))
    - 0.040923 * s(rad(M - Mp))
    - 0.034720 * s(rad(D))
    - 0.030383 * s(rad(M + Mp))
    + 0.015327 * s(rad(2 * D - 2 * F))
    - 0.012528 * s(rad(Mp + 2 * F))
    + 0.010980 * s(rad(Mp - 2 * F))
    + 0.010675 * s(rad(4 * D - Mp))
    + 0.010034 * s(rad(3 * Mp))
    + 0.008548 * s(rad(4 * D - 2 * Mp))
    - 0.007888 * s(rad(M - Mp + 2 * D))
    + 0.006782 * s(rad(2 * D + M))
    + 0.005162 * s(rad(Mp - M))
    + 0.005000 * s(rad(Mp + D))
    + 0.004049 * s(rad(Mp - M + 2 * D))
    + 0.003996 * s(rad(2 * Mp + 2 * D))
    + 0.003862 * s(rad(4 * D))
    + 0.003665 * s(rad(2 * D - 3 * Mp))
  return ((lam % 360) + 360) % 360
}

/** 月亮相对太阳的黄经差，折到 (-180, 180]。朔时为 0，向上穿过 0 的那一下就是朔。 */
export function moonElongation(jd) {
  return foldDiff(moonLongitude(jd), sunLongitude(jd))
}

/** TT 儒略日 → UTC 毫秒，undo ΔT（迭代一次即可，ΔT 变化极慢）。 */
function jdToUtcMs(jd) {
  const rough = (jd - 2440587.5) * DAY_MS
  return (jd - deltaT(rough) / 86400 - 2440587.5) * DAY_MS
}

/** 在 [lo, hi] 内二分求出朔的 TT 儒略日（黄经差由负转正的那一点）。 */
function newMoonJd(lo, hi) {
  let a = lo
  let b = hi
  for (let i = 0; i < 60; i += 1) {
    const mid = (a + b) / 2
    if (moonElongation(mid) < 0) a = mid
    else b = mid
  }
  return (a + b) / 2
}

/** 严格晚于 jd 的下一次朔的 TT 儒略日。 */
function nextNewMoonAfter(jd) {
  let prev = moonElongation(jd)
  const step = 0.5
  for (let i = 1; i <= 80; i += 1) {
    const cur = moonElongation(jd + step * i)
    if (prev <= 0 && cur >= 0) return newMoonJd(jd + step * (i - 1), jd + step * i)
    prev = cur
  }
  return jd + 29.53
}

/** [fromMs, toMs] 之间的每一次朔，按时间升序（UTC 毫秒）。 */
function newMoonsBetween(fromMs, toMs) {
  const out = []
  const startJd = dateToJd(fromMs) + deltaT(fromMs) / 86400
  const endJd = dateToJd(toMs) + deltaT(toMs) / 86400
  let jd = startJd
  for (let guard = 0; guard < 64; guard += 1) {
    const nm = nextNewMoonAfter(jd)
    if (nm > endJd) break
    out.push(jdToUtcMs(nm))
    jd = nm + 20
  }
  return out
}

/** 十二中气 → 农历月序：冬至在十一月，大寒在十二月，雨水在正月…… */
const ZHONGQI_MONTH = {
  冬至: 11, 大寒: 12, 雨水: 1, 春分: 2, 谷雨: 3, 小满: 4,
  夏至: 5, 大暑: 6, 处暑: 7, 秋分: 8, 霜降: 9, 小雪: 10,
}

const LUNAR_MONTH_NAMES = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
const LUNAR_DAY_NAMES = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

export const ZODIAC = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' }

/** 农历年号 = 正月初一所在的公历年。正月必含雨水，故正月初一是雨水前最近的一次朔。 */
function lunarYearOf(dayNum) {
  const gy = Number(dateOfDay(dayNum).slice(0, 4))
  const yushui = termsOfYear(gy).find((term) => term.name === '雨水')
  if (!yushui) return gy
  const yd = dayNumber(yushui.at)
  const anchorMs = yd * DAY_MS - BJ_OFFSET
  const moons = newMoonsBetween(anchorMs - 35 * DAY_MS, anchorMs + 2 * DAY_MS).map((ms) => dayNumber(new Date(ms)))
  moons.sort((a, b) => a - b)
  const cny = moons.filter((d) => d <= yd).pop()
  return cny !== undefined && dayNum >= cny ? gy : gy - 1
}

/** 农历月表：以 dayNum 为中心，取前后若干天内的朔日，排出每个农历月的起止与月序。 */
function lunarMonthsAround(dayNum, backDays, fwdDays) {
  const year = Number(dateOfDay(dayNum).slice(0, 4))
  const zhongqi = []
  for (const y of [year - 1, year, year + 1]) {
    for (const term of termsOfYear(y)) {
      if (ZHONGQI_MONTH[term.name]) zhongqi.push({ name: term.name, month: ZHONGQI_MONTH[term.name], day: dayNumber(term.at) })
    }
  }
  zhongqi.sort((a, b) => a.day - b.day)

  const anchor = dayNum * DAY_MS - BJ_OFFSET
  const moons = newMoonsBetween(anchor - backDays * DAY_MS, anchor + fwdDays * DAY_MS).map((ms) => dayNumber(new Date(ms)))
  moons.sort((a, b) => a - b)

  const months = []
  for (let i = 0; i + 1 < moons.length; i += 1) {
    const start = moons[i]
    const end = moons[i + 1]
    const z = zhongqi.find((item) => item.day >= start && item.day < end)
    months.push({ start, end, month: z ? z.month : 0, leap: !z })
  }
  // 无中气的月是闰月，沿用前一个月的月序。
  for (let i = 0; i < months.length; i += 1) {
    if (months[i].month !== 0) continue
    months[i].leap = true
    for (let j = i - 1; j >= 0; j -= 1) {
      if (months[j].month !== 0) { months[i].month = months[j].month; break }
    }
  }
  return months
}

/** 某一天的农历：年份（正月初一所在的公历年）、月、日、是否闰月、名称与年生肖。 */
export function lunarDate(dayNum) {
  const months = lunarMonthsAround(dayNum, 40, 40)
  const hit = months.find((m) => dayNum >= m.start && dayNum < m.end)
  if (!hit) return null

  const ly = lunarYearOf(dayNum)
  return {
    year: ly,
    month: hit.month,
    day: dayNum - hit.start + 1,
    isLeap: hit.leap,
    monthName: (hit.leap ? '闰' : '') + LUNAR_MONTH_NAMES[hit.month],
    dayName: LUNAR_DAY_NAMES[dayNum - hit.start + 1] || '',
    zodiac: ZODIAC[ganzhiYear(ly)[1]] || '',
  }
}

/** 农历节令：只取通行不过闰月的八个，按农历月日写死。 */
const FESTIVALS = [
  { name: '春节', month: 1, day: 1 },
  { name: '元宵', month: 1, day: 15 },
  { name: '端午', month: 5, day: 5 },
  { name: '七夕', month: 7, day: 7 },
  { name: '中秋', month: 8, day: 15 },
  { name: '重阳', month: 9, day: 9 },
  { name: '腊八', month: 12, day: 8 },
  { name: '小年', month: 12, day: 23 },
]

function festivalInMonths(dayNum, months) {
  const index = months.findIndex((m) => dayNum >= m.start && dayNum < m.end)
  if (index === -1) return null
  const current = months[index]
  const dayOfMonth = dayNum - current.start + 1
  // 同一个农历月里还有没过的节令（春节/元宵、腊八/小年）。
  if (!current.leap) {
    const same = FESTIVALS.find((f) => f.month === current.month && f.day >= dayOfMonth)
    if (same) return { name: same.name, days: same.day - dayOfMonth, date: dateOfDay(current.start + same.day - 1) }
  }
  for (let i = index + 1; i < months.length; i += 1) {
    const month = months[i]
    if (month.leap) continue
    const hit = FESTIVALS.find((f) => f.month === month.month)
    if (hit) return { name: hit.name, days: month.start + hit.day - 1 - dayNum, date: dateOfDay(month.start + hit.day - 1) }
  }
  return null
}

/** 下一个农历节令：{ name, days, date }；days = 0 就是今天过了。闰月不过节。 */
export function nextFestival(dayNum) {
  return festivalInMonths(dayNum, lunarMonthsAround(dayNum, 40, 400))
}

/** 月相：以当天北京正午为准，给出月龄（天）、相名与一个象形。 */
export function moonPhase(dayNum) {
  const noonMs = dayNum * DAY_MS - BJ_OFFSET + DAY_MS / 2
  const jd = dateToJd(noonMs) + deltaT(noonMs) / 86400
  const angle = ((moonLongitude(jd) - sunLongitude(jd)) % 360 + 360) % 360
  const age = (angle / 360) * 29.5305887
  const t = ((age % 29.5305887) + 29.5305887) % 29.5305887
  if (t < 1.8 || t > 27.7) return { phase: '朔', name: '新月', emoji: '🌑', age: Math.round(age * 10) / 10 }
  if (t < 5.9) return { phase: '蛾眉', name: '蛾眉月', emoji: '🌒', age: Math.round(age * 10) / 10 }
  if (t < 8.8) return { phase: '上弦', name: '上弦月', emoji: '🌓', age: Math.round(age * 10) / 10 }
  if (t < 11.7) return { phase: '盈凸', name: '盈凸月', emoji: '🌔', age: Math.round(age * 10) / 10 }
  if (t < 17.8) return { phase: '望', name: '满月', emoji: '🌕', age: Math.round(age * 10) / 10 }
  if (t < 20.7) return { phase: '亏凸', name: '亏凸月', emoji: '🌖', age: Math.round(age * 10) / 10 }
  if (t < 23.7) return { phase: '下弦', name: '下弦月', emoji: '🌗', age: Math.round(age * 10) / 10 }
  return { phase: '残月', name: '残月', emoji: '🌘', age: Math.round(age * 10) / 10 }
}