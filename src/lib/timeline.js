import { createDebugLogger } from './debug.js'

const debug = createDebugLogger('timeline')
const DEFAULT_ACTIVE_OFFSET = 0.5
const DEFAULT_POINT_GAP = 260
const DEFAULT_MIN_SCROLL_VH = 180
const DETAIL_SWAP_MS = 140

export function createTimeline(scene, data) {
  const viewport = scene.querySelector('[data-timeline-viewport]')
  const track = scene.querySelector('[data-timeline-track]')
  const detail = scene.querySelector('[data-timeline-detail]')
  const connector = scene.querySelector('[data-timeline-connector]')
  const connectorLine = scene.querySelector('[data-timeline-connector-line]')

  if (!viewport || !track || !detail) {
    debug.error('Missing timeline elements')
    return () => {}
  }

  const milestones = normalizeMilestones(data.milestones)

  if (!milestones.length) {
    debug.warn('Timeline has no milestones')
    return () => {}
  }

  const settings = {
    activeOffset: data.activeOffset ?? DEFAULT_ACTIVE_OFFSET,
    pointGap: data.pointGap ?? DEFAULT_POINT_GAP,
    minScrollVh: data.minScrollVh ?? DEFAULT_MIN_SCROLL_VH
  }

  const state = {
    activeId: null,
    hoverId: null,
    positions: new Map(),
    maxTranslate: 0,
    frame: null,
    detailTimer: null
  }

  renderPoints(track, milestones)

  const segment = track.querySelector('[data-timeline-segment]')
  const points = [...track.querySelectorAll('[data-timeline-point]')]

  points.forEach((point) => {
    const id = point.dataset.timelinePoint

    point.addEventListener('pointerenter', () => {
      state.hoverId = id
      activateMilestone(id, milestones, points, detail, segment, connector, connectorLine, state)
    })

    point.addEventListener('pointerleave', () => {
      state.hoverId = null
      updateFromScroll(scene, viewport, track, segment, connector, connectorLine, milestones, points, detail, settings, state)
    })

    point.addEventListener('focus', () => {
      state.hoverId = id
      activateMilestone(id, milestones, points, detail, segment, connector, connectorLine, state)
    })

    point.addEventListener('blur', () => {
      state.hoverId = null
      updateFromScroll(scene, viewport, track, segment, connector, connectorLine, milestones, points, detail, settings, state)
    })
  })

  const scheduleUpdate = () => {
    if (state.frame) return

    state.frame = window.requestAnimationFrame(() => {
      state.frame = null
      updateFromScroll(scene, viewport, track, segment, connector, connectorLine, milestones, points, detail, settings, state)
    })
  }

  const resizeObserver = new ResizeObserver(() => {
    layoutTrack(scene, viewport, track, milestones, points, settings, state)
    scheduleUpdate()
  })

  resizeObserver.observe(viewport)
  layoutTrack(scene, viewport, track, milestones, points, settings, state)
  updateFromScroll(scene, viewport, track, segment, connector, connectorLine, milestones, points, detail, settings, state)

  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)

  debug.info('timeline mounted', { milestones: milestones.length })

  return () => {
    resizeObserver.disconnect()
    window.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    document.documentElement.classList.remove('is-timeline-scrolling')

    if (state.frame) window.cancelAnimationFrame(state.frame)
    if (state.detailTimer) window.clearTimeout(state.detailTimer)
  }
}

function normalizeMilestones(milestones = []) {
  return milestones
    .filter((milestone) => milestone?.id && Number.isFinite(Number(milestone.year)))
    .map((milestone) => ({
      ...milestone,
      title: milestone.title ?? milestone.name ?? '',
      type: milestone.type === 'minor' ? 'minor' : 'major',
      year: Number(milestone.year),
      media: normalizeMedia(milestone.media)
    }))
    .sort((first, second) => first.year - second.year)
}

function normalizeMedia(media) {
  const items = Array.isArray(media?.items) ? media.items.filter(Boolean) : []

  return {
    type: media?.type === 'album' && items.length > 1 ? 'album' : 'single',
    items
  }
}

function renderPoints(track, milestones) {
  track.innerHTML = `
    <span class="timeline-segment-highlight" data-timeline-segment aria-hidden="true"></span>
    ${milestones.map(renderPoint).join('')}
  `
}

function renderPoint(milestone) {
  const isMajor = milestone.type === 'major'
  const label = milestone.title ? `${milestone.title}, ${milestone.year}` : `Sub-interval, ${milestone.year}`

  return `
    <button
      class="timeline-point ${isMajor ? 'timeline-point--major' : 'timeline-point--minor'}"
      type="button"
      data-timeline-point="${escapeHtml(milestone.id)}"
      aria-label="${escapeHtml(label)}"
    >
      <span class="timeline-point__dot" aria-hidden="true"></span>
      ${isMajor ? renderPointLabel(milestone) : '<span class="timeline-point__minor-mark" aria-hidden="true"></span>'}
    </button>
  `
}

function renderPointLabel(milestone) {
  return `
    <span class="timeline-point__label">
      <span class="timeline-point__title">${escapeHtml(milestone.title)}</span>
      <span class="timeline-point__year">${milestone.year}</span>
    </span>
  `
}

function layoutTrack(scene, viewport, track, milestones, points, settings, state) {
  const viewportWidth = viewport.clientWidth
  const viewportHeight = window.innerHeight
  const activeX = viewportWidth * settings.activeOffset
  const startPadding = activeX
  const endPadding = viewportWidth - activeX
  const yearStart = milestones[0].year
  const yearEnd = milestones[milestones.length - 1].year
  const yearRange = Math.max(1, yearEnd - yearStart)
  const journeyWidth = Math.max((milestones.length - 1) * settings.pointGap, viewportWidth * 1.25)
  const trackWidth = startPadding + journeyWidth + endPadding

  state.positions.clear()
  state.maxTranslate = Math.max(0, trackWidth - viewportWidth)

  scene.style.minHeight = `${Math.max(viewportHeight + state.maxTranslate, viewportHeight * (settings.minScrollVh / 100))}px`
  viewport.style.setProperty('--timeline-active-x', `${activeX}px`)
  track.style.width = `${trackWidth}px`

  points.forEach((point) => {
    const milestone = milestones.find((item) => item.id === point.dataset.timelinePoint)
    const progress = milestone ? (milestone.year - yearStart) / yearRange : 0
    const x = startPadding + progress * journeyWidth

    state.positions.set(point.dataset.timelinePoint, x)
    point.style.left = `${x}px`
  })
}

function updateFromScroll(scene, viewport, track, segment, connector, connectorLine, milestones, points, detail, settings, state) {
  const sceneRect = scene.getBoundingClientRect()
  const scrollDistance = Math.max(1, scene.offsetHeight - window.innerHeight)
  const progress = clamp(-sceneRect.top / scrollDistance, 0, 1)
  const translate = -state.maxTranslate * progress
  const activeX = viewport.clientWidth * settings.activeOffset
  const isInsideTimeline = sceneRect.top < -1 && sceneRect.bottom > window.innerHeight + 1

  document.documentElement.classList.toggle('is-timeline-scrolling', isInsideTimeline)
  track.style.transform = `translate3d(${translate}px, 0, 0)`

  const activeId = state.hoverId || findNearestPoint(activeX, translate, milestones, state.positions)
  updateActiveDecorations(activeId, milestones, points, detail, segment, connector, connectorLine, state)

  if (!state.hoverId) {
    activateMilestone(activeId, milestones, points, detail, segment, connector, connectorLine, state)
  }
}

function activateMilestone(id, milestones, points, detail, segment, connector, connectorLine, state) {
  if (!id) return

  const milestone = milestones.find((item) => item.id === id)
  if (!milestone) return

  const didChange = state.activeId !== id
  state.activeId = id

  points.forEach((point) => {
    const isActive = point.dataset.timelinePoint === id
    point.classList.toggle('is-active', isActive)
    point.setAttribute('aria-pressed', String(isActive))
  })

  if (didChange) {
    swapDetail(detail, milestone, state, () => {
      updateActiveDecorations(id, milestones, points, detail, segment, connector, connectorLine, state)
    })
  } else {
    updateActiveDecorations(id, milestones, points, detail, segment, connector, connectorLine, state)
  }
}

function updateActiveDecorations(id, milestones, points, detail, segment, connector, connectorLine, state) {
  updateLocalSegment(segment, id, milestones, state.positions)
  updateConnector(connector, connectorLine, points.find((point) => point.dataset.timelinePoint === id), detail)
}

function updateLocalSegment(segment, activeId, milestones, positions) {
  if (!segment || !activeId) return

  const activeMilestone = milestones.find((milestone) => milestone.id === activeId)
  const center = positions.get(activeId)

  if (!activeMilestone || !Number.isFinite(center)) return

  const width = activeMilestone.type === 'minor' ? 74 : 132

  segment.style.left = `${center - width / 2}px`
  segment.style.width = `${width}px`
}

function updateConnector(connector, connectorLine, point, detail) {
  const card = detail.querySelector('.timeline-card')

  if (!connector || !connectorLine || !point || !card) return

  const shellRect = connector.getBoundingClientRect()
  const pointRect = point.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const pointX = pointRect.left + pointRect.width / 2 - shellRect.left
  const pointY = pointRect.top + pointRect.height / 2 - shellRect.top
  const cardX = cardRect.left + cardRect.width / 2 - shellRect.left
  const cardY = cardRect.bottom - shellRect.top
  const bendY = pointY - Math.max(34, Math.min(96, pointY - cardY))
  const bendX = pointX + (cardX - pointX) * 0.34

  connectorLine.setAttribute('points', `${cardX},${cardY} ${bendX},${bendY} ${pointX},${pointY}`)
  connector.classList.add('is-visible')
}

function swapDetail(detail, milestone, state, onReady) {
  const nextContent = renderDetail(milestone)

  if (!detail.classList.contains('is-visible') || !detail.innerHTML.trim()) {
    detail.innerHTML = nextContent
    detail.classList.add('is-visible')
    window.requestAnimationFrame(onReady)
    return
  }

  if (state.detailTimer) window.clearTimeout(state.detailTimer)

  detail.classList.add('is-changing')
  state.detailTimer = window.setTimeout(() => {
    detail.innerHTML = nextContent
    detail.classList.remove('is-changing')
    detail.classList.add('is-visible')
    window.requestAnimationFrame(onReady)
  }, DETAIL_SWAP_MS)
}

function findNearestPoint(activeX, translate, milestones, positions) {
  return milestones.reduce(
    (nearest, milestone) => {
      const x = (positions.get(milestone.id) ?? 0) + translate
      const distance = Math.abs(x - activeX)

      return distance < nearest.distance ? { id: milestone.id, distance } : nearest
    },
    { id: milestones[0].id, distance: Infinity }
  ).id
}

function renderDetail(milestone) {
  return `
    <div class="timeline-card">
      <div class="timeline-card__media">
        ${renderMedia(milestone)}
      </div>
      <div class="timeline-card__body">
        <p class="timeline-card__eyebrow">${milestone.year}</p>
        <h3 class="timeline-card__title">${escapeHtml(milestone.title || 'Memory')}</h3>
        <p class="timeline-card__text">${escapeHtml(milestone.description || '')}</p>
      </div>
    </div>
  `
}

function renderMedia(milestone) {
  const items = milestone.media.items

  if (!items.length) {
    return '<div class="timeline-card__placeholder">No media yet</div>'
  }

  if (milestone.media.type === 'album') {
    return `
      <div class="timeline-album" aria-label="${escapeHtml(milestone.title || 'Timeline album')}">
        ${items.map((src, index) => renderImage(src, `${milestone.title || 'Timeline image'} ${index + 1}`)).join('')}
      </div>
    `
  }

  return renderImage(items[0], milestone.title || 'Timeline image')
}

function renderImage(src, alt) {
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => {
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
