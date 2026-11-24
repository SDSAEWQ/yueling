/* Drives headless Chrome over CDP to photograph the six card faces.
   Output: _shots/out/<face>.png at 600x716 (300x358 CSS at dsf 2). */
import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, 'out')
const PROFILE = path.join(HERE, 'tmp-chrome')
const PAGE = 'http://127.0.0.1:' + (process.env.SHOT_PORT || 8791) + '/'
const DEBUG = 9333
const CHROME = process.env.SHOT_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let body = ''
      response.on('data', (chunk) => { body += chunk })
      response.on('end', () => {
        try { resolve(JSON.parse(body)) } catch (error) { reject(error) }
      })
    }).on('error', reject)
  })
}

async function waitFor(predicate, label, timeout = 15000) {
  const start = Date.now()
  for (;;) {
    const value = await predicate()
    if (value) return value
    if (Date.now() - start > timeout) throw new Error('timed out waiting for ' + label)
    await sleep(120)
  }
}

class Cdp {
  constructor(socket) {
    this.socket = socket
    this.seq = 0
    this.pending = new Map()
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const entry = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) entry.reject(new Error(message.error.message))
        else entry.resolve(message.result)
      }
    }
  }

  send(method, params = {}) {
    const id = ++this.seq
    this.socket.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
    })
  }

  async eval(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (result.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(result.exceptionDetails).slice(0, 300))
    return result.result.value
  }

  async key(key) {
    const code = 'Digit' + key
    const keyCode = 48 + Number(key)
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode, text: key })
    await sleep(20)
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode })
  }

  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
    await sleep(60)
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
    await sleep(40)
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
  }

  async shot(file, clip) {
    const result = await this.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 },
      captureBeyondViewport: false,
    })
    fs.writeFileSync(file, Buffer.from(result.data, 'base64'))
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  fs.rmSync(PROFILE, { recursive: true, force: true })

  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--remote-debugging-port=' + DEBUG,
    '--user-data-dir=' + PROFILE,
    '--window-size=900,760',
    'about:blank',
  ], { stdio: 'ignore' })

  try {
    await waitFor(() => getJson('http://127.0.0.1:' + DEBUG + '/json/version').catch(() => null), 'chrome debugger')
    const targets = await waitFor(async () => {
      const list = await getJson('http://127.0.0.1:' + DEBUG + '/json/list').catch(() => null)
      const page = list && list.find((item) => item.type === 'page')
      return page ? list : null
    }, 'page target')
    const target = targets.find((item) => item.type === 'page')

    const socket = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      socket.onopen = resolve
      socket.onerror = reject
    })
    const cdp = new Cdp(socket)

    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 900, height: 760, deviceScaleFactor: 2, mobile: false })
    await cdp.send('Page.navigate', { url: PAGE })

    await waitFor(() => cdp.eval('window.__ready === true').catch(() => false), 'harness mount')
    const dot = await waitFor(() => cdp.eval(`(() => {
      const node = document.querySelector('[data-jieqi-dot]')
      if (!node) return null
      const rect = node.getBoundingClientRect()
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
    })()`).catch(() => null), 'dot')

    await cdp.click(dot.x, dot.y)

    const measure = () => cdp.eval(`(() => {
      const node = document.querySelector('#dshjieqi-card-dialog')
      if (!node) return null
      const rect = node.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })()`)

    await waitFor(measure, 'card panel')
    await sleep(500)

    const faces = [['today', '1'], ['hou', '2'], ['year', '3'], ['gua', '4'], ['day', '5']]
    // The dot keeps its focus ring after a synthetic click; real users see none.
    const settle = async () => {
      await cdp.eval(`(() => { const dot = document.querySelector('[data-jieqi-dot]'); if (dot && dot.blur) dot.blur(); return true })()`)
      await sleep(120)
    }
    await settle()
    const shots = []
    for (const [name, key] of faces) {
      await cdp.key(key)
      await sleep(360)
      await settle()
      const rect = await measure()
      if (!rect) throw new Error('card closed on face ' + name)
      // Compact faces keep the 600x716 frame; the 卦 face carries the whole
      // throw, so its frame grows with the card instead of cropping it.
      const tall = name === 'gua'
      const height = tall ? Math.round(rect.height) + 46 : 358
      const clip = { x: Math.round(rect.x) - 32, y: Math.round(rect.y) - 26, width: 300, height }
      shots.push({ name, clip })
      await cdp.shot(path.join(OUT, name + '.png'), clip)
      console.log(name, 'card', Math.round(rect.width) + 'x' + Math.round(rect.height), 'at', Math.round(rect.x) + ',' + Math.round(rect.y), 'frame', clip.width + 'x' + clip.height)
    }

    // 七天卦: back to 卦, then look back at an older throw.
    await cdp.key('4')
    await sleep(300)
    const picked = await cdp.eval(`(() => {
      const nodes = Array.from(document.querySelectorAll('[data-jieqi-control]'))
      const chip = nodes.find((node) => (node.textContent || '').trim() === '11/22')
      if (!chip) return null
      chip.click()
      return chip.textContent.trim()
    })()`)
    if (!picked) throw new Error('no older cast chip found')
    await sleep(420)
    await settle()
    const rect = await measure()
    const clip = { x: Math.round(rect.x) - 32, y: Math.round(rect.y) - 26, width: 300, height: Math.round(rect.height) + 46 }
    await cdp.shot(path.join(OUT, 'guaold.png'), clip)
    console.log('guaold', 'picked', picked, 'card', Math.round(rect.width) + 'x' + Math.round(rect.height), 'frame', clip.width + 'x' + clip.height)

    socket.close()
    console.log('written to', OUT)
  } finally {
    chrome.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
