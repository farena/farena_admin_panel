export function humanReadableSize(bytes) {
  if (!bytes) return '0 Byte'

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

/**
 * Convert cents to dollars
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
export function centsToDollars(cents) {
  if (cents == null) return 0

  const val = typeof cents === 'number' ? cents : parseInt(cents)
  return val / 100
}

/**
 * Convert dollars to cents
 * @param {number} dollars - Amount in dollars
 * @returns {number} Amount in cents
 */
export function dollarsToCents(dollars) {
  if (dollars == null) return 0

  const val = typeof dollars === 'number' ? dollars : parseInt(dollars)
  return Math.floor(val * 100)
}

/**
 * Format money value for display (always 2 decimal places)
 * @param {number} value - Amount in dollars (e.g. 99.5)
 * @returns {string} Formatted money string (e.g. "1,234.50")
 */
export function formatToMoney(value) {
  if (value == null || isNaN(value)) return '0.00'

  let formatted = Number(value).toFixed(2)
  formatted = formatted.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  return formatted
}

/**
 * Format cents to money string
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted money string
 */
export function formatCentsToMoney(cents) {
  return formatToMoney(centsToDollars(cents))
}

export function textToHtml(text) {
  // Replace line breaks with <br> tags
  let htmlText = text.replace(/\r?\n/g, '<br>')

  // Replace multiple spaces with &nbsp; to preserve them in HTML
  htmlText = htmlText.replace(/ {2,}/g, (match) => '&nbsp;'.repeat(match.length))

  return htmlText
}
