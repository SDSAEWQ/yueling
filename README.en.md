<div align="center">

<img src="docs/icon.png" width="108" height="108" alt="dsh-jieqi" />

# Jieqi · dsh-jieqi

**The 24 solar terms, floating above your input box.**

A quiet dot sits on the lower edge of the DeepSeek Harness chat title bar.<br>
Hover it and it blooms into today's card. The whole card is draggable, and one click folds today into a single line.

<br>

[![npm](https://img.shields.io/npm/v/dshjieqi-card?style=flat-square&label=npm&color=4d6bfe&labelColor=15171f)](https://www.npmjs.com/package/dshjieqi-card)
[![downloads](https://img.shields.io/npm/dm/dshjieqi-card?style=flat-square&label=downloads&color=4d6bfe&labelColor=15171f)](https://www.npmjs.com/package/dshjieqi-card)
[![stars](https://img.shields.io/github/stars/SDSAEWQ/dsh-jieqi?style=flat-square&label=stars&color=4d6bfe&labelColor=15171f)](https://github.com/SDSAEWQ/dsh-jieqi/stargazers)
[![license](https://img.shields.io/badge/license-MIT-4d6bfe?style=flat-square&labelColor=15171f)](LICENSE)
[![node](https://img.shields.io/badge/node-%E2%89%A522.19-3c873a?style=flat-square&labelColor=15171f)]()
[![platform](https://img.shields.io/badge/platform-DeepSeek%20Harness-4d6bfe?style=flat-square&labelColor=15171f)]()
[![terms](https://img.shields.io/badge/24%20terms-24-f0a35b?style=flat-square&labelColor=15171f)]()

<br>

Offline · no model calls · no extra sidebar slot<br>
Every transition instant is computed locally from the sun's apparent longitude

</div>

<img src="docs/cover.png" alt="dsh-jieqi cover" />

> The card faces are the real component rendered standalone in a browser (same client.js); the outer shell is illustrative.

---

## ✨ What it is

| Trait | What it means |
| :---: | --- |
| 🎯 **One dot** | No sidebar slot, no focus steal, collapses when the mouse leaves |
| 🧮 **Computed locally** | Sun's apparent longitude + ΔT, works offline |
| 🀄 **The old calendar** | Sexagenary year · month branch · 72 pentads · 12 sovereign hexagrams · 三伏/数九 |
| 📋 **One line** | Click anywhere on the card to copy today as a single summary |
| 🫧 **Drag anything** | The whole card moves; park it at an edge to leave a slim tab |
| 🎨 **Eight palettes** | One of them follows the season (spring green, autumn gold, winter blue) |
| 🔔 **Term reminder** | Opens an hour early and posts a system notification at the exact instant |

~~~text
⬤ dot ── hover ──▶ 🌤 today ──┬── tap pentad ──▶ 🍃 pentads
                              ├── tap calendar ─▶ 📅 year table
                              └── tap hexagram ▶ ☯️ hexagram
~~~

---

## 🎑 Four faces

| 🌤 Today · term · tip · countdown | 🍃 Pentads · days left in each |
| :---: | :---: |
| ![today](docs/today.png) | ![pentads](docs/hou.png) |
| 📅 **Year table** · all 24 instants | ☯️ **Hexagram** · month branch · sovereign hexagram |
| ![year](docs/year.png) | ![hexagram](docs/gua.png) |

---

## 🌤 What it does

### 1. Today

- 🗓 Sexagenary year (switches at 立春), month branch (switches at the 12 节), Gregorian date
- 🌡 Term name, exact transition instant, day within the term
- 🍃 Which of the 72 pentads today falls in; tap through for all three
- ⏳ Days and hours until the next term, with a thin progress bar; a live countdown on the term day
- 🥣 A one-line seasonal tip (from the bundled 节气养生速查 reference)
- ☯️ The sovereign hexagram for the month branch, drawn with six lines

### 2. On the term day it shows up by itself

- ⏰ Auto-opens **one hour** before the transition, with a brand-colored hairline on top
- 🔔 Posts a **system notification** at the instant (permission requested on first dot click, not on page load)
- 1️⃣ One notification per term; works even if the page has been open overnight
- 🌊 The dot grows slightly and gives one soft ripple on a term day

### 3. Placement

- 📌 The dot docks under the chat title bar and can be dragged horizontally
- 🫳 The entire card is a handle too: press anywhere on the body to move the window, release and it glides with a little inertia
- 🫧 Park it at the left or right edge and it shrinks into a slim tab that expands inward on hover
- 🎯 Double-click or right-click the dot to return to the center
- 📍 Click the dot (or focus and press Enter / Space) to pin the card
- ⌨️ **Alt+J** toggles it globally without stealing focus
- ✖️ × only hides it for today; the dot stays
- 💾 Position, pin state, current page and palette are remembered

### 4. Year table, 三伏 and 数九

- 📅 The calendar icon opens a 3×8 table of the year; tap any term for its exact instant
- 🧭 The footer lists 立春, the first day of 数九, and the 三伏 range
- 🔥 While 三伏 or 数九 is active the countdown line shows it first: 初伏 6 days · 3 days to 大暑
- 🧮 初伏 = third 庚 day after 夏至; 末伏 = first 庚 day after 立秋; 数九 runs 81 days from 冬至

### 5. Details

- 🌙 Rolls over at local midnight, on page visibility change, and on window focus
- 📱 Under 480px the card collapses into a single row
- 🎨 Eight palettes: season-following, brand, and 竹青 / 松绿 / 绛紫 / 秋香 / 赭石 / 靛青
- 📋 Click anywhere to copy the summary (a drag over 3px is not a click); a small “copied” badge flashes; “问一问” puts a ready-made question in the composer
- 🔔 The term notification opens the card when clicked; a cold start uses the last cached result
- 📴 Local fallback when the host route is unreachable; the card still renders
- 🧯 Failing routes, denied notifications and full localStorage all degrade silently

---

## 📦 Install

### Option 1 — “Add plugin” page (fastest ✅)

The plugin page accepts a package name, a GitHub address or a local folder.

**From npm** (no git required):

~~~text
dshjieqi-card
~~~

**From GitHub** (when npm is unreachable, or you want the latest commit):

~~~text
github:SDSAEWQ/dsh-jieqi#path:/plugin
~~~

The #path:/plugin suffix is required — the package lives in the plugin/ subdirectory. Restart DSH (or press Ctrl+R), and a dot appears above the input box 🫧

> **❓ Why is the npm name dshjieqi-card and not dshjieqi?** dsh-jieqi is already taken by a placeholder package (0.0.1, README only, no dsh manifest), and npm rejects new names that differ only in punctuation — dshjieqi was rejected as “too similar”. Same plugin, different name.
>
> ⚠️ Do not install dsh-jieqi: it is an empty shell and shows no card.

### Option 2 — Marketplace index (recommended)

DSH ships without a marketplace, but the Discover page accepts any index URL:

1. **Plugins** → **Experimental plugins** → **More** → enable **Custom plugin marketplace**
2. **Discover** → **Add index** → paste:

   ~~~text
   https://cdn.jsdelivr.net/gh/SDSAEWQ/dsh-jieqi@main/market/index.json
   ~~~
3. Search for dsh-jieqi and hit install

The jieqi skill is registered with the plugin, so option 4 becomes unnecessary.

⚠️ Marketplace installs use a git source; git must be installed. Otherwise use the manual route.

> 💡 CLI equivalents (the desktop profile is usually locked by Electron — prefer the UI):
>
> ~~~text
> dsh plugin --profile web add dshjieqi-card
> dsh plugin --profile web add github:SDSAEWQ/dsh-jieqi#path:/plugin
> ~~~

### Option 3 — Manual (no git)

1. Download the repo (Code → Download ZIP) and copy **plugin/** to **%USERPROFILE%\.dsh\plugins\dsh-jieqi**
2. Add a local link dependency in **%USERPROFILE%\.dsh\profiles\desktop\package.json** and append dsh-jieqi to dsh.profile.bundles
3. Append the insert patch to **cordis.patch.yml**:

   ~~~yaml
   - insert:
       - id: jieqi
         name: dsh-jieqi
   ~~~
4. Create a directory junction:

   ~~~powershell
   New-Item -ItemType Junction -Path "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-jieqi" -Target "$env:USERPROFILE\.dsh\plugins\dsh-jieqi"
   ~~~
5. Quit DSH completely and reopen it.

### Option 4 — Skill only (for the model, not the card)

Copy **skill/jieqi** to **%USERPROFILE%\.agents\skills\jieqi**. Then ask “which solar term is today”, “how many days to 立冬”, or run it directly:

~~~text
node scripts/jieqi.mjs
node scripts/jieqi.mjs 2026-12-22
node scripts/jieqi.mjs --json
node scripts/jieqi.mjs --year
~~~

---

## 🖱️ Cheat sheet

| Do this | It does that |
| :--- | :--- |
| 🖱️ Hover the dot | Opens the card, closes when the mouse leaves |
| 📌 Click the dot / Enter / Space | Pins the card |
| ⌨️ **Alt+J** | Toggles the card globally |
| 🫳 Drag the dot | Docks to the title bar, free position, or a slim edge tab |
| 🫴 Drag the card body | Moves the whole window with inertia |
| 🔔 Click the notification | Opens the card |
| ↩️ Double / right click the dot | Back to center |
| ✖️ Click × | Hides it for today |
| 🍃 Tap the pentad line | Pentads page |
| 📅 Tap the calendar icon | Year table, ‹ › to change year |
| ☯️ Tap the hexagram | Hexagram page |
| 🎨 Tap a palette dot | Eight palettes |
| 📋 Click empty card space | Copies the one-line summary |
| ⎋ Esc / ‹ | Back |

---

## 🔌 Host routes

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | /plugins/dsh-jieqi/api/today?date=YYYY-MM-DD | Term, sexagenary, pentad, hexagram for a date (defaults to today) |
| GET | /plugins/dsh-jieqi/api/year?year=YYYY | All 24 terms of a year with exact instants |

~~~json
{
  "ok": true,
  "date": "2026-10-30",
  "term": "霜降",
  "termAt": "2026-10-23T17:39:00+08:00",
  "isTermDay": false,
  "dayInTerm": 8,
  "tip": "燥寒并至，宜平补（山药、栗子），护胃护膝，忌过食辛辣",
  "next": { "name": "立冬", "at": "2026-11-07T17:49:00+08:00", "days": 8 },
  "ganzhi": { "year": "丙午", "monthBranch": "戌", "monthStart": "寒露" }
}
~~~

The client calls this local route only; no external requests.

---

## 🎯 Accuracy

- 🧮 Meeus low-precision apparent solar longitude + Espenak–Meeus ΔT + bisection
- 📏 Within about **2–6 minutes** of the Purple Mountain Observatory values; dates are reliable
- 🕗 Fixed to UTC+8 (no DST), years 1900–2100
- 🀄 The sexagenary year switches at 立春 and the month branch at each of the 12 节 — the calendrical convention, not the lunar month

---

## 🗂️ Layout

~~~text
dsh-jieqi/
├─ plugin/                 the DSH plugin (host + browser + algorithm)
├─ skill/jieqi/            standalone skill: CLI, SKILL.md, references
├─ market/index.json       index you can add to the marketplace
└─ docs/                   screenshots and icon
~~~

## 🧹 Uninstall

Remove dsh-jieqi from package.json and cordis.patch.yml, delete the junction and the plugin folder, restart DSH. localStorage keys prefixed dsh-jieqi.* may stay.

## 📄 License

MIT © 2026 SDSAEWQ

<p align="center"><sub>☯️ Signals, not fortune-telling 🌗</sub></p>
