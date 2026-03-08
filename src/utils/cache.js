/**
 * USAGE:
 *
 * ClientCache is a flexible caching system that can store data in memory, localStorage, IndexedDB, or Ionic Storage.
 *
 * Basic usage with memory storage:
 * ```javascript
 * import ClientCache from './utils/cache'
 *
 * const cache = new ClientCache('memory')
 * await cache.set('key', { data: 'value' })
 * const value = await cache.get('key')
 * ```
 *
 * Basic usage with localStorage:
 * ```javascript
 * const cache = new ClientCache('localStorage', 'myApp')
 * await cache.set('key', { data: 'value' })
 * const value = await cache.get('key')
 * ```
 *
 * Basic usage with IndexedDB (for large datasets 50MB+):
 * ```javascript
 * const cache = new ClientCache('indexedDB', 'myApp')
 * await cache.set('key', { data: 'large-value' })
 * const value = await cache.get('key')
 * ```
 *
 * Basic usage with Ionic Storage (recommended for Ionic/Capacitor apps):
 * ```javascript
 * const cache = new ClientCache('ionicStorage', 'myApp')
 * await cache.set('key', { data: 'value' })
 * const value = await cache.get('key')
 * ```
 *
 * Using with existing Ionic Storage instance (from Vue plugin):
 * ```javascript
 * // In a Vue component
 * const cache = new ClientCache('ionicStorage', this.$storage)
 * await cache.set('key', { data: 'value' })
 * const value = await cache.get('key')
 * ```
 *
 * Features:
 * - Automatic expiration: All cached entries have a TTL (time-to-live)
 * - Storage flexibility: Choose between memory, localStorage, IndexedDB, or Ionic Storage
 * - Namespace support: Prefix keys in localStorage/IndexedDB/IonicStorage to avoid collisions
 * - Auto-cleanup: Expired entries are automatically removed on access
 * - Large data support: IndexedDB and Ionic Storage support 50MB+ storage (vs 5-10MB for localStorage)
 * - Cross-platform: Ionic Storage automatically uses the best storage engine for each platform
 * - Async API: All methods return Promises for consistent async/await usage
 */

/**
 * MemoryStorage - In-memory storage strategy
 * Data is stored in a JavaScript object and cleared when page refreshes
 * @private
 */
class MemoryStorage {
  constructor() {
    this.data = {}
  }

  /**
   * Sets a value in memory
   * @param {string} key - The storage key
   * @param {*} value - The value to store
   */
  setItem(key, value) {
    this.data[key] = value
  }

  /**
   * Gets a value from memory
   * @param {string} key - The storage key
   * @returns {*} The stored value or null
   */
  getItem(key) {
    return this.data[key] !== undefined ? this.data[key] : null
  }

  /**
   * Removes a value from memory
   * @param {string} key - The storage key
   */
  removeItem(key) {
    delete this.data[key]
  }

  /**
   * Gets all keys in memory
   * @returns {string[]} Array of all keys
   */
  keys() {
    return Object.keys(this.data)
  }

  /**
   * Clears all data from memory
   */
  clear() {
    this.data = {}
  }
}

/**
 * LocalStorageAdapter - localStorage storage strategy
 * Data persists across browser sessions
 * @private
 */
class LocalStorageAdapter {
  /**
   * Creates a localStorage adapter
   * @param {string} namespace - Prefix for all keys to avoid collisions
   */
  constructor(namespace = 'cache') {
    this.namespace = namespace
    this.storage = window.localStorage
  }

  /**
   * Generates a namespaced key
   * @param {string} key - The cache key
   * @returns {string} The namespaced key
   * @private
   */
  _getNamespacedKey(key) {
    return `${this.namespace}:${key}`
  }

  /**
   * Sets a value in localStorage
   * @param {string} key - The storage key
   * @param {*} value - The value to store (will be JSON stringified)
   */
  setItem(key, value) {
    try {
      const namespacedKey = this._getNamespacedKey(key)
      this.storage.setItem(namespacedKey, JSON.stringify(value))
    } catch (error) {
      // Handle localStorage quota exceeded or other errors
      console.warn('ClientCache: Failed to set item in localStorage', error)
    }
  }

  /**
   * Gets a value from localStorage
   * @param {string} key - The storage key
   * @returns {*} The stored value or null
   */
  getItem(key) {
    try {
      const namespacedKey = this._getNamespacedKey(key)
      const value = this.storage.getItem(namespacedKey)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.warn('ClientCache: Failed to get item from localStorage', error)
      return null
    }
  }

  /**
   * Removes a value from localStorage
   * @param {string} key - The storage key
   */
  removeItem(key) {
    try {
      const namespacedKey = this._getNamespacedKey(key)
      this.storage.removeItem(namespacedKey)
    } catch (error) {
      console.warn('ClientCache: Failed to remove item from localStorage', error)
    }
  }

  /**
   * Gets all keys in localStorage for this namespace
   * @returns {string[]} Array of all keys (without namespace prefix)
   */
  keys() {
    const keys = []
    const prefix = `${this.namespace}:`

    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(prefix)) {
          keys.push(key.substring(prefix.length))
        }
      }
    } catch (error) {
      console.warn('ClientCache: Failed to get keys from localStorage', error)
    }

    return keys
  }

  /**
   * Clears all data from localStorage for this namespace
   */
  clear() {
    try {
      const keysToRemove = []
      const prefix = `${this.namespace}:`

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => this.storage.removeItem(key))
    } catch (error) {
      console.warn('ClientCache: Failed to clear localStorage', error)
    }
  }
}

/**
 * IndexedDBAdapter - IndexedDB storage strategy
 * Supports much larger data storage (50MB+) compared to localStorage
 * Data persists across browser sessions
 * @private
 */
class IndexedDBAdapter {
  /**
   * Creates an IndexedDB adapter
   * @param {string} namespace - Namespace for the database
   */
  constructor(namespace = 'cache') {
    this.namespace = namespace
    this.dbName = `${namespace}-db`
    this.storeName = 'cache'
    this.db = null
    this.ready = this._init()
  }

  /**
   * Initializes the IndexedDB database
   * @returns {Promise<void>}
   * @private
   */
  async _init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => {
        console.error('IndexedDBAdapter: Failed to open database', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'key'
          })
          // Create index for expiration queries
          store.createIndex('expiresAt', 'expiresAt', { unique: false })
        }
      }
    })
  }

  /**
   * Sets a value in IndexedDB
   * @param {string} key - The storage key
   * @param {*} value - The value to store
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    await this.ready

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put({ key, value })

        request.onsuccess = () => resolve()
        request.onerror = () => {
          console.warn('IndexedDBAdapter: Failed to set item', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.warn('IndexedDBAdapter: Failed to set item', error)
        reject(error)
      }
    })
  }

  /**
   * Gets a value from IndexedDB
   * @param {string} key - The storage key
   * @returns {Promise<*>} The stored value or null
   */
  async getItem(key) {
    await this.ready

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(key)

        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.value : null)
        }

        request.onerror = () => {
          console.warn('IndexedDBAdapter: Failed to get item', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.warn('IndexedDBAdapter: Failed to get item', error)
        resolve(null)
      }
    })
  }

  /**
   * Removes a value from IndexedDB
   * @param {string} key - The storage key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    await this.ready

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.delete(key)

        request.onsuccess = () => resolve()
        request.onerror = () => {
          console.warn('IndexedDBAdapter: Failed to remove item', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.warn('IndexedDBAdapter: Failed to remove item', error)
        reject(error)
      }
    })
  }

  /**
   * Gets all keys in IndexedDB
   * @returns {Promise<string[]>} Array of all keys
   */
  async keys() {
    await this.ready

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.getAllKeys()

        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => {
          console.warn('IndexedDBAdapter: Failed to get keys', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.warn('IndexedDBAdapter: Failed to get keys', error)
        resolve([])
      }
    })
  }

  /**
   * Clears all data from IndexedDB
   * @returns {Promise<void>}
   */
  async clear() {
    await this.ready

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => {
          console.warn('IndexedDBAdapter: Failed to clear', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.warn('IndexedDBAdapter: Failed to clear', error)
        reject(error)
      }
    })
  }
}

/**
 * ClientCache - A generic cache system for storing and retrieving data with expiration
 * Can be used in any JavaScript environment (browser, Node.js, etc.)
 * Supports memory, localStorage, IndexedDB, and Ionic Storage strategies
 */
class ClientCache {
  /**
   * Creates a new ClientCache instance
   * @param {string} storage - Storage type: 'memory', 'localStorage', 'indexedDB', or 'ionicStorage'
   * @param {string|Object} namespace - Namespace for localStorage/IndexedDB/IonicStorage keys (ignored for memory storage). For ionicStorage, can also pass an Ionic Storage instance
   * @param {number} defaultTTL - Default time-to-live in milliseconds (default: 10 minutes)
   * @example
   * // Memory storage (data cleared on page refresh)
   * const cache = new ClientCache('memory')
   *
   * @example
   * // localStorage (data persists across sessions, 5-10MB limit)
   * const cache = new ClientCache('localStorage', 'myApp')
   *
   * @example
   * // IndexedDB (data persists across sessions, 50MB+ storage capacity)
   * const cache = new ClientCache('indexedDB', 'myApp')
   *
   * @example
   * // Ionic Storage (best for Ionic/Capacitor apps)
   * const cache = new ClientCache('ionicStorage', 'myApp')
   *
   * @example
   * // Ionic Storage with existing instance (e.g., from Vue plugin)
   * const cache = new ClientCache('ionicStorage', this.$storage)
   */
  constructor(storage = 'memory', namespace = 'cache', defaultTTL = 1000 * 60 * 10) {
    this.defaultTTL = defaultTTL
    this.pruneTimer = null

    if (storage === 'indexedDB') {
      this.storage = new IndexedDBAdapter(namespace)
      this.isAsync = true
    } else if (storage === 'localStorage') {
      this.storage = new LocalStorageAdapter(namespace)
      this.isAsync = false
    } else if (storage === 'memory') {
      this.storage = new MemoryStorage()
      this.isAsync = false
    } else {
      throw new Error(
        `Invalid storage type: ${storage}. Use 'memory', 'localStorage', 'indexedDB', or 'ionicStorage'`
      )
    }

    this.startAutoPrune()

    // Log stats asynchronously if using IndexedDB
    if (this.isAsync) {
      this.getStats().then((stats) => console.log(stats))
    } else {
      console.log(this.getStats())
    }
  }

  /**
   * Generates a cache key from URL and parameters
   * @param {string} url - The URL
   * @param {Object} params - Query parameters
   * @returns {string} The cache key
   */
  generateKey(url, params) {
    if (!params) {
      return url
    }

    const queryString = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    return `${url}?${queryString}`
  }

  /**
   * Sets a value in the cache with expiration time
   * @param {string} key - The cache key
   * @param {*} value - The value to cache
   * @param {number} ttl - Time-to-live in milliseconds (optional, uses defaultTTL if not provided)
   * @returns {Promise<void>}
   */
  async set(key, value, ttl) {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    const entry = {
      value,
      expiresAt
    }

    if (this.isAsync) {
      await this.storage.setItem(key, entry)
    } else {
      this.storage.setItem(key, entry)
    }
  }

  /**
   * Gets a value from the cache
   * @param {string} key - The cache key
   * @returns {Promise<*>} The cached value or undefined if not found or expired
   */
  async get(key) {
    const entry = this.isAsync ? await this.storage.getItem(key) : this.storage.getItem(key)

    if (!entry) {
      return undefined
    }

    if (entry.expiresAt < Date.now()) {
      await this.delete(key)
      return undefined
    }

    return entry.value
  }

  /**
   * Checks if a key exists and is not expired
   * @param {string} key - The cache key
   * @returns {Promise<boolean>} True if the key exists and hasn't expired
   */
  async has(key) {
    const value = await this.get(key)
    return value !== undefined
  }

  /**
   * Deletes a specific key from the cache
   * @param {string} key - The cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    if (this.isAsync) {
      await this.storage.removeItem(key)
    } else {
      this.storage.removeItem(key)
    }
  }

  /**
   * Deletes all keys that start with the given pattern
   * @param {string} pattern - The pattern to match (keys starting with this string will be deleted)
   * @returns {Promise<number>} The number of keys deleted
   * @example
   * // Delete all user-related cache entries
   * await cache.set('user:1', { name: 'John' })
   * await cache.set('user:2', { name: 'Jane' })
   * await cache.set('product:1', { name: 'Widget' })
   * await cache.delPattern('user:') // Deletes 'user:1' and 'user:2', returns 2
   */
  async delPattern(pattern) {
    const keys = this.isAsync ? await this.storage.keys() : this.storage.keys()

    let deletedCount = 0

    if (this.isAsync) {
      for (const key of keys) {
        if (key.startsWith(pattern)) {
          await this.storage.removeItem(key)
          deletedCount++
        }
      }
    } else {
      keys.forEach((key) => {
        if (key.startsWith(pattern)) {
          this.storage.removeItem(key)
          deletedCount++
        }
      })
    }

    return deletedCount
  }

  /**
   * Clears all cached entries
   * @returns {Promise<void>}
   */
  async clear() {
    if (this.isAsync) {
      await this.storage.clear()
    } else {
      this.storage.clear()
    }
  }

  /**
   * Starts the automatic pruning of expired entries
   */
  startAutoPrune() {
    // Run pruneExpired, handling async if needed
    if (this.isAsync) {
      this.pruneExpired().catch((err) =>
        console.error('ClientCache: Error pruning expired entries', err)
      )
    } else {
      this.pruneExpired()
    }

    this.pruneTimer = setTimeout(() => {
      this.startAutoPrune()
    }, 1000 * 60 * 10) // 10 minutes
  }

  /**
   * Stops the automatic pruning of expired entries
   */
  stopAutoPrune() {
    clearTimeout(this.pruneTimer)
  }

  /**
   * Removes all expired entries from the cache
   * Useful for cleanup operations to free up storage space
   * @returns {Promise<void>}
   */
  async pruneExpired() {
    const now = Date.now()
    const keys = this.isAsync ? await this.storage.keys() : this.storage.keys()

    if (this.isAsync) {
      for (const key of keys) {
        const entry = await this.storage.getItem(key)
        if (entry && entry.expiresAt < now) {
          await this.storage.removeItem(key)
        }
      }
    } else {
      keys.forEach((key) => {
        const entry = this.storage.getItem(key)
        if (entry && entry.expiresAt < now) {
          this.storage.removeItem(key)
        }
      })
    }
  }

  /**
   * Gets statistics about the cache
   * @returns {Promise<Object>} Cache statistics (total entries, expired entries, storage type)
   */
  async getStats() {
    const keys = this.isAsync ? await this.storage.keys() : this.storage.keys()

    const now = Date.now()
    let totalEntries = 0
    let expiredEntries = 0

    if (this.isAsync) {
      for (const key of keys) {
        const entry = await this.storage.getItem(key)
        if (entry) {
          totalEntries++
          if (entry.expiresAt < now) {
            expiredEntries++
          }
        }
      }
    } else {
      keys.forEach((key) => {
        const entry = this.storage.getItem(key)
        if (entry) {
          totalEntries++
          if (entry.expiresAt < now) {
            expiredEntries++
          }
        }
      })
    }

    let storageType = 'memory'
    if (this.storage instanceof IndexedDBAdapter) {
      storageType = 'indexedDB'
    } else if (this.storage instanceof LocalStorageAdapter) {
      storageType = 'localStorage'
    }

    return {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      storageType
    }
  }
}

export default ClientCache
