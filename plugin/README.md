# dsh-jieqi

对话区标题栏下沿的一颗小圆点：把鼠标放上去，就展开今天的节气。

A quiet solar-term dot docked under the conversation header of the DeepSeek
Harness Web GUI. Hover it and a small card unfolds: the term, which 候 of it
we are in, the day count, and how far the next term is.

## What it is

- `lib/astro.mjs` — the one implementation of the solar-term maths: the Sun's
  apparent longitude (Meeus low precision), a ΔT correction, the 24 terms, the
  12 消息卦, 三伏, 数九, and the 干支 calendar. The `jieqi` skill carries the same
  file, so the plugin and the skill can never disagree.
- `lib/index.js` — Host half: a thin wrapper over `astro.mjs` that serves
  `GET /plugins/dsh-jieqi/api/today[?date=YYYY-MM-DD]` and
  `GET /plugins/dsh-jieqi/api/year?year=YYYY`.
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
  click of the dot, never on page load.
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
- The page you leave open is the page that comes back: fold the card on the
  年表, reload, unfold it, and the 年表 is still there (likewise 候 and 卦).
  A date rollover still returns to the front page.
- `问一问` drops a ready question into the composer; if the composer refuses
  the paste, the question is copied to the clipboard instead.
- Clicking the card copies a one-line summary.
- The 候 line (`二候 · 草木黄落 ›`) opens a second page: the term's three 候 on
  their real boundaries — past ones marked 已过, the current one counting down
  in days (hours inside the last day), the next ones with their start date.
  `‹` or `Esc` returns; a date rollover returns on its own.
- The right end of the countdown line carries the month's 消息卦 as twelve
  narrow lines: 阳 a solid stroke, 阴 a split one, the top line 上爻. 戌月 is
  剥 (five 阴 under one 阳), 子月 复, 寅月 泰 — the same twelve-hexagram cycle
  the 月建 follows. Hovering says which line it is (`五阴剥阳`); clicking opens
  the 卦 page: glyph, number, 卦辞, one plain sentence and 象曰, read against
  this month rather than as a divination. `‹` or `Esc` returns.
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
- localStorage: `dsh-jieqi.dock` (x on the header rail, viewport px),
  `dsh-jieqi.mode` (`free` or `edge` when the dot was parked away from the
  rail), `dsh-jieqi.pos` (that point: JSON `{ x, y }` for `free`,
  `{ side, y }` for `edge`),
  `dsh-jieqi.page` (`year`, `hou` or `gua`; absent on the front page),
  `dsh-jieqi.pinned` (`1` while the card is pinned open),
  `dsh-jieqi.dismissed` (date the card was folded away),
  `dsh-jieqi.announced` / `dsh-jieqi.notified` (term instant already handled),
  `dsh-jieqi.told` (the day's toast already shown),
  `dsh-jieqi.permission-asked`, `dsh-jieqi.accent` (auto | brand | tint key).
- The 七十二候 table is hard-coded in `lib/client.js` (HOU), three lines per
  term; the 候 boundaries are thirds of the actual term length, not of 15 days.
