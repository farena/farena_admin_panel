<template>
  <div
    class="form-container form-select"
    :class="{
      disabled,
      'flex-field': flexField,
      'form-select-multiple': multiple,
      'input-error': errors?.length
    }"
  >
    <label :for="itemId" v-if="label" @click="onClickLabel">
      {{ label }}
      <span class="fw-bold text-danger" v-if="asterisk">*</span>
    </label>

    <div class="form-wrapper" v-if="!multiple">
      <i class="icon" :class="icon" v-if="icon && !iconMaterial"></i>
      <i class="icon material-symbols-outlined" v-else-if="icon && iconMaterial">{{ icon }}</i>
      <select :id="itemId" v-model="result" :disabled="disabled">
        <option
          :value="opt[this.optionValue] !== undefined ? opt[this.optionValue] : opt"
          v-for="opt in options"
          :key="opt[this.optionValue] !== undefined ? opt[this.optionValue] : opt"
        >
          {{ opt[this.optionLabel] || opt }}
        </option>
      </select>

      <slot />
    </div>

    <FormDropdown v-else :parentEl="`#form_wrapper_${itemId}`">
      <template #action="{ open, close }">
        <div class="form-wrapper" ref="form_wrapper" :id="`form_wrapper_${itemId}`">
          <div class="icon" v-if="icon">
            <i class="material-symbols-outlined" v-if="iconMaterial">{{ icon }}</i>
            <i :class="icon" v-else></i>
          </div>

          <div
            :id="itemId"
            class="select-result"
            tabindex="0"
            @focus="openDropdown(open)"
            @click="openDropdown(open)"
            @keydown.up.prevent="onArrowUp"
            @keydown.down.prevent="onArrowDown"
            @keydown.enter="onEnter(open, close)"
            :disabled="disabled"
          >
            <div
              class="select-result-item"
              v-for="(opt, ix) of result"
              :key="opt[this.optionValue] || opt"
            >
              {{ opt[this.optionLabel] || opt }}
              <i class="fa fa-times" @click.stop="removeOption(ix)"></i>
            </div>
          </div>

          <slot />
        </div>
      </template>

      <template #default="{ close }">
        <ul ref="dropdown">
          <li
            v-for="(opt, index) in options"
            :key="opt.value || opt"
            :class="{ highlighted: index === highlightedIndex }"
            @mousedown.prevent="selectOption(opt, close)"
            ref="options"
          >
            {{ opt[this.optionLabel] || opt.name || opt }}
          </li>
          <li v-if="!options.length">{{ noDataMsg }}</li>
        </ul>
      </template>
    </FormDropdown>

    <p v-if="errors?.length" class="error-message">
      {{ errors.join(', ') }}
    </p>
  </div>
</template>

<script>
import FormDropdown from './FormDropdown.vue'

export default {
  props: {
    modelValue: {
      type: [Number, String, Array, Object, Boolean],
      default: null
    },
    label: {
      type: String,
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    icon: {
      type: String,
      default: null
    },
    iconMaterial: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    flexField: {
      type: Boolean,
      default: false
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionValue: {
      type: String,
      default: 'value'
    },
    noDataMsg: {
      type: String,
      default: 'No entries were found'
    },
    errors: {
      type: Array,
      default: null
    },
    asterisk: {
      type: Boolean,
      default: false
    }
  },
  emits: ['onSelect', 'update:modelValue', 'onSelect', 'onRemove'],
  components: {
    FormDropdown
  },
  data: () => ({
    itemId: null,
    dropdownOpen: false,
    highlightedIndex: -1
  }),
  computed: {
    result: {
      get() {
        return this.modelValue
      },
      set(value) {
        if (value !== '') {
          this.$emit('update:modelValue', value)
          this.$emit(
            'onSelect',
            this.options.find((x) => {
              if (x[this.optionValue]) {
                return x[this.optionValue] === value
              }
              return x === value
            })
          )
        } else {
          this.$emit('update:modelValue', null)
          this.$emit('onSelect', null)
        }
      }
    }
  },
  mounted() {
    this.fillId()
  },
  methods: {
    fillId() {
      this.itemId = Math.floor(Math.random() * Date.now())
    },

    onClickLabel() {
      document.getElementById(this.itemId).focus()
    },
    openDropdown(openEvt) {
      openEvt()
      this.dropdownOpen = true
    },
    closeDropdown(closeEvt) {
      setTimeout(() => {
        closeEvt()
        this.dropdownOpen = false
        this.highlightedIndex = -1
      }, 100) // Small delay to allow click event to register
    },
    selectOption(option, closeEvt) {
      const resIds = this.result.map((x) => x[this.optionValue])

      if (!resIds.includes(option[this.optionValue])) {
        this.result.push(option)
      }

      this.$emit('onSelect', option)
      this.closeDropdown(closeEvt)
    },
    removeOption(index) {
      const option = this.result[index]
      this.result.splice(index, 1)
      this.$emit('onRemove', option)
    },

    // Keyboard events
    onArrowDown() {
      if (!this.dropdownOpen) return

      if (this.highlightedIndex < this.options.length - 1) {
        this.highlightedIndex++
      } else {
        this.highlightedIndex = 0
      }
      this.scrollIntoView()
    },
    onArrowUp() {
      if (!this.dropdownOpen) return

      if (this.highlightedIndex > 0) {
        this.highlightedIndex--
      } else {
        this.highlightedIndex = this.options.length - 1
      }
      this.scrollIntoView()
    },
    onEnter(openEvt, closeEvt) {
      if (!this.dropdownOpen) {
        this.openDropdown(openEvt)
        return
      }

      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.options.length) {
        this.selectOption(this.options[this.highlightedIndex], closeEvt)
      } else {
        this.closeDropdown(closeEvt)
      }
    },
    scrollIntoView() {
      this.$nextTick(() => {
        const options = this.$refs.options
        const highlightedOption = options[this.highlightedIndex]

        if (highlightedOption) {
          const dropdown = this.$refs.dropdown
          const optionTop = highlightedOption.offsetTop
          const optionBottom = optionTop + highlightedOption.offsetHeight
          const dropdownScrollTop = dropdown.scrollTop
          const dropdownHeight = dropdown.offsetHeight

          if (optionTop < dropdownScrollTop) {
            dropdown.scrollTop = optionTop
          } else if (optionBottom > dropdownScrollTop + dropdownHeight) {
            dropdown.scrollTop = optionBottom - dropdownHeight
          }
        }
      })
    }
  }
}
</script>

<style></style>
