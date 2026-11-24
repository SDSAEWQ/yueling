/* Captures each card face on a transparent backdrop for the market gallery.
   Output: _shots/cards/<face>.png at dsf 4, clipped to the card plus 16px. */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, 'cards')
const PROFILE = path.join(HERE, 'tmp-chrome-cards')
const PAGE = 'http://127.0.0.1:' + (process.env.SHOT_PORT || 8791) + '/'
const DEBUG = 9334
const CHROME = process.env.SHOT_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const DSF = 4

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
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
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
      captureBeyondViewport: true,
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
    '--window-size=900,1100',
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
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 900, height: 1100, deviceScaleFactor: DSF, mobile: false })
    await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } })
    await cdp.send('Page.navigate', { url: PAGE + '?gallery=1' })

    await waitFor(() => cdp.eval('window.__ready === true').catch(() => false), 'harness mount')
    // Strip every piece of page furniture: only the card may land on the canvas.
    // Animations are frozen too, so a page switch cannot be caught mid-fade.
    await cdp.eval(`(() => {
      document.documentElement.style.background = 'transparent'
      document.body.style.background = 'transparent'
      for (const id of ['backdrop', 'header', 'composer']) {
        const node = document.getElementById(id)
        if (node) node.style.display = 'none'
      }
      const freeze = document.createElement('style')
      freeze.textContent = '*, *::before, *::after { animation: none !important; transition: none !important }'
      document.head.appendChild(freeze)
      for (const node of document.querySelectorAll('[data-jieqi-dot]')) node.style.visibility = 'hidden'
      return true
    })()`)
    await sleep(200)

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
    // The very first screenshot after navigation can come back blank; burn one.
    await cdp.shot(path.join(OUT, '_warmup.png'), { x: 0, y: 0, width: 220, height: 200 })
    await sleep(200)

    const settle = async () => {
      await cdp.eval(`(() => { const dot = document.querySelector('[data-jieqi-dot]'); if (dot && dot.blur) dot.blur(); return true })()`)
      await sleep(120)
    }

    const grab = async (name) => {
      await settle()
      const rect = await measure()
      if (!rect) throw new Error('card closed on ' + name)
      const state = await cdp.eval(`(() => {
        const node = document.querySelector('#dshjieqi-card-dialog')
        const style = getComputedStyle(node)
        return { opacity: style.opacity, visibility: style.visibility, inflate: node.getAttribute('data-inflate') }
      })()`)
      console.log(name, 'state', JSON.stringify(state))
      const pad = 16
      const clip = {
        x: Math.max(0, Math.round(rect.x) - pad),
        y: Math.max(0, Math.round(rect.y) - pad),
        width: Math.round(rect.width) + pad * 2,
        height: Math.round(rect.height) + pad * 2,
      }
      await cdp.shot(path.join(OUT, name + '.png'), clip)
      console.log(name, Math.round(rect.width) + 'x' + Math.round(rect.height), '->', clip.width + 'x' + clip.height, '@' + DSF + 'x')
    }

    for (const [name, key] of [['today', '1'], ['hou', '2'], ['year', '3'], ['gua', '4'], ['day', '5']]) {
      await cdp.key(key)
      await sleep(360)
      await grab(name)
    }

    // The help sheet lives behind the '?' control in the card head.
    await cdp.key('1')
    await sleep(300)
    const opened = await cdp.eval(`(() => {
      const nodes = Array.from(document.querySelectorAll('[data-jieqi-control]'))
      const button = nodes.find((node) => (node.textContent || '').trim() === '?')
      if (!button) return false
      button.click()
      return true
    })()`)
    if (!opened) throw new Error('no help control found')
    await sleep(420)
    await grab('help')

    // 七天卦: back to 卦, then look at an older throw.
    await cdp.key('4')
    await sleep(360)
    const picked = await cdp.eval(`(() => {
      const nodes = Array.from(document.querySelectorAll('[data-jieqi-control]'))
      const chip = nodes.find((node) => (node.textContent || '').trim() === '11/22')
      if (!chip) return null
      chip.click()
      return chip.textContent.trim()
    })()`)
    if (!picked) throw new Error('no older cast chip found')
    await sleep(420)
    await grab('guaold')

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
