/**
 * USAGE:
 *
 * This module provides a caching and request deduplication system for API calls.
 *
 * Basic setup in Vue (memory cache):
 * ```javascript
 * import ApiClientPlugin from './utils/clients'
 * app.use(ApiClientPlugin)
 *
 * // Then in components:
 * this.$store.$clients.api.get('users')
 * ```
 *
 * Setup with localStorage cache (persists across sessions):
 * ```javascript
 * import ApiClientPlugin from './utils/clients'
 * app.use(ApiClientPlugin, {
 *   cacheStorage: 'localStorage',
 *   cacheNamespace: 'myapp-cache',
 *   cacheTTL: 1000 * 60 * 15 // 15 minutes
 * })
 * ```
 *
 * Features:
 * - Request deduplication: Multiple simultaneous calls to the same endpoint return the same promise
 * - Response caching: Cache responses in memory or localStorage
 * - Automatic token refresh: Handles JWT token expiration
 * - Persistent cache: Use localStorage to persist cache across browser sessions
 *
 * Example with caching:
 * ```javascript
 * // Cache this request for 10 minutes (or configured TTL)
 * this.$store.$clients.api.get('users', { persist: true })
 *
 * // Force refresh, bypassing cache
 * this.$store.$clients.api.get('users', { params: { id: 1 }, force: true })
 * ```
 *
 * Example with request deduplication:
 * ```javascript
 * // Both calls will return the same promise if called simultaneously
 * const promise1 = this.$store.$clients.api.get('users')
 * const promise2 = this.$store.$clients.api.get('users')
 * // promise1 === promise2 (same reference)
 * ```
 */

import axios from 'axios'
import ClientCache from './cache.js'

/**
 * ApiClient - HTTP client with caching, deduplication and automatic token refresh
 */
class ApiClient {
  /**
   * Creates a new ApiClient instance
   * @param {Object} store - Vuex store instance
   * @param {string} baseURL - Base URL for API requests
   * @param {Object} options - Configuration options
   * @param {string} options.cacheStorage - Cache storage type: 'memory' or 'localStorage' (default: 'memory')
   * @param {string} options.cacheNamespace - Namespace for localStorage cache keys (default: 'api-cache')
   * @param {number} options.cacheTTL - Cache time-to-live in milliseconds (default: 10 minutes)
   */
  constructor(store, baseURL, options = {}) {
    this.axios = axios
    this.baseUrl = baseURL
    this.store = store
    this.loadingPromises = {}
    this.persistTimeout = options.cacheTTL || 1000 * 60 * 10 // 10 minutes in miliseconds
    this.disableTokenRefresh = options.disableTokenRefresh || false
    this.refreshingToken = false
    this.refreshTokenPromise = null
    this.commonHeaders = {}
    this.refreshTokenEndpoint = options.refreshTokenEndpoint || 'refresh_token'
    this.cacheActive = options.cacheActive || false

    // Initialize cache with specified storage type
    const cacheStorage = options.cacheStorage || 'memory'
    const cacheNamespace = options.cacheNamespace || 'api-cache'
    this.cache = new ClientCache(cacheStorage, cacheNamespace, this.persistTimeout)
  }

  /**
   * Adds common headers to the request
   * @param {Object} headers - The headers to add
   * @returns {void}
   */
  addCommonHeaders(headers) {
    this.commonHeaders = {
      ...this.commonHeaders,
      ...headers
    }
  }

  /**
   * Removes common headers from the request
   * @param {Object} headers - The headers to remove
   * @returns {void}
   */
  removeCommonHeaders() {
    this.commonHeaders = {}
  }

  /**
   * Checks cache and returns cached response if available
   * @param {string} cacheKey - The cache key
   * @param {Object} data - Request configuration
   * @param {boolean} download - Whether this is a download request
   * @returns {Promise<Object>|null} Cached response or null
   * @private
   */
  async _getCachedResponse(cacheKey, data, download) {
    if (this.cacheActive && data?.persist && !data?.force && !download) {
      const cachedData = await this.cache.get(cacheKey)
      if (cachedData) {
        // Wrap cached data in an Axios-like response object
        return {
          data: cachedData,
          status: 200,
          statusText: 'OK (from cache)',
          headers: {},
          config: {}
        }
      }
    }
    return null
  }

  /**
   * Handles request deduplication by returning existing promise or creating new one
   * @param {string} cacheKey - The cache key
   * @param {Function} requestFactory - Function that creates and executes the request
   * @returns {Promise<Object>} The request promise
   * @private
   */
  _getOrCreatePromise(cacheKey, requestFactory) {
    // Check if there's already a pending request (deduplication)
    if (this.loadingPromises[cacheKey]) {
      return this.loadingPromises[cacheKey]
    }

    // Create new promise
    const promise = requestFactory().finally(() => {
      // Remove the promise from loadingPromises once resolved/rejected
      delete this.loadingPromises[cacheKey]
    })

    // Store the promise for deduplication
    this.loadingPromises[cacheKey] = promise

    return promise
  }

  /**
   * Stores response in cache if persist is enabled
   * @param {string} cacheKey - The cache key
   * @param {Object} response - The response to cache
   * @param {Object} data - Request configuration
   * @param {boolean} download - Whether this is a download request
   * @returns {Promise<void>}
   * @private
   */
  async _cacheResponse(cacheKey, response, data, download) {
    if (this.cacheActive && data?.persist && !download) {
      await this.cache.set(cacheKey, response)
    }
  }

  /**
   * Refreshes the authentication token with deduplication
   * If a refresh is already in progress, returns the existing promise
   * @param {string} refresh_token - The refresh token
   * @returns {Promise<string>} The new token
   * @private
   */
  async _refreshToken(refresh_token) {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshingToken && this.refreshTokenPromise) {
      return this.refreshTokenPromise
    }

    // Mark that a refresh is in progress and create the promise
    this.refreshingToken = true
    this.refreshTokenPromise = this._performTokenRefresh(refresh_token)

    try {
      const result = await this.refreshTokenPromise
      return result
    } finally {
      // Clean up the state once the refresh is complete
      this.refreshingToken = false
      this.refreshTokenPromise = null
    }
  }

  /**
   * Performs the actual token refresh request
   * @param {string} refresh_token - The refresh token
   * @returns {Promise<string>} The new token
   * @private
   */
  async _performTokenRefresh(refresh_token) {
    const {
      data: { data: newTokens }
    } = await axios.post(`${this.baseUrl}${this.refreshTokenEndpoint}`, {
      refresh_token
    })

    this.store.commit('SET_TOKEN', newTokens.token)
    this.store.commit('SET_REFRESH_TOKEN', newTokens.refresh_token)

    return newTokens.token
  }

  /**
   * Verifies and refreshes the token if necessary
   * @returns {Promise<string|undefined>} The current or refreshed token
   * @private
   */
  async _verifyToken() {
    const token = this.store.getters.token
    const refresh_token = this.store.getters.refresh_token

    if (!token) return

    const now = Math.floor(Date.now() / 1000)
    const tokenExp = JSON.parse(atob(token.split('.')[1])).exp

    // If token is not about to expire, return it
    if (tokenExp - now > 15) {
      return token
    }

    // If token refresh is disabled, return null
    if (this.disableTokenRefresh) {
      return null
    }

    // If refresh token is not valid, return null
    if (!refresh_token) {
      return null
    }

    const refreshTokenExp = JSON.parse(atob(refresh_token.split('.')[1])).exp

    // If refresh token is expired, return null
    if (refreshTokenExp < now) {
      return null
    }

    // Refresh the token
    const newToken = await this._refreshToken(refresh_token)
    return newToken
  }

  /**
   * Performs a GET request with caching and deduplication
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request configuration
   * @param {Object} data.params - Query parameters
   * @param {Object} data.headers - Additional headers
   * @param {boolean} data.persist - Whether to cache the response (10 minutes by default)
   * @param {boolean} data.force - Force fetch, bypassing cache
   * @param {boolean} download - Whether this is a file download request
   * @returns {Promise<Object>} The response object or {data, filename} for downloads
   */
  async get(url, data, download = false) {
    const cacheKey = this.cache.generateKey(url, data?.params)

    // Check cache first
    const cached = await this._getCachedResponse(cacheKey, data, download)
    if (cached) {
      return cached
    }

    // Handle deduplication
    return this._getOrCreatePromise(cacheKey, async () => {
      try {
        const token = await this._verifyToken()

        const response = await axios.get(`${this.baseUrl}${url}`, {
          params: data?.params,
          headers: {
            ...data?.headers,
            ...this.commonHeaders,
            Authorization: `Bearer ${token}`
          },
          responseType: download ? 'blob' : 'json'
        })

        let result
        if (download) {
          let filename
          const contentDisposition = response.headers['content-disposition']

          if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '')
            }
          }

          result = { data: response.data, filename }
        } else {
          // Store only response.data in cache (not the full Axios response object)
          await this._cacheResponse(cacheKey, response.data, data, download)
          result = response
        }

        return result
      } catch (err) {
        let error = err

        if (download) {
          error = JSON.parse(await err?.response?.data?.text())
        }

        throw error
      }
    })
  }

  /**
   * Performs a GET request without authentication with caching and deduplication
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request configuration
   * @param {Object} data.params - Query parameters
   * @param {Object} data.headers - Additional headers
   * @param {boolean} data.persist - Whether to cache the response (10 minutes by default)
   * @param {boolean} data.force - Force fetch, bypassing cache
   * @param {boolean} download - Whether this is a file download request
   * @returns {Promise<Object>} The response object or {data, filename} for downloads
   */
  async getGuest(url, data, download = false) {
    const cacheKey = this.cache.generateKey(url, data?.params)

    // Check cache first
    const cached = await this._getCachedResponse(cacheKey, data, download)
    if (cached) {
      return cached
    }

    // Handle deduplication
    return this._getOrCreatePromise(cacheKey, async () => {
      try {
        const response = await axios.get(`${this.baseUrl}${url}`, {
          params: data?.params,
          headers: {
            ...data?.headers,
            ...this.commonHeaders
          },
          responseType: download ? 'blob' : 'json'
        })

        let result
        if (download) {
          let filename
          const contentDisposition = response.headers['content-disposition']

          if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '')
            }
          }

          result = { data: response.data, filename }
        } else {
          // Store only response.data in cache (not the full Axios response object)
          await this._cacheResponse(cacheKey, response.data, data, download)
          result = response
        }

        return result
      } catch (err) {
        let error = err

        if (download) {
          error = JSON.parse(await err?.response?.data?.text())
        }

        throw error
      }
    })
  }

  /**
   * Performs a POST request with authentication
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} opts - Request options
   * @param {Object} opts.headers - Additional headers
   * @param {boolean} download - Whether this is a file download request
   * @returns {Promise<Object>} The response object or {data, filename} for downloads
   */
  async post(url, data, opts, download = false) {
    const token = await this._verifyToken()

    return new Promise((resolve, reject) => {
      axios
        .post(`${this.baseUrl}${url}`, data, {
          headers: {
            ...opts?.headers,
            ...this.commonHeaders,
            Authorization: `Bearer ${token}`
          },
          responseType: download ? 'blob' : 'json'
        })
        .then((response) => {
          if (download) {
            let filename
            const contentDisposition = response.headers['content-disposition']

            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
              const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '')
              }
            }

            resolve({ data: response.data, filename })
          } else {
            resolve(response)
          }
        })
        .catch(async (err) => {
          let error = err

          if (download) {
            error = {
              name: 'AxiosError',
              response: {
                data: JSON.parse(await err?.response?.data?.text())
              }
            }
          }
          reject(error)
        })
    })
  }

  /**
   * Performs a POST request without authentication
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} opts - Request options
   * @param {Object} opts.headers - Additional headers
   * @param {boolean} download - Whether this is a file download request
   * @returns {Promise<Object>} The response object or {data, filename} for downloads
   */
  async postGuest(url, data, opts, download = false) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${this.baseUrl}${url}`, data, {
          headers: {
            ...opts?.headers,
            ...this.commonHeaders
          },
          responseType: download ? 'blob' : 'json'
        })
        .then((response) => {
          if (download) {
            let filename
            const contentDisposition = response.headers['content-disposition']

            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
              const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '')
              }
            }

            resolve({ data: response.data, filename })
          } else {
            resolve(response)
          }
        })
        .catch(async (err) => {
          let error = err

          if (download) {
            error = {
              name: 'AxiosError',
              response: {
                data: JSON.parse(await err?.response?.data?.text())
              }
            }
          }
          reject(error)
        })
    })
  }

  /**
   * Performs a PUT request with authentication
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} headers - Headers configuration
   * @param {Object} headers.headers - Additional headers
   * @returns {Promise<Object>} The response object
   */
  async put(url, data, headers = { headers: {} }) {
    const token = await this._verifyToken()

    return new Promise((resolve, reject) => {
      axios
        .put(`${this.baseUrl}${url}`, data, {
          headers: {
            ...headers.headers,
            ...this.commonHeaders,
            Authorization: `Bearer ${token}`
          }
        })
        .then((data) => {
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * Performs a PUT request without authentication
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} headers - Headers configuration
   * @param {Object} headers.headers - Additional headers
   * @returns {Promise<Object>} The response object
   */
  async putGuest(url, data, headers = { headers: {} }) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${this.baseUrl}${url}`, data, {
          headers: {
            ...headers.headers,
            ...this.commonHeaders
          }
        })
        .then((data) => {
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * Performs a DELETE request with authentication
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request configuration
   * @param {Object} data.params - Query parameters
   * @param {Object} data.headers - Additional headers
   * @returns {Promise<Object>} The response object
   */
  async delete(url, data) {
    const token = await this._verifyToken()

    return new Promise((resolve, reject) => {
      axios
        .delete(`${this.baseUrl}${url}`, {
          params: data?.params,
          headers: {
            ...data?.headers,
            ...this.commonHeaders,
            Authorization: `Bearer ${token}`
          }
        })
        .then((data) => {
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
}

/**
 * Vue plugin for API client integration
 * @example
 * import ApiClientPlugin from './utils/clients'
 * app.use(ApiClientPlugin)
 */
export default {
  /**
   * Installs the plugin and makes the API client available through $store.$clients
   * @param {Object} app - Vue app instance
   * @param {Object} options - Plugin options
   * @param {string} options.cacheStorage - Cache storage type: 'memory' or 'localStorage' (default: 'memory')
   * @param {string} options.cacheNamespace - Namespace for localStorage cache keys (default: 'api-cache')
   * @param {number} options.cacheTTL - Cache time-to-live in milliseconds (default: 10 minutes)
   */
  async install(app) {
    const store = app.config.globalProperties.$store
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const apiClient = new ApiClient(store, backendUrl, {
      cacheStorage: 'indexedDB',
      cacheNamespace: 'api-cache',
      cacheTTL: 1000 * 60 * 10, // 10 minutes
      disableTokenRefresh: false,
      cacheActive: !(import.meta.env.VITE_DEACTIVATE_CACHE === 'true') // Default is true
    })

    // Set on both app instance and store for consistent access
    app.config.globalProperties.$clients = {
      api: apiClient
    }

    // Also set on store directly to be accessible from store modules
    if (store && typeof store === 'object') {
      store.$clients = {
        api: apiClient
      }
    }

    if (import.meta.env.VITE_MODE === 'development') {
      window.clientApi = apiClient
      console.log('clientApi', window.clientApi)
    }
  }
}
