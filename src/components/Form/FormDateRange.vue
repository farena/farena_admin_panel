<template>
  <v-date-picker
    v-model.range="date"
    :mode="dateTime ? 'dateTime' : 'date'"
    :is24hr="dateTime"
    :masks="masksValues"
    :popover="{ visibility: disabled ? 'hidden' : 'focus' }"
    :disabled-dates="disabledDates"
    ref="popover"
  >
    <template v-slot="{ inputValue, inputEvents }">
      <div
        class="form-container form-date"
        :class="{ disabled, 'flex-field': flexField, 'input-error': errors?.length }"
        v-bind="$attrs"
      >
        <label v-if="label">{{ label }}</label>

        <div class="d-grid grid-2-cols gap-2">
          <div class="form-wrapper">
            <div class="icon" v-if="!flexField">
              <i class="fa-solid fa-calendar-day"></i>
            </div>
            <input :value="inputValue.start" v-on="inputEvents.start" />
          </div>
          <div class="form-wrapper">
            <div class="icon" v-if="!flexField">
              <i class="fa-solid fa-calendar-day"></i>
            </div>
            <input :value="inputValue.end" v-on="inputEvents.end" />
          </div>
        </div>
        <p v-if="errors?.length" class="error-message">
          {{ errors.join(', ') }}
        </p>
      </div>
    </template>

    <template #footer v-if="customRanges.length">
      <div class="form-date-ranges">
        <FormButton
          theme="dark"
          outlined
          v-for="(r, ri) of customRanges"
          :key="ri"
          @click="applyCustomRange(r)"
        >
          {{ r.label }}
        </FormButton>
      </div>
    </template>
  </v-date-picker>
</template>

<script>
import moment from 'moment'
import { parseToDate, parseToString } from '@/utils/date.js'
import FormButton from './FormButton.vue'

export default {
  components: {
    FormButton
  },
  props: {
    modelValue: {
      type: [Object],
      default: null
    },
    label: String,
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
    flexField: {
      type: Boolean,
      default: false
    },
    customRanges: {
      type: Array,
      default: () => []
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
    },
    isDesktop() {
      return window.innerWidth > 768
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.date = {
            start: null,
            end: null
          }
          return
        }

        this.date = {
          start: parseToDate(val.start, this.dateTime),
          end: parseToDate(val.end, this.dateTime)
        }
      }
    },
    date: {
      immediate: true,
      handler(value) {
        if (!value) {
          this.$emit('update:modelValue', { start: null, end: null })
          this.$emit('change', { start: null, end: null })
        } else {
          const { start, end } = value
          const newEmitting = {
            start: parseToString(start, this.dateTime),
            end: parseToString(end, this.dateTime)
          }

          const START_CHANGED = newEmitting.start && newEmitting.start !== this.modelValue?.start
          const END_CHANGED = newEmitting.end && newEmitting.end !== this.modelValue?.end

          if (START_CHANGED || END_CHANGED) {
            this.$emit('update:modelValue', newEmitting)
            this.$emit('change', newEmitting)
          }
        }
      }
    }
  },
  methods: {
    applyCustomRange(range) {
      const { unit, qty } = range

      if (!unit || !qty) {
        this.$toast.error('Invalid range')
        return
      }

      let newEmitting = {
        start: null,
        end: null
      }

      if (this.date.start) {
        const { start } = this.date
        newEmitting.start = parseToString(start, this.dateTime)
        newEmitting.end = parseToString(moment(start).add(qty, unit), this.dateTime)
      } else {
        const start = moment()
        newEmitting.start = parseToString(start, this.dateTime)
        newEmitting.end = parseToString(moment(start).add(qty, unit), this.dateTime)
      }

      this.$emit('update:modelValue', newEmitting)
      this.$emit('change', newEmitting)
      this.$refs.popover.togglePopover()
    }
  }
}
</script>

<style></style>
