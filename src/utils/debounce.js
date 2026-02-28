export default function debounce(callback, delay = 250, startedCallback, finalCallback) {
  let timeout

  return (...args) => {
    clearTimeout(timeout)
    if (startedCallback) startedCallback()

    timeout = setTimeout(() => {
      if (callback.finally === 'function') {
        callback(...args).finally(finalCallback)
      } else {
        callback(...args)
        if (finalCallback) finalCallback()
      }
    }, delay)
  }
}
