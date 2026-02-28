import axios from 'axios'

function parseUrl(url, params) {
  if (!params) {
    return url
  }

  const queryString = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  return `${url}?${queryString}`
}

class ApiClient {
  constructor(store, baseURL) {
    this.axios = axios
    this.baseUrl = baseURL
    this.store = store
    this.loadingUrls = {}
    this.loadedUrls = {}
    this.persistTimeout = 1000 * 60 * 10 // 10 minutes in miliseconds
    this.localStorageCacheTimeout = 1000 * 60 * 60 * 24 // 1 day in milliseconds
    this.cachePrefix = 'api_cache_'

    // Clear expired cache on initialization
    this._clearExpiredCache()
  }

  paramSanitizer(params) {
    if (!params) return null
    if (params instanceof FormData) {
      return params
    }

    return Object.keys(params).reduce((acc, key) => {
      if (![null, undefined, ''].includes(params[key])) {
        acc[key] = params[key]

        if (/^\d{2}-\d{2}-\d{4}$/.test(params[key])) {
          const [day, month, year] = params[key].split('-')
          acc[key] = `${year}-${month}-${day}`
        }
        if (/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(params[key])) {
          const [date, time] = params[key].split(' ')
          const [day, month, year] = date.split('-')
          acc[key] = `${year}-${month}-${day} ${time}`
        }
      }
      return acc
    }, {})
  }

  setUrlLoading(url, params, isLoading = true, persist = false) {
    const parsedUrl = parseUrl(url, params)

    if (isLoading) {
      this.loadingUrls[parsedUrl] = true
    } else if (this.loadingUrls[parsedUrl]) {
      this.loadingUrls[parsedUrl] = undefined

      if (persist) {
        this.loadedUrls[parsedUrl] = Date.now() + this.persistTimeout
      }
    }
  }

  isPersisted(parsedUrl) {
    if (!this.loadedUrls[parsedUrl]) return false

    if (this.loadedUrls[parsedUrl] < Date.now()) {
      this.loadedUrls[parsedUrl] = undefined
      return false
    }

    return true
  }

  // LocalStorage cache utilities
  _getCacheKey(url, params) {
    const parsedUrl = parseUrl(url, params)
    return `${this.cachePrefix}${btoa(parsedUrl)}`
  }

  _setLocalStorageCache(url, params, data) {
    try {
      const cacheKey = this._getCacheKey(url, params)
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiry: Date.now() + this.localStorageCacheTimeout
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  _getLocalStorageCache(url, params) {
    try {
      const cacheKey = this._getCacheKey(url, params)
      const cached = localStorage.getItem(cacheKey)

      if (!cached) return null

      const cacheData = JSON.parse(cached)

      // Check if cache has expired
      if (Date.now() > cacheData.expiry) {
        localStorage.removeItem(cacheKey)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  }

  _clearExpiredCache() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.cachePrefix)) {
          const cached = localStorage.getItem(key)
          if (cached) {
            const cacheData = JSON.parse(cached)
            if (Date.now() > cacheData.expiry) {
              localStorage.removeItem(key)
            }
          }
        }
      })
    } catch (error) {
      console.warn('Failed to clear expired cache:', error)
    }
  }

  // Public method to clear all cache
  clearAllCache() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.cachePrefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear all cache:', error)
    }
  }

  // To avoid multiple callings from diferent components at the same time
  // we set the fullUrl path in a hashmap and then we check wether is there or not
  // If persist is true, once its finished, the fullUrl cannot be called again for 10min
  canFetch(url, params, force = false) {
    const parsedUrl = parseUrl(url, params)
    const isLoading = this.loadingUrls[parsedUrl]

    return force || (!this.isPersisted(parsedUrl) && !isLoading)
  }

  async _verifyToken() {
    const token = this.store.getters.token
    const refresh_token = this.store.getters.refresh_token

    if (!token || !refresh_token) return

    const tokenExp = JSON.parse(atob(token.split('.')[1])).exp
    const refreshTokenExp = JSON.parse(atob(refresh_token.split('.')[1])).exp
    const now = Math.floor(Date.now() / 1000)

    // If token is about to expire and refresh token is valid
    // We use 15seconds because JWT is expiring
    // the token 10seconds before real expiration date
    if (tokenExp - now <= 15 && refreshTokenExp > now) {
      const {
        data: { data: newTokens }
      } = await axios.post(`${this.baseUrl}refresh_token`, {
        refresh_token
      })

      this.store.commit('SET_TOKEN', newTokens.token)
      this.store.commit('SET_REFRESH_TOKEN', newTokens.refresh_token)

      return newTokens.token
    }

    return token
  }

  async get(url, data, download = false) {
    const sanitizedParams = this.paramSanitizer(data?.params)
    const useCache = data?.useCache === true
    const force = data?.force === true

    // Check localStorage cache first if enabled and not forced
    if (useCache && !download && !force) {
      const cachedData = this._getLocalStorageCache(url, sanitizedParams)
      if (cachedData) {
        return Promise.resolve(cachedData)
      }
    }

    this.setUrlLoading(url, sanitizedParams, true, data?.persist)

    const token = await this._verifyToken()

    return new Promise((resolve, reject) => {
      axios
        .get(`${this.baseUrl}${url}`, {
          params: sanitizedParams,
          headers: {
            ...data?.headers,
            Authorization: `Bearer ${token}`
          },
          responseType: download ? 'blob' : 'json'
        })
        .then((response) => {
          // Save to localStorage cache if enabled and not a download
          if (useCache && !download) {
            this._setLocalStorageCache(url, sanitizedParams, response)
          }

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
            const text = await err?.response?.data?.text()
            error = {
              name: 'AxiosError',
              response: {
                data: JSON.parse(text)
              }
            }
          }
          reject(error)
        })
    })
  }

  async getGuest(url, data, download = false) {
    const sanitizedParams = this.paramSanitizer(data?.params)
    const useCache = data?.useCache === true
    const force = data?.force === true

    // Check localStorage cache first if enabled and not forced
    if (useCache && !download && !force) {
      const cachedData = this._getLocalStorageCache(url, sanitizedParams)
      if (cachedData) {
        return Promise.resolve(cachedData)
      }
    }

    this.setUrlLoading(url, sanitizedParams, true, data?.persist)

    return new Promise((resolve, reject) => {
      axios
        .get(`${this.baseUrl}${url}`, {
          params: sanitizedParams,
          responseType: download ? 'blob' : 'json'
        })
        .then((response) => {
          // Save to localStorage cache if enabled and not a download
          if (useCache && !download) {
            this._setLocalStorageCache(url, sanitizedParams, response)
          }

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
            error = JSON.parse(await err?.response?.data?.text())
          }
          reject(error)
        })
    })
  }

  async post(url, data, opts, download = false) {
    const sanitizedData = this.paramSanitizer(data)
    const token = await this._verifyToken()

    return new Promise((resolve, reject) => {
      axios
        .post(`${this.baseUrl}${url}`, sanitizedData, {
          headers: {
            ...opts?.headers,
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

  async postGuest(url, data, opts, download = false) {
    const sanitizedData = this.paramSanitizer(data)

    return new Promise((resolve, reject) => {
      axios
        .post(`${this.baseUrl}${url}`, sanitizedData, {
          headers: {
            ...opts?.headers
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

  async put(url, data, headers = { headers: {} }) {
    const sanitizedData = this.paramSanitizer(data)
    const token = await this._verifyToken()

    return new Promise((resolve, reject) => {
      axios
        .put(`${this.baseUrl}${url}`, sanitizedData, {
          headers: {
            ...headers.headers,
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

  async putGuest(url, data, headers = { headers: {} }) {
    const sanitizedData = this.paramSanitizer(data)

    return new Promise((resolve, reject) => {
      axios
        .put(`${this.baseUrl}${url}`, sanitizedData, {
          headers: {
            ...headers.headers
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

  async delete(url, data) {
    const sanitizedParams = this.paramSanitizer(data?.params)
    const token = await this._verifyToken()

    return new Promise((resolve, reject) => {
      axios
        .delete(`${this.baseUrl}${url}`, {
          params: sanitizedParams,
          headers: {
            ...data?.headers,
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

export default {
  install(app) {
    const store = app.config.globalProperties.$store

    // Create API client instance
    const clients = {
      api: new ApiClient(store, import.meta.env.VITE_BACKEND_URL)
    }

    // Set on both app instance and store for consistent access
    app.config.globalProperties.$clients = clients

    // Also set on store directly to be accessible from store modules
    if (store && typeof store === 'object') {
      store.$clients = clients
    }
  }
}
