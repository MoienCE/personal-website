import { createDebugLogger } from './debug.js'

const debug = createDebugLogger('lightbox')

export function createLightbox() {
  let currentImageSrc = null
  let currentImageAlt = null

  const lightboxHTML = `
    <div class="lightbox" data-lightbox aria-hidden="true">
      <div class="lightbox__backdrop" data-lightbox-backdrop></div>
      <div class="lightbox__content">
        <button class="lightbox__close" data-lightbox-close aria-label="Close lightbox">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <img class="lightbox__image" data-lightbox-image src="" alt="" />
      </div>
    </div>
  `

  document.body.insertAdjacentHTML('beforeend', lightboxHTML)

  const lightbox = document.querySelector('[data-lightbox]')
  const backdrop = document.querySelector('[data-lightbox-backdrop]')
  const closeBtn = document.querySelector('[data-lightbox-close]')
  const image = document.querySelector('[data-lightbox-image]')

  const open = (src, alt) => {
    currentImageSrc = src
    currentImageAlt = alt
    image.src = src
    image.alt = alt
    lightbox.classList.add('lightbox--open')
    lightbox.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    debug.info('lightbox opened', { src })
  }

  const close = () => {
    lightbox.classList.remove('lightbox--open')
    lightbox.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    setTimeout(() => {
      image.src = ''
      image.alt = ''
      currentImageSrc = null
      currentImageAlt = null
    }, 300)
    debug.info('lightbox closed')
  }

  closeBtn?.addEventListener('click', close)
  backdrop?.addEventListener('click', close)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('lightbox--open')) {
      close()
    }
  })

  return { open, close }
}
