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
  List,
  Image,
  Heading,
  HeadingButtonsUI,
  ParagraphButtonUI
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
    },
    height: {
      type: [Number, String],
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
          List,
          Image,
          Heading,
          HeadingButtonsUI,
          ParagraphButtonUI
        ],
        toolbar: [
          'undo',
          'redo',
          '|',
          'alignment',
          '|',
          'heading',
          '|',
          'bold',
          'italic',
          '|',
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
        heading: {
          options: [
            { model: 'paragraph', title: 'Parrafo', class: 'ck-heading_paragraph' },
            { model: 'heading2', view: 'h2', title: 'Encabezado 1', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Encabezado 2', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Encabezado 3', class: 'ck-heading_heading4' }
          ]
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
      this.editorRef.focus()
    }
  }
}
</script>

<style></style>
