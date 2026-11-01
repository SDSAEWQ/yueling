<div align="center">

<img src="docs/icon.png" width="108" height="108" alt="月令" />

# 月令 · 二十四节气

**二十四节气，落在输入框上方。**

一颗安静的小圆点，停在 DeepSeek Harness 对话区标题栏的下沿。<br>
鼠标移上去，它展开成今天的节气卡；整张卡能拖着走，点一下就把今天折成一行带走。

<br>

[![npm](https://img.shields.io/npm/v/dshjieqi-card?style=flat-square&label=npm&color=4d6bfe&labelColor=15171f)](https://www.npmjs.com/package/dshjieqi-card)
[![downloads](https://img.shields.io/npm/dm/dshjieqi-card?style=flat-square&label=downloads&color=4d6bfe&labelColor=15171f)](https://www.npmjs.com/package/dshjieqi-card)
[![stars](https://img.shields.io/github/stars/SDSAEWQ/yueling?style=flat-square&label=stars&color=4d6bfe&labelColor=15171f)](https://github.com/SDSAEWQ/yueling/stargazers)
[![ci](https://github.com/SDSAEWQ/yueling/actions/workflows/ci.yml/badge.svg)](https://github.com/SDSAEWQ/yueling/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-4d6bfe?style=flat-square&labelColor=15171f)](LICENSE)
[![node](https://img.shields.io/badge/node-%E2%89%A522.19-3c873a?style=flat-square&labelColor=15171f)]()
[![platform](https://img.shields.io/badge/platform-DeepSeek%20Harness-4d6bfe?style=flat-square&labelColor=15171f)]()
[![terms](https://img.shields.io/badge/%E4%BA%8C%E5%8D%81%E5%9B%9B%E8%8A%82%E6%B0%94-24-f0a35b?style=flat-square&labelColor=15171f)]()

<br>

不联网 · 不调用模型 · 不占一个侧栏位置<br>
所有交节时刻由太阳视黄经在本地算出来

</div>

<img src="docs/cover.png" alt="月令 封面" />

> 卡面是真实组件在浏览器里独立渲染的（同一份 client.js），外壳为示意。

<div align="center">

<img src="docs/demo.gif" width="244" alt="圆点像个气泡一样鼓成卡片" />

<sub>🫧 悬停圆点，卡片从圆点里鼓出来 —— 真录屏，不是示意</sub>

</div>

---

## ✨ 它是什么

| 特点 | 说明 |
| :---: | --- |
| 🎯 **一颗点** | 不占侧栏、不抢焦点，鼠标移开自己收起 |
| 🧮 **本地算** | 太阳视黄经 + ΔT 修正，断网也算得出 |
| 🀄 **老历法** | 干支年 · 月建 · 日柱时辰 · 七十二候 · 十二消息卦 · 三伏数九 |
| 📋 **一句话** | 点卡片任意处，把今天复制成一行摘要 |
| 🎲 **摇一卦** | 三枚铜钱六掷，六爻自下而上落定，给一句话卦意 |
| 🫧 **随手拖** | 整张卡能拖着走，拖到边缘收成半隐藏的窄标签 |
| 🎨 **八种配色** | 其中一种跟着节气走（春绿、秋赭金、冬蓝灰） |
| 🔔 **交节提醒** | 提前一小时自己展开，交节那一刻发一条系统通知 |

~~~text
⬤ 圆点 ── 悬停 ──▶ 🌤 今天 ──┬── 点二候 ──▶ 🍃 三候
                             ├── 点日历 ──▶ 📅 年表
                             ├── 点日柱 ──▶ 🧭 日柱 · 今天适合做的事
                             └── 点消息卦 ▶ ☯️ 消息卦 · 摇一卦 · 回看七天
~~~

---

## 🎑 六张卡面

| 🌤 今天 · 节气 · 日柱 · 养生 · 距离 | 🍃 三候 · 每一候还剩几天 |
| :---: | :---: |
| ![今天](docs/today.png) | ![三候](docs/hou.png) |
| 📅 **年表** · 全年二十四次交节 | ☯️ **消息卦** · 月建 · 十二消息卦 · 摇一卦 |
| ![年表](docs/year.png) | ![消息卦](docs/gua.png) |
| 🧭 **日柱** · 纳音 · 旬 · 今天适合做的事 | 🗂️ **七天卦** · 回看这七天摇过的卦 |
| ![日柱](docs/day.png) | ![七天卦](docs/guaold.png) |

---

## 🌤 能做什么

### 一、看今天

- 🗓 **干支年**（立春换年）、**月建**（十二节换月，立春起寅）、**日柱**（按北京时间零点换日）、公历日期
- 🕰 **时辰**：现在走到哪一个时辰（子时 23:00–01:00），时辰天干按五鼠遁从日干推出来；鼠标停在「戊寅日 · 申时」上能看到完整的「庚申时 · 15-17」
- 🧭 **日柱页**：点那一行就展开——第几日、纳音（城头土）、落在哪一旬（甲戌旬），再给日干、日支、此刻时辰各一句「今天适合做的事」（只说适合，不谈吉凶）
- 🌡 节气名、交节时刻、进入该节气的第几天
- 🍃 当前处于哪一候（七十二候），点开看三候的完整分段
- ⏳ 距下一个节气还有几天几**时辰**（1 时辰 = 2 小时，如「距立冬 7 天 1 时辰」），底部一条细进度条；交节当天换成实时倒计时
- 🥣 一行当令养生：该吃什么、护哪里，一句话说完（取自插件内置的《节气养生速查》）
- ☯️ 月建对应的消息卦，十二道爻线（阳一画、阴两画，上爻在上）
- 🎲 卦页底部可以摇一卦：三枚铜钱掷六次，六爻自下而上落定，出本卦、之卦和一句话卦意

### 二、节气当天会主动出现

- ⏰ 交节前 **1 小时**自动展开卡片，顶部一条品牌色细条
- 🔔 交节时刻发一条**系统通知**（首次点击圆点时才请求通知权限，不在页面加载时打扰）
- 1️⃣ 通知每个节气只发一次；页面开着过夜，也会在交节时提醒
- 🌊 交节日圆点会变大一点，并有一次很轻的涟漪

### 三、怎么放、怎么收

- 📌 圆点默认吸附在对话区标题栏下沿，可左右拖动；靠近标题栏时停在栏上，拖到下面就是自由位置
- 🫳 整张卡片也能拖：按住正文任意处就能挪动整个窗口，松手顺着惯性滑一段再吸附
- 🫧 拖到窗口左右边缘会收成一条**半隐藏的窄标签**，悬停向内展开（靠近底部时向上展开）
- 🎯 双击圆点、或右键圆点，回到标题栏中间
- 📍 点击圆点（或聚焦后按 Enter / 空格）把卡片**钉住**，移开鼠标也不收
- ⌨️ 按 **Alt+J** 随时开合，不抢输入焦点
- ✖️ 点 × 只是今天不再自动展开，圆点还在，随时能再打开
- 💾 卡片位置、钉住状态、当前页、配色都会记住

### 四、年表、三伏与数九

- 📅 日历图标打开全年 3×8 节气表，点任一节气看精确交节时刻
- 🧭 页脚给出当年的立春、入九第一天、三伏区间
- 🔥 三伏或数九正在进行时，倒计时行会先显示它：初伏 6 天 · 距大暑 3 天 / 一九 4 天 · 距小寒 11 天
- 🧮 初伏 = 夏至后第三个庚日，末伏 = 立秋后第一个庚日；数九从冬至起 81 天

### 五、摇一卦

- 🪙 三枚铜钱掷六次：一背记 3、一字记 2，三枚合计 6 老阴、7 少阳、8 少阴、9 老阳，就是卦摊上那套以钱代蓍
- 🎲 随机数取 window.crypto.getRandomValues，拒绝采样抹掉取模偏差；全过程本地，不发任何请求
- ⬇️ 六爻自初爻往上一爻一爻落下（每爻 112ms），动爻标 ○ 或 ×，落定后同时读出本卦与之卦
- 🧾 一句话卦意，六十四卦各一句，例如「大过：栋梁将挠 —— 非常之时行非常之举，但别硬撑」
- 📋 「复制卦意」把日期、第几卦、上下卦、动爻、之卦连那句话拼成一段；「再摇一卦」立刻重来
- 🗂️ 摇过的卦留七天：卦页底部一排日期小标签（今天 / 10/30 / 10/28 …），点哪天看哪天，今天那颗高亮，再点回今天；超过七天自动清掉
- 💾 当天摇的卦会记住（切页、关掉再开都在）；系统开了减弱动态效果就直接落定

### 六、细节

- 🌙 跨日自动换日：本地午夜、页面重新可见、窗口重新获得焦点时都会重新取数，开一夜的窗口第二天就是新的一天
- 📱 窄窗（< 480px）自动收成单行：节气 · 第 N 天 · 关闭
- 🎨 八种配色：跟随节气（春绿、秋赭金、冬蓝灰）、品牌色，以及竹青、松绿、绛紫、秋香、赭石、靛青
- 📋 点击卡片任意处复制一行摘要（拖过 3px 只算拖动），标题旁闪一下「已复制」；「问一问」把一句现成的问题放进输入框（放不进去就复制到剪贴板）
- 🔔 交节通知点一下就能打开卡片；冷启动先用上次的结果顶上，不用等接口
- 📴 断网或宿主接口不可用时，客户端有本地兜底，卡片照常显示
- 🧯 宿主接口挂掉、通知被拒、localStorage 满，都静默降级，不弹错误

---

## 📦 安装

> 📦 整个仓库就是插件包：`package.json`、`cordis.patch.yml`、`lib/`、`assets/` 都在根目录上（0.9.1 起不再有 `plugin/` 子目录），所以包名、GitHub 地址、本地目录三种装法都指向仓库根。

### 方式一：插件页「添加插件」（最快）

插件页右上角 **添加插件** 接受包名、GitHub 地址或本地目录。

**从 npm 装**（不用 git，推荐 ✅）：

~~~text
dshjieqi-card
~~~

**从 GitHub 装**（npm 连不上、或想追仓库最新代码时用）：

~~~text
github:SDSAEWQ/yueling
~~~

GitHub 那行不用再加子目录后缀 —— 仓库根目录本身就是插件包。装完重启 DSH（或按 Ctrl+R 刷新窗口），输入框上方就会多一颗圆点 🫧

> **❓ 为什么插件 ID 和 npm 包名都叫 dshjieqi-card？** npm 上的 dshjieqi、dsh-jieqi 都已经被别人占了（0.0.1 的空壳），而 npm 会拒绝「只差标点」的新包名（dshjieqi 被判 too similar 直接挡回来）。所以从 0.11.2 起插件 ID 与包名统一成 dshjieqi-card：目录构建器要按「仓库 package.json 的 name → npm 同名包 → repository 指回同一仓库」这条链对上，名字不一致就永远进不了官方索引，市场卡片上的版本与下载量也会一直是空的。
>
> 🏷 **改名与迁移**：2026 年 10 月起仓库叫 **月令**（`SDSAEWQ/yueling`），旧地址 `SDSAEWQ/dsh-jieqi` 会 301 跳转；0.11.2 起插件 ID 由 dsh-jieqi 改成 dshjieqi-card —— 装过老版本的人先把旧的卸掉（或从 profile 里删掉 dsh-jieqi 那一行）再装新的，否则会同时跑两份、出现两颗圆点。卡片位置、配色这些偏好存在旧前缀的 localStorage 里，不会自动搬过来。

### 方式二：插件市场索引（推荐）

DSH 本体不带市场。社区有两个入口：**dshmarket** 插件市场读的是公共目录 https://awesome-dsh-plugin.com/plugins.json ；DSH 自带的 **发现** 页可以加任意「索引源」——索引就是一个普通 JSON，放在 GitHub 上即可。

1. 打开 **插件** 页 → **实验性插件** → 右上角 **更多** → 勾选 **启用「自定义插件市场」**
2. 切到 **发现** → **添加索引**，填入：

   ~~~text
   https://cdn.jsdelivr.net/gh/SDSAEWQ/yueling@main/market/index.json
   ~~~

   （raw.githubusercontent.com 国内常常连不上，jsDelivr 更稳，两者内容一致。）
3. 在 **发现** 页顶部的「搜索插件」框里直接打 dshjieqi-card（或翻列表找 **月令**），点卡片上的安装按钮

安装完成后，jieqi skill 会随插件一起注册进会话技能目录，不需要再按方式四装一遍。

注意 ⚠️：市场安装走 git 源，本机需要装有 git。没有 git 就用下面的手动方式。

> 💡 命令行等价写法（桌面版 profile 常被 Electron 独占，能走界面就走界面）：
>
> ~~~text
> dsh plugin --profile web add dshjieqi-card
> dsh plugin --profile web add github:SDSAEWQ/yueling
> ~~~

> 📮 提交到公共目录的条目在 market/awesome-entry.yml。合并进 awesome-dsh-plugin 之后，dshmarket 里搜 dshjieqi-card 或 月令 就能直接装。

> 🔏 索引只声明「从哪里装」，实际装什么由包自己的 package.json 决定；索引没有签名，升级需要卸载重装。

### 方式三：手动安装（不需要 git）

1. 下载本仓库（Code → Download ZIP），把仓库根目录整个复制到（`docs/`、`market/` 两份可以不要）：

   ~~~text
   %USERPROFILE%\.dsh\plugins\dshjieqi-card
   ~~~

2. 编辑 **%USERPROFILE%\.dsh\profiles\desktop\package.json**，在 dependencies 里加一行，在 dsh.profile.bundles 末尾加一项：

   ~~~json
   {
     "dependencies": {
       "dshjieqi-card": "link:C:/Users/<你的用户名>/.dsh/plugins/dshjieqi-card"
     },
     "dsh": {
       "profile": {
         "bundles": [
           "@deepseek-ai/dsh-base",
           "dshjieqi-card"
         ]
       }
     }
   }
   ~~~

3. 在 **%USERPROFILE%\.dsh\profiles\desktop\cordis.patch.yml** 末尾追加：

   ~~~yaml
   - insert:
       - id: jieqi
         name: dshjieqi-card
   ~~~

4. 建一个目录联接（node_modules 里要能找到这个包）：

   ~~~powershell
   New-Item -ItemType Junction -Path "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dshjieqi-card" -Target "$env:USERPROFILE\.dsh\plugins\dshjieqi-card"
   ~~~

5. 完全退出 DSH 再打开。宿主半边会随应用启动，页面按 **Ctrl+R** 刷新即可看到圆点。

> 🧷 桌面版的 profile 由 Electron 独占管理，命令行 dsh plugin --profile desktop 会被拒绝，只能按上面改文件。

### 方式四：只装 skill（给模型用，不是卡片）

如果已经用方式一或方式二装了插件，这一步可以跳过 —— skill 已经在插件里。

把 **assets/jieqi** 整个目录复制到：

~~~text
%USERPROFILE%\.agents\skills\jieqi
~~~

新开一个会话，输入 **/jieqi**，或直接问「今天什么节气」「距立冬还有几天」「现在什么月建」，模型会调用随带的脚本按黄经计算，而不是凭记忆 🤖

skill 也可以直接在终端用：

~~~text
node scripts/jieqi.mjs                # 今天
node scripts/jieqi.mjs 2026-12-22     # 指定日期
node scripts/jieqi.mjs --json         # 机器可读
node scripts/jieqi.mjs --year         # 附当年 24 节气全表
~~~

---

## 🖱️ 交互速查

| 手怎么动 | 卡片怎么应 |
| :--- | :--- |
| 🖱️ 鼠标移到圆点 | 展开卡片，移开自动收起 |
| 📌 点击圆点 / Enter / Space | 钉住卡片 |
| ⌨️ **Alt+J** | 开合卡片（全局，不抢焦点） |
| 🫳 拖动圆点 | 吸附标题栏、自由位置、拖到边缘收成窄标签 |
| 🫴 拖动卡片正文 | 移动整个窗口，松手带一点惯性 |
| 🔔 点系统通知 | 打开卡片 |
| ↩️ 双击 / 右键圆点 | 回到标题栏中间 |
| ✖️ 点 × | 今天收起（圆点保留） |
| 🍃 点「二候 · …」 | 三候页 |
| 📅 点日历图标 | 年表页，‹ › 换年 |
| ☯️ 点消息卦 | 卦页 |
| 🧭 点「戊寅日 · 申时」 | 日柱页：纳音、旬、今天适合做的事 |
| 🗂️ 点卦页的日期小标签 | 回看前几天的卦 |
| 🎲 点「摇一卦」 | 三枚铜钱六掷，逐爻落定出卦 |
| 📋 点「复制卦意」 | 复制这一卦与那句话 |
| 🎨 点配色圆点 | 八种配色 |
| 📋 点卡片空白 | 复制一行摘要 |
| ⎋ Esc / ‹ | 返回上一页 |

---

## 🔌 宿主接口

插件宿主半边只做两件事：把算法包成 HTTP，交给已经装好的 Web 服务。

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | /plugins/dshjieqi-card/api/today?date=YYYY-MM-DD | 指定日期的节气、干支、候、消息卦；省略 date 为今天 |
| GET | /plugins/dshjieqi-card/api/year?year=YYYY | 全年二十四节气与交节时刻 |

返回 JSON，形如：

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
  "ganzhi": {
    "year": "丙午",
    "monthBranch": "戌",
    "monthStart": "寒露",
    "day": { "index": 14, "name": "戊寅" },
    "hour": { "index": 8, "name": "申时", "full": "庚申时", "range": "15-17" }
  }
}
~~~

ganzhi.hour 只在省略 date（也就是「今天」）时给值；带 ?date= 查历史某天时它是 null，因为那一天没有「现在几点」。

客户端只请求这一个本地路由，不发任何外网请求。

---

## 🎯 精度与边界

- 🧮 算法：Meeus《Astronomical Algorithms》太阳视黄经低精度公式 + Espenak–Meeus ΔT 修正 + 二分法求解
- 📏 与紫金山天文台公布的交节时刻相差约 **2–6 分钟**，日期可靠；追到秒级需要 VSOP87 或权威历表
- 🕗 时区固定为北京时间（UTC+8，无夏令时）
- 📆 年表范围 1900–2100
- 🀄 年干支严格按立春换年，月建按十二节换月 —— 这是命理的算法，不是农历月
- 🎲 摇卦用本地密码学随机数（crypto.getRandomValues + 拒绝采样），与古法「以钱代蓍」的感应无关；六十四卦那句话照卦义写，只作参照，不断吉凶

---

## 🧪 开发

零依赖，不需要打包：

~~~text
npm test        # node test/smoke.mjs
~~~

冒烟测试在 Node 里把 client.js 装进一个假 window（没有浏览器），验证它能被模块加载器接住、apply 能挂上 slots；再跑交节算法的几个锚点（2026-10-31 是戊寅日、1949-10-01 甲子、2024-02-10 甲辰）、断言 lib/astro.mjs 与 assets/jieqi/scripts/astro.mjs 两份逐字节相同、两个路由真的回 200、内置 skill 的正文不带 YAML frontmatter。

推上去之后 GitHub Actions（.github/workflows/ci.yml）会跑同样一套：五个文件 node --check + npm test。

---

## 🗂️ 目录结构

~~~text
yueling/                      ← 仓库根目录 = 插件包（月令）
├─ package.json              dsh manifest、exports、npm 元信息
├─ cordis.patch.yml          挂载声明
├─ lib/
│  ├─ astro.mjs              节气、干支、消息卦、三伏、数九的唯一实现
│  ├─ index.js               宿主：两个只读 JSON 路由
│  └─ client.js              浏览器：一颗圆点、六张卡面与六十四卦
├─ assets/jieqi/             内置 skill（SKILL.md + scripts + references）
├─ market/index.json         可添加的插件市场索引（format 1）
├─ test/smoke.mjs            零依赖冒烟测试（npm test）
├─ .github/workflows/ci.yml  GitHub Actions：语法 + 冒烟
├─ docs/                     截图、动图、图标与 BEHAVIOUR.md
├─ README.md / README.en.md  两份展示版说明
└─ CHANGELOG.md
~~~

---

## 🧹 卸载

1. 从 **%USERPROFILE%\.dsh\profiles\desktop\package.json** 的 dependencies 与 dsh.profile.bundles 里删掉 dshjieqi-card
2. 删掉 **cordis.patch.yml** 末尾的 jieqi 那段 insert
3. 删掉 **node_modules\dshjieqi-card** 联接与 **%USERPROFILE%\.dsh\plugins\dshjieqi-card** 目录
4. 重启 DSH

localStorage 里的 dshjieqi-card.* 键可留可删，不影响其他功能。

---

## 📣 一句话安利

> 输入框上面有一颗小圆点，点开是「今天霜降，距立冬还有 7 天 7 小时，该吃点山药栗子了」。

---

## 🌏 English

A short English README lives in [README.en.md](README.en.md). The detailed behaviour reference is in [docs/BEHAVIOUR.md](docs/BEHAVIOUR.md).

## 📄 License

MIT © 2026 SDSAEWQ

<p align="center"><sub>🌗 时刻有据 · 摇卦随缘 · 不作吉凶判断 🎲</sub></p>
