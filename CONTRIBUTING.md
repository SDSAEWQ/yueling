# 贡献指南

欢迎贡献！月令是零依赖的 DSH 插件，节气、农历、六十四卦全部本地计算。

## 开发环境

- Node.js ≥ 22.19（CI 用 Node 24）
- 零依赖，不需要打包

```text
npm test          # 跑 test/smoke.mjs
node --check lib/client.js
```

## 目录约定

```text
lib/astro.mjs            节气 / 农历 / 干支 / 三伏 / 数九的唯一实现
lib/index.js             宿主：两个只读 JSON 路由 + 注册 jieqi skill
lib/client.js            浏览器：圆点、六张卡面、六十四卦数据
assets/jieqi/            内置 skill（SKILL.md + scripts + references）
test/smoke.mjs           零依赖冒烟测试
```

## 修改规则（重要）

1. **算法只改 `lib/astro.mjs`**，然后复制到 `assets/jieqi/scripts/astro.mjs`——冒烟测试会断言两份逐字节一致。
2. **养生文案只改 `assets/jieqi/references/节气养生速查.md`**——卡片（宿主）与 skill 脚本都从这份表读，改一处两边生效。
3. **六十四卦原文以通行本/王弼本为准**。遇到异文（如「巳日/已日」「陆/逵」），优先通行本，并在 PR 里说明取舍。
4. `client.js` 是单文件模块（`__ModuleLoader__` 工厂），数据内联；不要拆分。

## 提交

- 一个 PR 做一件事；功能改动请顺带补 `CHANGELOG.md` 小节。
- 改功能后跑 `npm test`，全绿再提。
- 发版由维护者跑 `node scripts/release.mjs minor`（需 GitHub token + npm 登录）。

## 数据订正

发现节气时刻偏差、农历差一天、卦辞异文，欢迎提 issue，附上日期与对照来源（如紫金山天文台、维基文库）。
