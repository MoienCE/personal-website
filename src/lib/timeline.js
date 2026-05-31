import { createDebugLogger } from './debug.js'
import { createLightbox } from './lightbox.js'

const debug = createDebugLogger('timeline')
const DEFAULT_ACTIVE_OFFSET = 0.5
const DEFAULT_POINT_GAP = 260
const DEFAULT_MIN_POINT_GAP = 210
const DEFAULT_MAX_POINT_GAP = 460
const DEFAULT_MIN_SCROLL_VH = 180
const DETAIL_SWAP_MS = 140
const ACTIVE_UPDATE_THRESHOLD = 24
const SEGMENT_COLORS = ['#67e8f9', '#fbbf24', '#34d399', '#fb7185', '#a78bfa', '#f97316']

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

  const lightbox = createLightbox()

  const settings = {
    activeOffset: data.activeOffset ?? DEFAULT_ACTIVE_OFFSET,
    pointGap: data.pointGap ?? DEFAULT_POINT_GAP,
    minPointGap: data.minPointGap ?? DEFAULT_MIN_POINT_GAP,
    maxPointGap: data.maxPointGap ?? DEFAULT_MAX_POINT_GAP,
    minScrollVh: data.minScrollVh ?? DEFAULT_MIN_SCROLL_VH
  }

  const state = {
    activeId: null,
    hoverId: null,
    positions: new Map(),
    maxTranslate: 0,
    activeX: 0,
    translate: 0,
    lastDecoratedId: null,
    lastDecorationTranslate: null,
    frame: null,
    detailTimer: null,
    lightbox
  }

  renderPoints(track, milestones)

  const segment = track.querySelector('[data-timeline-segment]')
  const points = [...track.querySelectorAll('[data-timeline-point]')]

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  points.forEach((point) => {
    const id = point.dataset.timelinePoint

    if (!isTouchDevice) {
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
    }
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
  const sortedMilestones = milestones
    .map((milestone) => {
      const timelineDate = parseTimelineDate(milestone?.year)

      if (!milestone?.id || !timelineDate) return null

      return {
        ...milestone,
        title: milestone.title ?? milestone.name ?? '',
        type: String(milestone.type).toLowerCase() === 'minor' ? 'minor' : 'major',
        year: timelineDate.value,
        yearLabel: timelineDate.label,
        media: normalizeMedia(milestone.media)
      }
    })
    .filter(Boolean)
    .sort((first, second) => first.year - second.year)

  return assignSegmentMetadata(sortedMilestones)
}

function assignSegmentMetadata(milestones) {
  let currentMajor = null
  let currentSegmentIndex = -1

  return milestones.map((milestone) => {
    if (milestone.type === 'major') {
      currentSegmentIndex += 1
      currentMajor = milestone
    }

    const segmentIndex = Math.max(currentSegmentIndex, 0)
    const segmentColor = SEGMENT_COLORS[segmentIndex % SEGMENT_COLORS.length]

    return {
      ...milestone,
      segmentColor,
      segmentIndex,
      segmentMajorId: currentMajor?.id ?? milestone.id,
      segmentMajorTitle: currentMajor?.title ?? milestone.title
    }
  })
}

function parseTimelineDate(year) {
  const [yearPart, monthPart] = String(year ?? '').trim().split('.')
  const parsedYear = Number(yearPart)

  if (!Number.isInteger(parsedYear)) return null

  if (monthPart === undefined) {
    return {
      value: parsedYear,
      label: String(parsedYear)
    }
  }

  const parsedMonth = Number(monthPart)

  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) return null

  return {
    value: parsedYear + (parsedMonth - 1) / 12,
    label: `${parsedYear}.${parsedMonth}`
  }
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
    <div class="timeline-segment-ranges" data-timeline-segment-ranges aria-hidden="true">
      ${createTimelineSegments(milestones).map(renderTimelineSegment).join('')}
    </div>
    <span class="timeline-segment-highlight" data-timeline-segment aria-hidden="true"></span>
    ${milestones.map(renderPoint).join('')}
  `
}

function createTimelineSegments(milestones) {
  return milestones.reduce((segments, milestone, index) => {
    if (milestone.type !== 'major') return segments

    const nextMajor = milestones.slice(index + 1).find((item) => item.type === 'major')
    const endMilestone = nextMajor ?? milestones[milestones.length - 1]

    segments.push({
      startId: milestone.id,
      endId: endMilestone.id,
      color: milestone.segmentColor
    })

    return segments
  }, [])
}

function renderTimelineSegment(segment) {
  return `
    <span
      class="timeline-segment-range"
      data-timeline-segment-range
      data-segment-start="${escapeHtml(segment.startId)}"
      data-segment-end="${escapeHtml(segment.endId)}"
      style="--timeline-segment-color: ${escapeHtml(segment.color)}"
    ></span>
  `
}

function renderPoint(milestone) {
  const isMajor = milestone.type === 'major'
  const label = milestone.title ? `${milestone.title}, ${milestone.yearLabel}` : `Sub-interval, ${milestone.yearLabel}`

  return `
    <button
      class="timeline-point ${isMajor ? 'timeline-point--major' : 'timeline-point--minor'}"
      type="button"
      data-timeline-point="${escapeHtml(milestone.id)}"
      data-timeline-segment="${escapeHtml(String(milestone.segmentIndex))}"
      style="--timeline-segment-color: ${escapeHtml(milestone.segmentColor)}"
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
      <span class="timeline-point__year">${escapeHtml(milestone.yearLabel)}</span>
    </span>
  `
}

function layoutTrack(scene, viewport, track, milestones, points, settings, state) {
  const viewportWidth = viewport.clientWidth
  const viewportHeight = window.innerHeight
  const activeX = viewportWidth * settings.activeOffset
  const startPadding = activeX
  const endPadding = viewportWidth - activeX
  const positions = calculateTimelinePositions(milestones, settings)
  const journeyWidth = Math.max(positions[positions.length - 1] ?? 0, viewportWidth * 1.25)
  const trackWidth = startPadding + journeyWidth + endPadding

  state.positions.clear()
  state.maxTranslate = Math.max(0, trackWidth - viewportWidth)
  state.activeX = activeX

  scene.style.minHeight = `${Math.max(viewportHeight + state.maxTranslate, viewportHeight * (settings.minScrollVh / 100))}px`
  viewport.style.setProperty('--timeline-active-x', `${activeX}px`)
  track.style.width = `${trackWidth}px`

  points.forEach((point) => {
    const milestoneIndex = milestones.findIndex((item) => item.id === point.dataset.timelinePoint)
    const x = startPadding + (positions[milestoneIndex] ?? 0)

    state.positions.set(point.dataset.timelinePoint, x)
    point.style.left = `${x}px`
  })

  layoutTimelineSegments(track, state.positions)
}

function layoutTimelineSegments(track, positions) {
  const ranges = track.querySelectorAll('[data-timeline-segment-range]')

  ranges.forEach((range) => {
    const start = positions.get(range.dataset.segmentStart)
    const end = positions.get(range.dataset.segmentEnd)

    if (!Number.isFinite(start) || !Number.isFinite(end)) return

    const left = Math.min(start, end)
    const width = Math.max(28, Math.abs(end - start))

    range.style.left = `${left}px`
    range.style.width = `${width}px`
  })
}

function calculateTimelinePositions(milestones, settings) {
  const isMobile = window.innerWidth <= 767
  const mobileMultiplier = 0.7
  
  return milestones.reduce((positions, milestone, index) => {
    if (index === 0) return [0]

    const previousMilestone = milestones[index - 1]
    const yearGap = Math.max(0, milestone.year - previousMilestone.year)
    const distanceFactor = clamp(0.75 + Math.log1p(yearGap * 2) * 0.35, 0.75, 1.65)
    
    let gap = clamp(settings.pointGap * distanceFactor, settings.minPointGap, settings.maxPointGap)
    if (isMobile) {
      gap = gap * mobileMultiplier
    }

    positions.push(positions[index - 1] + gap)
    return positions
  }, [])
}

function updateFromScroll(scene, viewport, track, segment, connector, connectorLine, milestones, points, detail, settings, state) {
  const sceneRect = scene.getBoundingClientRect()
  const scrollDistance = Math.max(1, scene.offsetHeight - window.innerHeight)
  const progress = clamp(-sceneRect.top / scrollDistance, 0, 1)
  const translate = -state.maxTranslate * progress
  const activeX = viewport.clientWidth * settings.activeOffset
  const isInsideTimeline = sceneRect.top < -1 && sceneRect.bottom > window.innerHeight + 1

  state.activeX = activeX
  state.translate = translate
  document.documentElement.classList.toggle('is-timeline-scrolling', isInsideTimeline)
  track.style.transform = `translate3d(${translate}px, 0, 0)`

  const activeId = state.hoverId || findNearestPoint(activeX, translate, milestones, state.positions)

  if (!state.hoverId) {
    activateMilestone(activeId, milestones, points, detail, segment, connector, connectorLine, state)
  } else {
    updateActiveDecorations(activeId, milestones, segment, connector, connectorLine, state)
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
      updateActiveDecorations(id, milestones, segment, connector, connectorLine, state, true)
    })
  } else {
    updateActiveDecorations(id, milestones, segment, connector, connectorLine, state)
  }
}

function updateActiveDecorations(id, milestones, segment, connector, connectorLine, state, force = false) {
  if (!shouldUpdateDecorations(id, state, force)) return

  state.lastDecoratedId = id
  state.lastDecorationTranslate = state.translate
  const activeMilestone = milestones.find((milestone) => milestone.id === id)

  if (activeMilestone) {
    connector?.style.setProperty('--timeline-segment-color', activeMilestone.segmentColor)
  }

  updateLocalSegment(segment, id, milestones, state.positions)
  updateConnector(connector, connectorLine, id, state)
}

function shouldUpdateDecorations(id, state, force) {
  if (force || state.lastDecoratedId !== id) return true
  if (!Number.isFinite(state.lastDecorationTranslate)) return true

  return Math.abs(state.translate - state.lastDecorationTranslate) > ACTIVE_UPDATE_THRESHOLD
}

function updateLocalSegment(segment, activeId, milestones, positions) {
  if (!segment || !activeId) return

  const activeMilestone = milestones.find((milestone) => milestone.id === activeId)
  const center = positions.get(activeId)

  if (!activeMilestone || !Number.isFinite(center)) return

  const width = activeMilestone.type === 'minor' ? 74 : 132

  segment.style.setProperty('--timeline-segment-color', activeMilestone.segmentColor)
  segment.style.left = `${center - width / 2}px`
  segment.style.width = `${width}px`
}

function updateConnector(connector, connectorLine, activeId, state) {
  if (!connector || !connectorLine || !activeId) return

  const activePointX = (state.positions.get(activeId) ?? 0) + state.translate
  const deltaX = activePointX - state.activeX

  connector.style.setProperty('--timeline-connector-delta', `${deltaX}px`)
  connector.classList.add('is-visible')
}



function swapDetail(detail, milestone, state, onReady) {
  const lightbox = state.lightbox
  const nextContent = renderDetail(milestone)

  if (!detail.classList.contains('is-visible') || !detail.innerHTML.trim()) {
    detail.innerHTML = nextContent
    checkTextOverflow(detail)
    attachImageClickHandlers(detail, lightbox)
    detail.classList.add('is-visible')
    window.requestAnimationFrame(onReady)
    return
  }

  if (state.detailTimer) window.clearTimeout(state.detailTimer)

  detail.classList.add('is-changing')
  state.detailTimer = window.setTimeout(() => {
    detail.innerHTML = nextContent
    checkTextOverflow(detail)
    attachImageClickHandlers(detail, lightbox)
    detail.classList.remove('is-changing')
    detail.classList.add('is-visible')
    window.requestAnimationFrame(onReady)
  }, DETAIL_SWAP_MS)
}

function checkTextOverflow(detail) {
  const textEl = detail.querySelector('.timeline-card__text')
  if (textEl) {
    const hasOverflow = textEl.scrollHeight > textEl.clientHeight
    textEl.style.overflowY = hasOverflow ? 'auto' : 'hidden'
  }
}

function attachImageClickHandlers(detail, lightbox) {
  const images = detail.querySelectorAll('.timeline-card__media img')
  images.forEach((img) => {
    img.style.cursor = 'pointer'
    img.addEventListener('click', () => {
      lightbox.open(img.src, img.alt)
    })
  })
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
  const typeClass = milestone.type === 'minor' ? 'timeline-card--minor' : 'timeline-card--major'
  const relation = milestone.type === 'minor'
    ? `<p class="timeline-card__relation"> ${escapeHtml(milestone.segmentMajorTitle)}</p>`
    : ''
  
  return `
    <div class="timeline-card ${typeClass}" style="--timeline-segment-color: ${escapeHtml(milestone.segmentColor)}">
      <div class="timeline-card__media">
        ${renderMedia(milestone)}
      </div>
      <div class="timeline-card__body">
        <p class="timeline-card__eyebrow">${escapeHtml(milestone.yearLabel)}</p>
        ${relation}
        <h3 class="timeline-card__title">${escapeHtml(milestone.title || 'Memory')}</h3>
        <div class="timeline-card__text" tabindex="0">${renderRichText(milestone.description || '')}</div>
      </div>
    </div>
  `
}

function renderRichText(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
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
