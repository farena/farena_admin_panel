<template>
  <div
    class="form-container form-html"
    :class="{ disabled, 'input-error': errors?.length }"
    :style="customStyle"
  >
    <label v-if="label">
      {{ label }}
      <small class="text-muted"> Usa ctrl+enter para crear saltos de línea pequeños </small>
    </label>
    <div class="form-wrapper">
      <FaEditor
        ref="editor"
        v-model="result"
        :lang="lang"
        :disabled="disabled"
        :placeholder="placeholder"
        :autocompleteOpts="autocompleteOpts"
      />
    </div>
    <p v-if="errors?.length" class="error-message">
      {{ errors.join(', ') }}
    </p>
  </div>
</template>

<script>
import { FaEditor } from '@farena/fa-editor'

export default {
  components: {
    FaEditor
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: String,
    disabled: {
      type: Boolean,
      default: false
    },
    autocompleteOpts: Array,
    placeholder: String,
    // El editor viene en ingles por defecto; la app es en castellano.
    lang: {
      type: String,
      default: 'es'
    },
    errors: {
      type: Array,
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    }
  },
  computed: {
    customStyle() {
      if (this.height) {
        if (typeof this.height === 'string') {
          return `--editor-height: ${this.height}`
        }

        return `--editor-height: ${this.height}px`
      }

      return {}
    },
    result: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  methods: {
    focus() {
      this.$refs.editor.focus()
    }
  }
}
</script>

<style></style>
