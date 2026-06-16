const localStorageAdapter = {
  async get(key) {
    const value = window.localStorage.getItem(key)
    return value === null ? null : { value }
  },
  async set(key, value) {
    window.localStorage.setItem(key, value)
    return { key, value }
  },
  async remove(key) {
    window.localStorage.removeItem(key)
    return { key }
  },
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = localStorageAdapter
}

export default localStorageAdapter
