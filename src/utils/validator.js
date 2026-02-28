import moment from 'moment'
import Validator from 'validatorjs'

const isValidDate = (date) => typeof date === 'string' || moment(date).isValid()

Validator.register(
  'after_or_equal',
  (date, params) => {
    const val1 = date
    const val2 = params.split(',')[0]

    if (!isValidDate(val1) || !isValidDate(val2)) return false

    const inputDate = moment(val1)
    const afterDate = moment(val2)

    return inputDate.isSameOrAfter(afterDate)
  },
  'The :attribute must be equal or after :after_or_equal.'
)

Validator.register(
  'before_or_equal',
  (date, params) => {
    const val1 = date
    const val2 = params.split(',')[0]

    if (!isValidDate(val1) || !isValidDate(val2)) return false

    const inputDate = moment(val1)
    const beforeDate = moment(val2)

    return inputDate.isSameOrBefore(beforeDate)
  },
  'The :attribute must be equal or before :before_or_equal.'
)

Validator.register(
  'after',
  (date, params) => {
    const val1 = date
    const val2 = params.split(',')[0]

    if (!isValidDate(val1) || !isValidDate(val2)) return false

    const inputDate = moment(val1)
    const afterDate = moment(val2)

    return inputDate.isAfter(afterDate)
  },
  'The :attribute must be after :after.'
)

Validator.register(
  'before',
  (date, params) => {
    const val1 = date
    const val2 = params.split(',')[0]

    if (!isValidDate(val1) || !isValidDate(val2)) return false

    const inputDate = moment(val1)
    const beforeDate = moment(val2)

    return inputDate.isBefore(beforeDate)
  },
  'The :attribute must be before :before.'
)

Validator.register(
  'date',
  (date) => {
    const val1 = date

    if (!isValidDate(val1)) return false

    return true
  },
  'The :attribute must be a valid date.'
)

export default {
  install: async (app) => {
    const { $toast } = app.config.globalProperties

    function Validate(data, rules, messages, options = { boolean: true }) {
      const validation = new Validator(data, rules, messages)

      if (!options.boolean) {
        return !validation.fails() ? null : validation.errors.all()
      }

      if (!validation.fails()) return true

      Object.values(validation.errors.all()).forEach((errors) => {
        errors.forEach((error) => {
          $toast.error(error)
        })
      })

      return false
    }

    app.config.globalProperties.$validate = Validate
  }
}
