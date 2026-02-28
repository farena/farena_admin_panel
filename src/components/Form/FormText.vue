<template>
  <div
    class="form-container"
    :class="{
      disabled,
      'form-textarea': textarea,
      'flex-field': flexField,
      'input-error': errors?.length
    }"
  >
    <label :for="itemId" v-if="label">
      {{ label }} <small v-if="description" class="text-muted">{{ description }}</small>
    </label>
    <div class="form-wrapper">
      <div class="icon" v-if="icon">
        <i :class="icon"></i>
      </div>
      <input
        :id="itemId"
        v-model="result"
        :type="password ? 'password' : 'text'"
        @input="updateValue"
        @keydown.enter="$emit('keydownEnter', $event)"
        @click="$emit('click', $event)"
        v-if="!textarea"
        autocomplete="new-formtext"
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <textarea
        :placeholder="placeholder || ' '"
        :rows="textareaRows"
        :id="itemId"
        v-model="result"
        :readonly="disabled"
        v-else
      />

      <slot />
    </div>
    <p
      v-if="maxChars"
      style="margin: 0.25em 0 0 0; text-align: right; font-size: 0.7em"
      :class="{ 'text-danger': (modelValue ? modelValue.length : 0) > maxChars }"
    >
      {{ maxChars - (modelValue ? modelValue.length : 0) }}/{{ maxChars }} characters
    </p>
    <p v-if="errors?.length" class="error-message">
      {{ errors.join(', ') }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: null
    },
    label: String,
    placeholder: String,
    description: String,
    icon: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    password: {
      type: Boolean,
      default: false
    },
    textarea: {
      type: Boolean,
      default: false
    },
    textareaRows: {
      type: Number,
      default: 5
    },
    maxChars: {
      type: [Number, String],
      default: null
    },
    flexField: {
      type: Boolean,
      default: false
    },
    isPhone: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Array,
      default: null
    }
  },
  data: () => ({
    itemId: null
  }),
  computed: {
    result: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
        this.$emit('change', value)
      }
    }
  },
  mounted() {
    this.fillId()
  },
  methods: {
    focus() {
      document.getElementById(this.itemId).focus()
    },
    fillId() {
      this.itemId = Math.floor(Math.random() * Date.now())
    },
    updateValue({ target: { value } }) {
      if (this.isPhone) {
        this.result = this.phoneFormatter(value)
      } else if (this.maxChars && value.length > this.maxChars) {
        this.result = value.slice(0, this.maxChars)
      } else {
        this.result = value
      }
    },
    phoneFormatter(value) {
      // Allow spaces but remove other non-digit characters
      let cleaned = value
        .replace(/[^\d\s+]/g, '') // Removes any non-numeric character except spaces and the plus sign
        .replace(/\s+/g, ' ') // Replaces multiple spaces with a single space
        .replace(/\++/g, '+') // Replaces multiple '+' signs with one

      // Ensure the '+' is only at the start
      if (cleaned.charAt(0) !== '+') {
        // If '+' is not at the start, add it
        cleaned = '+' + cleaned.replace(/\+/g, '') // Remove any '+' signs that are not at the start
      } else {
        // If there's a '+' at the start, remove any subsequent '+' signs
        cleaned = '+' + cleaned.slice(1).replace(/\+/g, '')
      }

      return cleaned.length > 0 ? cleaned : null
    }
  }
}
</script>

<style></style>
