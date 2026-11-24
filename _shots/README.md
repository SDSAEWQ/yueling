# 截图台（_shots）

离线跑真实 lib/client.js，用 headless Chrome 拍照：`shoot.mjs` 拍 README 用的六张卡面（600x716），`cards.mjs` + `gallery.py` 合成市场详情页用的六张方图（1080x1080）。

## 准备

1. 取 React 18 UMD：

   ``
   Invoke-WebRequest https://unpkg.com/react@18.3.1/umd/react.production.min.js -OutFile _shots/vendor/react.js
   Invoke-WebRequest https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js -OutFile _shots/vendor/react-dom.js
   ``

2. 抓一份 /api/today 的真实回答（插件启用时）：Invoke-WebRequest http://127.0.0.1:<端口>/plugins/dshjieqi-card/api/today -OutFile _shots/today.json

## 拍 README 的六张

``
node _shots/server.mjs          # 另开一个进程
node _shots/shoot.mjs           # 输出 _shots/out/*.png
``

## 拍市场的六张

``
node _shots/cards.mjs           # 输出 _shots/cards/*.png（透明底，4x）
python _shots/gallery.py        # 合成 docs/screens/01…06
``

harness.js 里预置了「泰之否」（九三、六四 动）的摇卦与七天记录，shoot.mjs 会拍 今天 / 三候 / 年表 / 卦 / 日柱 / 七天卦；cards.mjs 另外多拍「手势与快捷键」页。挑好的图复制到 docs/ 再改 README。

`screenshots.json` 列出市场详情页的六张图，顺序是 01-today / 02-day / 03-gua / 04-year / 05-faces / 06-help —— 和 gallery.py 的键名一致。
