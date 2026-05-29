import './style.css'
import { siteConfig } from './config/site.js'
import { createDebugLogger } from './lib/debug.js'
import { timelineData } from './config/timeline.js'
import { createTimeline } from './lib/timeline.js'

const ROOT_SELECTOR = '#app'
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

    document.documentElement.classList.remove('is-timeline-scrolling')
    window.scrollTo({
      top: target.offsetTop,
      behavior: 'smooth'
    })
  }

  nav?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-section-card]')
    if (!card) return

    if (card.dataset.target === activeSectionId) return

    scrollToSection(card.dataset.target)
  })

  setActiveSection('hero')
  observeActiveSection(observedSections, setActiveSection)
  enableKeyboardNavigation(sectionIds, () => activeSectionId, scrollToSection)
  exposeDebugTools({ config, getActiveSection: () => activeSectionId })

  const timelineSection = app.querySelector('[data-timeline-scene]')
  if (timelineSection) createTimeline(timelineSection, timelineData)

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
  const isTimeline = section.id === 'timeline'

  if (isTimeline) {
    return renderTimelineSection(section, toneClass)
  }

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

function renderTimelineSection(section, toneClass) {
  return `
    <section
      class="timeline-section ${toneClass}"
      id="${escapeHtml(section.id)}"
      data-section-title="${escapeHtml(section.title)}"
      data-observe-section
      data-timeline-scene
    >
      <div class="timeline-sticky">
        <div class="container timeline-shell">
          <header class="timeline-heading">
            <span class="section-kicker" aria-hidden="true">${escapeHtml(section.icon)}</span>
            <div>
              <p class="timeline-label">Life Journey</p>
              <h2>${escapeHtml(section.title)}</h2>
            </div>
          </header>

          <article class="timeline-detail" data-timeline-detail aria-live="polite"></article>
          <svg class="timeline-connector" data-timeline-connector aria-hidden="true">
            <path data-timeline-connector-line d=""></path>
          </svg>

          <div class="timeline-viewport" data-timeline-viewport>
            <div class="timeline-track" data-timeline-track></div>
          </div>
        </div>
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
  let frame = null

  const updateActiveSection = () => {
    frame = null

    const viewportAnchor = window.innerHeight * 0.45
    const activeSection = sections.find((section) => {
      const rect = section.getBoundingClientRect()
      return rect.top <= viewportAnchor && rect.bottom > viewportAnchor
    })

    if (activeSection) onActiveSection(activeSection.id)
  }

  const scheduleUpdate = () => {
    if (frame) return
    frame = window.requestAnimationFrame(updateActiveSection)
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
  updateActiveSection()
}

function enableKeyboardNavigation(sectionIds, getActiveSectionId, scrollToSection) {
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || shouldIgnoreShortcut(event.target)) return

    if (getActiveSectionId() === 'timeline') return

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
