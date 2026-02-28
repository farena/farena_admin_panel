<template>
  <div class="form-container form-html" :class="{ disabled, 'input-error': errors?.length }">
    <label v-if="label">
      {{ label }}
      <small class="text-muted"> Usa ctrl+enter para crear saltos de línea pequeños </small>
    </label>
    <div class="form-wrapper">
      <ckeditor
        :editor="editor"
        v-model="result"
        :config="editorConfig"
        @ready="editorRef = $event"
      ></ckeditor>
    </div>
    <p v-if="errors?.length" class="error-message">
      {{ errors.join(', ') }}
    </p>
  </div>
</template>

<script>
import {
  ClassicEditor,
  Table,
  TableToolbar,
  Bold,
  Essentials,
  Italic,
  Alignment,
  Paragraph,
  Mention,
  Undo,
  FontFamily,
  FontSize,
  FontColor,
  AutoLink,
  Link,
  List
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import ckeditor from '@/plugins/CKeditor'

export default {
  components: {
    ckeditor
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
    errors: {
      type: Array,
      default: null
    }
  },
  data: () => ({
    editor: ClassicEditor,
    editorRef: null
  }),
  computed: {
    editorConfig() {
      return {
        plugins: [
          Bold,
          Essentials,
          Italic,
          Alignment,
          Paragraph,
          Undo,
          FontFamily,
          FontSize,
          Mention,
          FontColor,
          Table,
          TableToolbar,
          AutoLink,
          Link,
          List
        ],
        toolbar: [
          'undo',
          'redo',
          '|',
          'alignment',
          '|',
          'bold',
          'italic',
          'fontfamily',
          'fontsize',
          'fontColor',
          '|',
          'insertTable',
          '|',
          'link',
          '|',
          'numberedList',
          'bulletedList'
        ],
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'http://',
          toolbar: ['editLink', 'linkProperties', 'unlink']
        },
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        },
        mention: !this.autocompleteOpts
          ? {}
          : {
              feeds: [
                {
                  marker: '#',
                  feed: this.autocompleteOpts.filter((x) => x.startsWith('#')),
                  minimumCharacters: 0,
                  dropdownLimit: 100
                }
              ]
            },
        placeholder: this.placeholder || {}
      }
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
      this.editorRef.focus()
    }
  }
}
</script>

<style></style>
