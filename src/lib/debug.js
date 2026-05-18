function hasStorageDebugFlag() {
  try {
    return window.localStorage?.getItem('debug') === 'personal-site'
  } catch {
    return false
  }
}

export function createDebugLogger(scope) {
  const params = new URLSearchParams(window.location.search)
  const enabled = import.meta.env.DEV && (params.has('debug') || hasStorageDebugFlag())
  const prefix = `[${scope}]`

  return {
    enabled,
    info: (...args) => {
      if (enabled) console.info(prefix, ...args)
    },
    warn: (...args) => {
      if (enabled) console.warn(prefix, ...args)
    },
    error: (...args) => console.error(prefix, ...args)
  }
}
