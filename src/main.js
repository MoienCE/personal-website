import './style.css'
import { siteConfig } from './config/site.js'
import { createDebugLogger } from './lib/debug.js'

const ROOT_SELECTOR = '#app'
const OBSERVER_THRESHOLDS = [0.35, 0.5, 0.65, 0.8]

const debug = createDebugLogger('personal-site')
const root = document.querySelector(ROOT_SELECTOR)

mountApp(root, siteConfig)

function mountApp(app, config) {
  if (!app) {
    throw new Error(`Missing app root: ${ROOT_SELECTOR}`)
  }

  validateConfig(config)
  app.innerHTML = renderApp(config)

  const sectionIds = ['hero', ...config.sections.map((section) => section.id)]
  const nav = app.querySelector('[data-section-nav]')
  const cards = [...app.querySelectorAll('[data-section-card]')]
  const observedSections = [...app.querySelectorAll('[data-observe-section]')]
  let activeSectionId = null

  const setActiveSection = (sectionId) => {
    if (sectionId === activeSectionId) return

    activeSectionId = sectionId
    const isHero = sectionId === 'hero'

    document.body.classList.toggle('is-hero', isHero)

    cards.forEach((card) => {
      const isActive = card.dataset.target === sectionId
      card.classList.toggle('active', isActive)

      if (isActive) {
        card.setAttribute('aria-current', 'true')
      } else {
        card.removeAttribute('aria-current')
      }
    })

    debug.info('active section changed', sectionId)
  }

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId)

    if (!target) {
      debug.warn('missing scroll target', sectionId)
      return
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  nav?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-section-card]')
    if (!card) return

    scrollToSection(card.dataset.target)
  })

  setActiveSection('hero')
  observeActiveSection(observedSections, setActiveSection)
  enableKeyboardNavigation(sectionIds, () => activeSectionId, scrollToSection)
  exposeDebugTools({ config, getActiveSection: () => activeSectionId })

  debug.info('mounted', { sections: sectionIds })
}

function renderApp(config) {
  return `
    <main class="page-shell">
      ${renderHero(config.hero)}
      ${config.sections.map(renderContentSection).join('')}
      ${renderSectionNavigation(config.sections)}
    </main>
  `
}

function validateConfig(config) {
  const ids = config.sections.map((section) => section.id)
  const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index)

  if (duplicateId) {
    throw new Error(`Duplicate section id in site config: ${duplicateId}`)
  }
}

function renderHero(hero) {
  return `
    <section class="hero" id="hero" data-observe-section>
      <div class="hero-bg" aria-hidden="true">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>

      <div class="container hero-layout">
        <div class="hero-copy">
          <p class="hero-eyebrow">${escapeHtml(hero.eyebrow)}</p>
          <h1 class="hero-name">${escapeHtml(hero.name)}</h1>
          ${renderList(hero.traits, 'hero-keywords')}

          <div class="hero-description" aria-label="Website tips">
            <span class="tips-label">Website tips</span>
            ${renderList(hero.tips, 'hero-tips')}
          </div>
        </div>

        <div class="hero-media">
          <div class="portrait-frame">
            <div class="portrait-glow" aria-hidden="true"></div>
            <img class="portrait" src="${hero.portrait.src}" alt="${escapeHtml(hero.portrait.alt)}" />
          </div>
        </div>
      </div>
    </section>
  `
}

function renderContentSection(section, index) {
  const toneClass = index % 2 === 0 ? 'tone-a' : 'tone-b'

  return `
    <section
      class="content-section ${toneClass}"
      id="${escapeHtml(section.id)}"
      data-section-title="${escapeHtml(section.title)}"
      data-observe-section
    >
      <div class="container section-inner">
        <div class="section-head">
          <span class="section-kicker" aria-hidden="true">${escapeHtml(section.icon)}</span>
          <h2>${escapeHtml(section.title)}</h2>
        </div>

        <p class="section-placeholder">${escapeHtml(section.summary)}</p>
      </div>
    </section>
  `
}

function renderSectionNavigation(sections) {
  return `
    <nav class="nav-panel-wrap" aria-label="Sections navigation">
      <div class="sections-strip" data-section-nav>
        ${sections.map(renderNavCard).join('')}
      </div>
    </nav>
  `
}

function renderNavCard(section) {
  return `
    <button
      class="section-card"
      type="button"
      data-section-card
      data-target="${escapeHtml(section.id)}"
      aria-label="Go to ${escapeHtml(section.title)}"
      aria-controls="${escapeHtml(section.id)}"
    >
      <span class="section-card-icon" aria-hidden="true">${escapeHtml(section.icon)}</span>
      <strong>${escapeHtml(section.title)}</strong>
    </button>
  `
}

function renderList(items, className) {
  return `
    <ul class="${className}">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `
}

function observeActiveSection(sections, onActiveSection) {
  if (!('IntersectionObserver' in window)) {
    debug.warn('IntersectionObserver is not available; active nav state will stay on hero')
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (activeEntry) onActiveSection(activeEntry.target.id)
    },
    { threshold: OBSERVER_THRESHOLDS }
  )

  sections.forEach((section) => observer.observe(section))
}

function enableKeyboardNavigation(sectionIds, getActiveSectionId, scrollToSection) {
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || shouldIgnoreShortcut(event.target)) return

    const direction = getKeyboardDirection(event.key)
    if (!direction) return

    event.preventDefault()

    const currentIndex = sectionIds.indexOf(getActiveSectionId())
    const fallbackIndex = currentIndex === -1 ? 0 : currentIndex
    const nextIndex = clamp(fallbackIndex + direction, 0, sectionIds.length - 1)

    scrollToSection(sectionIds[nextIndex])
  })
}

function getKeyboardDirection(key) {
  if (key === 'ArrowDown' || key === 'PageDown' || key === ' ') return 1
  if (key === 'ArrowUp' || key === 'PageUp') return -1
  return 0
}

function shouldIgnoreShortcut(target) {
  if (!(target instanceof Element)) return false

  return Boolean(target.closest('button, input, textarea, select, [contenteditable="true"]'))
}

function exposeDebugTools(tools) {
  if (!debug.enabled) return

  window.__PERSONAL_SITE_DEBUG__ = tools
  debug.info('debug tools exposed as window.__PERSONAL_SITE_DEBUG__')
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }

    return entities[char]
  })
}
