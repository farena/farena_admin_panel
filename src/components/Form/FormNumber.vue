<template>
  <div
    class="form-container"
    :class="{
      disabled,
      'flex-field': flexField,
      'show-arrows': showArrows,
      'input-error': errors?.length
    }"
  >
    <label :for="itemId" v-if="label">
      {{ label }} <small v-if="description">{{ description }}</small>
    </label>
    <div class="form-wrapper">
      <slot name="icon">
        <div class="icon" v-if="icon">
          <i :class="icon"></i>
        </div>
      </slot>
      <input
        :type="inputType"
        placeholder=" "
        :id="itemId"
        v-model="result"
        :disabled="disabled"
        @focus="onFocus"
        @blur="onBlur"
        @change="$emit('onChange', $event.target.value)"
        @input="onInput"
        :step="step"
        :min="min"
        :max="max"
      />
      <slot />
    </div>
    <p v-if="errors?.length" class="error-message">
      {{ errors.join(', ') }}
    </p>
  </div>
</template>

<script>
import { formatToMoney, centsToDollars, dollarsToCents } from '@/utils/string'

export default {
  props: {
    modelValue: {
      type: [Number, String],
      default: null
    },
    label: String,
    description: String,
    icon: {
      type: [String, Object],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    flexField: {
      type: Boolean,
      default: false
    },
    selectOnFocus: Boolean,
    moneyFormat: Boolean,
    max: Number,
    min: Number,
    step: Number,
    showArrows: Boolean,
    errors: {
      type: Array,
      default: null
    }
  },
  data: () => ({
    itemId: null,
    inputType: 'number',
    result: null
  }),
  mounted() {
    this.fillId()
  },
  watch: {
    moneyFormat(val) {
      if (val) {
        this.inputType = 'text'

        this.$nextTick(() => {
          // Convert cents to dollars for display
          const dollars = centsToDollars(this.modelValue)
          this.result = formatToMoney(dollars)
        })
      }
    },
    modelValue: {
      immediate: true,
      handler(val) {
        if (val === null || val === undefined) return

        let aux = this.modelValue

        if (this.moneyFormat) {
          this.inputType = 'text'
          // Convert cents to dollars for display
          const dollars = centsToDollars(this.modelValue)
          aux = formatToMoney(dollars)
        }

        this.$nextTick(() => {
          this.result = aux
        })
      }
    }
  },
  methods: {
    updateResult() {
      this.result = this.modelValue
    },
    fillId() {
      this.itemId = Math.floor(Math.random() * Date.now())
    },
    onFocus(e) {
      if (this.moneyFormat) {
        // Show dollars (converted from cents) when focused
        this.inputType = 'number'
        const dollars = centsToDollars(this.modelValue)
        this.result = dollars
      }

      this.$nextTick(() => {
        if (this.selectOnFocus) e.target.select()
      })
    },
    onBlur(e) {
      let aux = parseFloat(parseFloat(e.target.value || 0).toFixed(2))

      if (this.max !== undefined && aux > this.max) {
        aux = this.max
      }
      if (this.min !== undefined && aux < this.min) {
        aux = this.min
      }

      // If moneyFormat is true, convert dollars to cents before emitting
      const valueToEmit = this.moneyFormat ? dollarsToCents(aux) : aux
      this.$emit('update:modelValue', valueToEmit)

      if (this.moneyFormat) {
        this.inputType = 'text'
        this.$nextTick(() => {
          // Display in dollars (aux is already in dollars)
          this.result = formatToMoney(aux)
        })
      }
    },
    onInput({ target: { value } }) {
      if (this.showArrows) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style></style>
