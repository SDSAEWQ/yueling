/* Mounts the real dshjieqi-card client module inside a fake shell so the
   screenshots show the shipped component instead of a drawing of it. */
(function () {
  const React = window.React
  const ReactDOM = window.ReactDOM
  const definition = window.__jieqiDefinition

  if (!definition || typeof definition.factory !== 'function') {
    throw new Error('client.js did not hand a factory to __ModuleLoader__.load')
  }

  const module = definition.factory(function (name) {
    if (name === 'react') return React
    throw new Error('harness has no module named ' + name)
  })

  function pad(value) { return value < 10 ? '0' + value : String(value) }

  function shift(base, offset) {
    const parts = base.split('-').map(Number)
    const when = new Date(parts[0], parts[1] - 1, parts[2] + offset)
    return when.getFullYear() + '-' + pad(when.getMonth() + 1) + '-' + pad(when.getDate())
  }

  // Six 少阴 and 少阳 readings closed by today's 泰之否 (九三、六四 动).
  const FLOWS = [
    [8, 7, 8, 7, 8, 8],
    [9, 9, 7, 8, 7, 7],
    [7, 8, 8, 9, 7, 8],
    [8, 8, 7, 7, 6, 8],
    [7, 7, 7, 7, 7, 7],
    [6, 6, 6, 6, 6, 6],
    [7, 7, 9, 6, 8, 8],
  ]

  function seed(anchor) {
    const history = FLOWS.map(function (values, index) {
      return { date: shift(anchor, index - (FLOWS.length - 1)), values: values }
    })
    localStorage.setItem('dshjieqi-card.cast', JSON.stringify(history[history.length - 1]))
    localStorage.setItem('dshjieqi-card.cast.history', JSON.stringify(history))
    localStorage.setItem('dshjieqi-card.hinted', '1')
    return history
  }

  function mount() {
    const disposers = []
    const context = {
      effect: function (fn) {
        const dispose = fn()
        if (typeof dispose === 'function') disposers.push(dispose)
      },
      slots: {
        inject: function (name, factory) { factory() },
        register: function (selector, component) {
          window.__jieqiCard = component
          return function () {}
        },
      },
    }
    module.apply(context)
    if (!window.__jieqiCard) throw new Error('the card never registered into shell.overlay')
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.__jieqiCard))
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { window.__ready = true })
    })
  }

  fetch('/plugins/dshjieqi-card/api/today')
    .then(function (response) {
      if (!response.ok) throw new Error('today.json answered ' + response.status)
      return response.json()
    })
    .then(function (info) {
      const anchor = info && /^\d{4}-\d{2}-\d{2}$/.test(info.date || '') ? info.date : shift(new Date().toISOString().slice(0, 10), 0)
      seed(anchor)
      mount()
    })
    .catch(function (error) {
      document.body.insertAdjacentHTML('beforeend', '<pre style="color:#ff7b7b;padding:20px">' + String(error) + '</pre>')
    })
})()
