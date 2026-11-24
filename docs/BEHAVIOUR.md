# dshjieqi-card · behaviour reference

> Implementation-level notes for the plugin as it ships in this repository (0.9.1: the repository root is the package). User-facing docs: [../README.md](../README.md) / [../README.en.md](../README.en.md).

对话区标题栏下沿的一颗小圆点：把鼠标放上去，就展开今天的节气。

A quiet solar-term dot docked under the conversation header of the DeepSeek
Harness Web GUI. Hover it and a small card unfolds: the term, which 候 of it
we are in, the day count, and how far the next term is.

## Bundled skill

The package also ships the `jieqi` skill in `assets/jieqi/` and registers it on
the Host through `ctx.skills`. Installing the plugin therefore adds both the
card and the skill; the skill body is served with the installed script path
already resolved, so the model can run it directly. There is no separate copy any more: `assets/jieqi/` is the only one.

## What it is

- `lib/astro.mjs` — the one implementation of the solar-term maths: the Sun's
  apparent longitude (Meeus low precision), a ΔT correction, the 24 terms, the
  12 消息卦, 三伏, 数九, and the 干支 calendar. The `jieqi` skill carries the same
  file, so the plugin and the skill can never disagree.
- `lib/index.js` — Host half: a thin wrapper over `astro.mjs` that serves
  `GET /plugins/dshjieqi-card/api/today[?date=YYYY-MM-DD]` and
  `GET /plugins/dshjieqi-card/api/year?year=YYYY`.
- `lib/client.js` — browser half: one `shell.overlay` entry. No dependency on
  the Host beyond that one JSON route; every behaviour degrades quietly.

## Behaviour

- The dot is 8px and nearly transparent on ordinary days, 10px with a ripple
  on the day a term falls. Hover to unfold it.
- Drag the dot anywhere in the window. Near the conversation header it keeps
  to the rail — a hairline shows where it will land — and sliding it left or
  right stays docked, including over the sidebar: that x is a viewport
  coordinate, not a column offset. Drop it lower and it becomes free-standing,
  remembering the exact point; the card then opens above the dot when there is
  no room below. Drag it all the way to a side edge and it turns into a slim
  half-hidden tab on that edge — a dark sliver outlined in the term's own
  colour, with a small chevron pointing into the page — unfolding inward on
  hover (upward near the bottom). Each state is remembered separately. Double-click the dot, or
  right-click it, to bring it back to the middle of the header.
- Click the dot (or press Enter / Space on it) to pin the card open: it then
  survives the mouse leaving and survives a reload. The pin glyph on the title
  row does the same and shows the state; `×` clears the pin as well as folding
  the card for the day.
- `×` only folds the card away for today; the dot stays and can be unfolded
  again at any time.
- On a term day the card unfolds itself once, from one hour before the
  instant, and shows a two-pixel brand bar on top. It folds after nine
  seconds unless you are hovering it. If the page was opened earlier in the
  day, a timer holds that promise too.
- The system notification is scheduled for the exact term instant, up to a
  full term ahead, and fires once per term. Permission is asked on the first
  click of the dot, never on page load. Clicking the notification raises this
  window and unfolds the card on the new term.
- The first frame is no longer blank: the last `today` payload is cached, painted
  at once, and quietly replaced when the route answers — handy when the window
  reopens cold or the Host is still starting.
- The dot never goes stale: at local midnight, and whenever the page becomes
  visible or the window regains focus, the date is re-read and the card
  re-fetches by itself. A window left open overnight shows the new day, and a
  term that falls after midnight announces itself the same way.
- Under 480px wide the card collapses to one line — term, day count, fold —
  and takes the width it is given (never narrower than 172px). The pin, the
  swatches and `问一问` step out of the way there; the dot, `Alt+J` and the
  fold still work.
- `Alt+J` toggles the card from the keyboard: pin it open, or fold it back
  into the dot. It works anywhere in the window and does not steal typing.
  When it opens the card the focus goes in with it; closing hands the focus
  back to the dot instead of dropping it on `<body>`.
- The same keyboard map covers the rest: `←` `→` flip through the five faces,
  `1`–`5` jump to one, `?` opens the gesture sheet, and none of it fires while
  the caret sits in an input, a textarea or a contenteditable editor.
- `Esc` peels one layer at a time: a drag in progress is cancelled and the
  card (or the dot) goes back where it started; the gesture sheet steps back
  to the front; another sub-page steps back too; the front page folds.
- The page you leave open is the page that comes back: fold the card on the
  年表, reload, unfold it, and the 年表 is still there (likewise 候 and 卦).
  A date rollover still returns to the front page.
- `问一问` drops a ready question into the composer; if the composer refuses
  the paste, the question is copied to the clipboard instead.
- Clicking anywhere on the card copies a forward-ready note, one line per item:
  `11月24日 周一 · 小雪 第 3 天`, `农历 十月十六 · 属马 · 满月`, `候 · 鹖鴠不鸣`,
  the festival line, the seasonal tip, `距大雪 12 天`, and a `—— 月令 · 二十四节气`
  footer. A press that turns into a drag never copies: the
  pointer has to travel past the threshold before a release counts as a drag, so
  dragging the window no longer wipes the clipboard. The badge on the title row
  answers `已复制` for a moment, and says it to screen readers too.
- The card itself is the biggest handle: hold it anywhere — not only the dot —
  and the whole window follows, the dot riding along shrunk and dimmed. A flick
  coasts a little (380ms) before settling; pressing again catches it where it is.
- Under the 候 line sits one line of the season's own advice — `燥寒并至，宜平补…`
  for 霜降 — taken from the bundled skill's 节气养生速查 table, clamped to two
  lines with the full sentence in the tooltip. The route ships it as `tip`.
- The line under the term name carries the day pillar and the double-hour —
  `戊寅日 · 申时` on the left, the term instant right-aligned on the other
  side. The day pillar rolls over at Beijing midnight; the double-hour spans two
  hours with 子时 straddling 23:00–01:00, and its stem is derived from the day
  stem by the five-rats rule (五鼠遁). The tooltip spells out `庚申时 · 15-17`.
  A dated `?date=` lookup has no live hour, so the route answers `null` there
  instead of inventing one.
- A quiet line under the pillar reads `农历 九月二十 · 属马 · 🌒 蛾眉月` — the
  lunar date (with `闰` for a leap month), the year animal (turning at 正月, so
  it is not the same boundary as the 立春-turning 干支 year) and the day's moon
  phase. Both come from the same Meeus lunar theory in `lib/astro.mjs`, not a table.
- One more quiet line under the lunar row counts down to the next lunar festival:
  `距中秋 12 天`, or `今日中秋` on the day itself. Only the eight 大节 count —
  春节, 元宵, 端午, 七夕, 中秋, 重阳, 腊八, 小年 — and a leap month never passes
  one, the same rule the almanac uses. The date sits in the tooltip.
- The countdown speaks in days and 时辰 (two-hour stretches), not just days:
  `距立冬 7 天 1 时辰`; under an hour it falls back to minutes, and the exact
  instant sits in its tooltip. On the term day itself it becomes a live countdown
  to the minute (`距霜降 交节 43 分钟`) until the moment passes.
- The day-pillar line (`戊寅日 · 申时`) is a button: it opens a fourth page with
  the day count, the 纳音 (two consecutive 干支 share one, so 戊寅 is 城头土), the
  旬 it belongs to (甲戌旬), and three neutral lines — 日干, 日支 and the current
  时辰, each with one sentence about what the day suits. It is written as a
  reading aid only: no 吉凶, no 宜忌, and the footer says so. `‹` or `Esc`
  returns to the front page.
- `Esc` folds the card from any page: on a sub-page it steps back to the front
  page, on the front page it puts the card away and releases the pin with it.
- The first time it ever loads, the dot stays at full strength and the card
  carries one quiet line — `拖我走 · 点卡片复制 · ? 看全部手势` — then never again.
- A second click on the dot inside 450ms is read as a double-click, not as a
  second toggle: it undoes the pin the first click just made and recentres
  the dot, so a double-click never leaves the card pinned.
- A double-click on the card body copies once, not twice (the second copy
  inside 400ms is dropped), so the 已复制 badge does not blink.
- A touch is allowed to wobble 9px before a tap becomes a drag; a mouse only
  3px. `问一问` folds the card and puts the caret back in the editor after it
  fills the prompt.
- The 候 line (`二候 · 草木黄落 ›`) opens a second page: the term's three 候 on
  their real boundaries — past ones marked 已过, the current one counting down
  in days (hours inside the last day), the next ones with their start date.
  Each 候 carries a one-line plain gloss under its name. `‹` or `Esc` returns;
  a date rollover returns on its own.
- The right end of the countdown line carries the month's 消息卦 as twelve
  narrow lines: 阳 a solid stroke, 阴 a split one, the top line 上爻. 戌月 is
  剥 (five 阴 under one 阳), 子月 复, 寅月 泰 — the same twelve-hexagram cycle
  the 月建 follows. Hovering says which line it is (`五阴剥阳`); clicking opens
  the 卦 page: glyph, number, 卦辞, one plain sentence and 象曰, read against
  this month rather than as a divination. `‹` or `Esc` returns.
- Below that the 卦 page carries the coin throw: three coins six times, a back
  counting 3 and a face 2, so 6 老阴, 7 少阳, 8 少阴 and 9 老阳 — the old coin
  method. Randomness comes from `window.crypto.getRandomValues` with rejection
  sampling (never `Math.random` unless the platform has no crypto) — a
  **pseudo-random** stream, not true randomness, and the card says so; nothing
  leaves the machine. The six lines land bottom-up, one every 112 ms — at once
  under reduced motion — moving lines drawn in the accent colour with ○ or ×
  beside them; the sixth brings the primary hexagram, the changed one, its
  trigrams and one sentence — the plain layer first: the sentence of meaning,
  then, when there are moving lines, the changed hexagram's name and its own
  one-sentence meaning, then each moving line's short plain gloss (a
  still cast has no moving lines, so no line texts are shown). The classical
  text — the primary hexagram's 卦辞, 彖传 and 象, the changed hexagram's 卦辞,
  each moving line's 爻辞 and
  小象 — folds behind 「看原文」 and expands on click (all 384 爻 and 64 彖 /
  小象 are built into `client.js`). A row of
  「所问」主题 chips above the throw gives the cast a context (事业/感情/出行/健康,
   stored locally) and rides along in the copied text. 「复制卦意」 copies the
  reading (changed hexagram included), 「再摇一卦」
  throws again. Throws are kept in `dshjieqi-card.castlog` (`[{ date, values }]`,
  seven days at most; a re-throw replaces its own day), so the card shows the
  same result until the date changes; a row of date chips under the throw walks
  back through the past week (today highlighted, `今天` as its label), and tapping
  it returns. Entries older than six days are dropped on write.
- When 三伏 or 数九 is running, the countdown line leads with it instead of
  only counting to the next term: `初伏 6 天 · 距大暑 3 天`, `一九 4 天 ·
  距小寒 11 天`. 初伏 is the third 庚 day after 夏至, 末伏 the first 庚 day
  after 立秋, 数九 starts at 冬至 and runs 81 days.
- The calendar glyph beside the date opens a third page: all 24 terms of the year as a
  3×8 sheet, 立春 to 大寒, each with its date. Today's term is tinted while the
  page shows the current year. Click a term to read its exact instant; the
  footer carries 立春, the first day of 数九 and this year's 三伏 span. The two
  arrows in the header walk a year at a time (1900–2100) without leaving the
  page, so last 冬至 and next 立春 are one click away; `‹` or `Esc` returns.
- The little chip beside `×` opens a row of eight swatches: `跟随节气`, the
  brand blue, and six pale tints (竹青 松绿 绛紫 秋香 赭石 靛青). `跟随节气`
  means the card borrows each term's own tint — greens in spring, ochre and
  gold in autumn, blue-grey in winter — and the product blue the rest of the
  year. A chosen tint sticks until you change it.

## Notes

- Month branch follows the 12 节 (立春 starts 寅), and the 干支 year turns at
  立春, not January 1 — which is what 命理 expects.
- Instants carry a ΔT correction (Espenak–Meeus) and land within a couple of
  minutes of the official 紫金山天文台 values; dates are reliable. If you ever
  change the maths, change `lib/astro.mjs` and copy the file into
  `~/.agents/skills/jieqi/scripts/astro.mjs` — both halves read it.
- Times are China Standard Time (UTC+8), which has no DST.
- The lunar date and moon phase share the same Meeus lunar longitude; a new moon
  lands within roughly ±20 minutes, so a 朔 that falls right at Beijing midnight
  may move the lunar day by one against the official almanac — a known, accepted
  approximation rather than a table lookup.
- localStorage: `dshjieqi-card.dock` (x on the header rail, viewport px),
  `dshjieqi-card.mode` (`free` or `edge` when the dot was parked away from the
  rail), `dshjieqi-card.pos` (that point: JSON `{ x, y }` for `free`,
  `{ side, y }` for `edge`),
  `dshjieqi-card.page` (`year`, `hou`, `gua` or `day`; absent on the front page),
  `dshjieqi-card.pinned` (`1` while the card is pinned open),
  `dshjieqi-card.dismissed` (date the card was folded away),
  `dshjieqi-card.announced` / `dshjieqi-card.notified` (term instant already handled),
  `dshjieqi-card.told` (the day's toast already shown),
  `dshjieqi-card.permission-asked`, `dshjieqi-card.accent` (auto | brand | tint key),
  `dshjieqi-card.hinted` (`1` once the first-run line has been shown),
  `dshjieqi-card.cast` (`{ date, values }`: today's six throws, dropped when the
  date no longer matches), `dshjieqi-card.castlog` (the last seven days' throws, each
  `{ date, values }`, pruned to six days back on every write).
- The 七十二候 table is hard-coded in `lib/client.js` (HOU), three lines per
  term; the 候 boundaries are thirds of the actual term length, not of 15 days.
