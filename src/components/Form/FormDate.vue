<template>
  <v-date-picker
    v-model="date"
    :mode="dateTime ? 'dateTime' : 'date'"
    :is24hr="dateTime"
    :masks="masksValues"
    :popover="{ visibility: disabled ? 'hidden' : 'focus' }"
    :disabled-dates="disabledDates"
    :max-date="maxDate"
    :min-date="minDate"
  >
    <template v-slot="{ inputValue, inputEvents }">
      <div class="form-container" :class="{ disabled, 'flex-field': flexField, 'input-error': errors?.length }" v-bind="$attrs">
        <label v-if="label">{{ label }}</label>
        <div class="form-wrapper">
          <div class="icon" v-if="!flexField">
            <i class="fa-solid fa-calendar-day"></i>
          </div>
          <input :value="inputValue" v-on="inputEvents" />
        </div>
        <p v-if="errors?.length" class="error-message">
          {{ errors.join(', ') }}
        </p>
      </div>
    </template>
  </v-date-picker>
</template>

<script>
import { parseToDate, parseToString } from '@/utils/date.js'
import moment from 'moment'

export default {
  props: {
    modelValue: {
      type: [moment, String],
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    dateTime: {
      type: Boolean,
      default: false
    },
    disabledDates: {
      type: Object,
      default: null
      // Example:
      // To Disabled Weekends: :disabled-dates='{ weekdays: [1, 7] }'
      // More info: https://vcalendar.io/disable-dates.html
    },
    maxDate: {
      type: Date,
      default: null
    },
    minDate: {
      type: Date,
      default: null
    },
    flexField: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Array,
      default: null
    }
  },
  data: () => ({
    date: null
  }),
  computed: {
    masksValues() {
      return {
        inputDateTime24hr: 'DD-MM-YYYY H:mm',
        input: 'DD-MM-YYYY'
      }
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        this.date = parseToDate(val, this.dateTime)
      }
    },
    date: {
      immediate: true,
      handler(value) {
        if (!value) {
          this.$emit('update:modelValue', null)
          this.$emit('change', null)
        } else {
          const newEmitting = parseToString(value, this.dateTime)

          const CHANGED = newEmitting && newEmitting !== this.modelValue

          if (CHANGED) {
            this.$emit('update:modelValue', newEmitting)
            this.$emit('change', newEmitting)
          }
        }
      }
    }
  }
}
</script>

<style></style>
