import { createDebugLogger } from './debug.js'

const debug = createDebugLogger('loading')

const LOADING_MESSAGES = [
  'Loading fonts...',
  'Preparing timeline...',
  'Loading images...',
  'Initializing experience...'
]

const MIN_DISPLAY_TIME = 800
const MESSAGE_INTERVAL = 400

export function createLoadingScene(root, onComplete) {
  const startTime = Date.now()
  let messageIndex = 0
  let messageTimer = null
  let assetsLoaded = false
  let minTimeElapsed = false

  const loadingHTML = `
    <div class="loading-scene" data-loading-scene>
      <div class="loading-content">
        <div class="loading-spinner" aria-hidden="true">
          <div class="loading-spinner__dot"></div>
          <div class="loading-spinner__dot"></div>
          <div class="loading-spinner__dot"></div>
        </div>
        <p class="loading-message" data-loading-message>${LOADING_MESSAGES[0]}</p>
      </div>
    </div>
  `

  root.insertAdjacentHTML('beforeend', loadingHTML)

  const scene = root.querySelector('[data-loading-scene]')
  const messageEl = root.querySelector('[data-loading-message]')

  const updateMessage = () => {
    messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length
    if (messageEl) {
      messageEl.textContent = LOADING_MESSAGES[messageIndex]
    }
  }

  messageTimer = setInterval(updateMessage, MESSAGE_INTERVAL)

  const checkComplete = () => {
    if (assetsLoaded && minTimeElapsed) {
      clearInterval(messageTimer)
      
      scene?.classList.add('loading-scene--fade-out')
      
      setTimeout(() => {
        scene?.remove()
        onComplete()
        debug.info('loading complete')
      }, 300)
    }
  }

  setTimeout(() => {
    minTimeElapsed = true
    checkComplete()
  }, MIN_DISPLAY_TIME)

  Promise.all([
    document.fonts.ready,
    new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
      } else {
        window.addEventListener('load', resolve, { once: true })
      }
    })
  ]).then(() => {
    assetsLoaded = true
    checkComplete()
    debug.info('assets loaded', { duration: Date.now() - startTime })
  })
}
