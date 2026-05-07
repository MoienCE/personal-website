import './style.css'

const sections = [
  { id: 'timeline', title: 'Timeline', icon: '◎' },
  { id: 'projects', title: 'Projects', icon: '◧' },
  { id: 'about', title: 'About', icon: '◉' },
  { id: 'contact', title: 'Contact', icon: '✦' }
]

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="page-shell">
    <section class="hero" id="hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid"></div>
      </div>

      <div class="container hero-layout">
        <div class="hero-copy">
          <h1 class="hero-name">Moien 34</h1>

          <p class="hero-keywords">
            A developer · Interested in the world · Sensitive to beauty
          </p>

          <p class="hero-description">
            Proxy | Proxy | Proxy | Proxy | Proxy | Proxy | Proxy | Proxy 
          </p>
        </div>

        <div class="hero-media">
          <div class="portrait-frame">
            <div class="portrait-glow"></div>
            <img
              class="portrait"
              src="/your-portrait.jpg"
              alt="Portrait"
            />
          </div>
        </div>
      </div>
    </section>

    ${sections
      .map(
        (section, index) => `
          <section
            class="content-section ${index % 2 === 0 ? 'tone-a' : 'tone-b'}"
            id="${section.id}"
            data-section-title="${section.title}"
          >
            <div class="container section-inner">
              <div class="section-head">
                <span class="section-kicker">${section.icon}</span>
                <h2>${section.title}</h2>
              </div>

              <p class="section-placeholder">
                This section will be completed soon.
              </p>
            </div>
          </section>
        `
      )
      .join('')}

    <nav class="nav-panel-wrap" aria-label="Sections navigation">
      <div class="sections-strip" id="sectionsStrip"></div>
    </nav>
  </main>
`

const strip = document.querySelector('#sectionsStrip')
const pageSections = [...document.querySelectorAll('[data-section-title]')]
const observedSections = [...document.querySelectorAll('#hero, [data-section-title]')]

pageSections.forEach((section) => {
  const sectionData = sections.find((item) => item.id === section.id)

  const card = document.createElement('button')
  card.className = 'section-card'
  card.type = 'button'
  card.setAttribute('data-target', section.id)
  card.setAttribute('aria-label', `Go to ${section.dataset.sectionTitle}`)
  card.innerHTML = `
    <span class="section-card-icon">${sectionData?.icon ?? '•'}</span>
    <strong>${section.dataset.sectionTitle}</strong>
  `

  strip.appendChild(card)
})

const cards = [...document.querySelectorAll('.section-card')]

function setActiveSection(sectionId) {
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
}

setActiveSection('hero')

strip.addEventListener('click', (event) => {
  const card = event.target.closest('.section-card')
  if (!card) return

  const targetId = card.dataset.target
  const target = document.getElementById(targetId)
  if (!target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
})

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

    if (!visibleEntries.length) return

    const activeSection = visibleEntries[0].target
    setActiveSection(activeSection.id)
  },
  {
    root: null,
    threshold: [0.35, 0.5, 0.65, 0.8]
  }
)

observedSections.forEach((section) => {
  sectionObserver.observe(section)
})
