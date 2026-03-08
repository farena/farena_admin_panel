<template>
  <div :class="{ disabled }">
    <slot :launchPicker="launchFilePicker">
      <div
        class="form-container form-uploader"
        :class="{ 'flex-field': flexField, 'input-error': errors?.length }"
        v-bind="$attrs"
      >
        <label v-if="label">{{ label }}</label>

        <div class="form-wrapper">
          <div class="d-flex gap-2">
            <slot name="current" />
            <FormButton theme="primary" small block @click="launchFilePicker">
              {{ buttonText }}
            </FormButton>
          </div>

          <div>
            <small v-if="file">
              {{ file.name }} ({{ (file.size / 1024).toFixed(2) }}kb)
              <i class="fa fa-times ml-2 pointer" @click="resetInput"></i>
            </small>
          </div>
        </div>
        <p v-if="errors?.length" class="error-message">
          {{ errors.join(', ') }}
        </p>
      </div>
    </slot>
    <input type="file" @change="fileSelected" ref="fileInput" :multiple="multiple" />
  </div>
</template>

<script>
import FormButton from './FormButton.vue'

export default {
  emtis: ['onChange', 'onReset'],
  components: {
    FormButton
  },
  props: {
    modelValue: {
      type: [Object, File, String],
      default: () => ({})
    },
    label: {
      type: String
    },
    buttonText: {
      type: String,
      default: 'Upload File'
    },
    maxSizeMB: {
      type: Number,
      default() {
        return 2 // 2 MB
      }
    },
    pdfType: {
      type: Boolean,
      default: false
    },
    imageType: {
      type: Boolean,
      default: false
    },
    videoType: {
      type: Boolean,
      default: false
    },
    xlsType: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    flexField: {
      type: Boolean,
      default: false
    },
    resetOnSelect: {
      type: Boolean,
      default: false
    },
    tooBigErrorMsg: {
      type: String,
      default: 'The file must be less than {maxSize}MB'
    },
    multiple: Boolean,
    errors: {
      type: Array,
      default: null
    }
  },
  data: () => ({
    file: null
  }),
  computed: {
    tooBigMsg() {
      if (this.tooBigErrorMsg.includes('{maxSize}')) {
        return this.tooBigErrorMsg.replace('{maxSize}', this.maxSizeMB.toFixed(2))
      }
      return this.tooBigErrorMsg
    },
    acceptedTypes() {
      if (!this.imageType && !this.pdfType && !this.videoType && !this.xlsType) {
        return [
          {
            accepted: true,
            mime: 'image.*',
            error: 'an Image'
          },
          {
            accepted: true,
            mime: 'application/pdf',
            error: 'a PDF'
          },
          {
            accepted: true,
            mime: 'video.*',
            error: 'a Video'
          },
          {
            accepted: true,
            mime: 'sheet',
            error: 'a XLS'
          }
        ]
      }

      let types = []

      if (this.imageType) {
        types.push({
          accepted: true,
          mime: 'image.*',
          error: 'an Image'
        })
      }

      if (this.pdfType) {
        types.push({
          accepted: true,
          mime: 'application/pdf',
          error: 'a PDF'
        })
      }

      if (this.videoType) {
        types.push({
          accepted: true,
          mime: 'video.*',
          error: 'a Video'
        })
      }

      if (this.xlsType) {
        types.push({
          accepted: true,
          mime: 'sheet',
          error: 'a XLS'
        })
      }

      return types
    }
  },
  methods: {
    launchFilePicker() {
      if (this.disabled) return
      this.$refs.fileInput.click()
    },
    resetInput() {
      this.$refs.fileInput.value = null
      this.file = null
      this.$emit('update:modelValue', null)
      this.$emit('onReset')
    },
    getBlobUrl(file) {
      return URL.createObjectURL(file)
    },
    getBase64Url(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()

        reader.onload = function () {
          const base64String = reader.result
          resolve(base64String)
        }

        reader.readAsDataURL(file)
      })
    },
    async fileSelected(evt) {
      if (!evt.target.files.length) return

      if (this.multiple) {
        const result = []

        for (const file of evt.target.files) {
          if (!this.checkFileType(file.type)) return
          if (!this.checkFileSize(file.size)) return

          result.push({
            file,
            url: this.getBlobUrl(file),
            base64: await this.getBase64Url(file)
          })
        }

        this.$emit('onChange', result)
      } else {
        this.file = evt.target.files[0]
        // Check file type
        if (!this.checkFileType(this.file.type)) return

        // check whether the size is greater than the size limit
        if (!this.checkFileSize(this.file.size)) return

        this.$emit('update:modelValue', this.file)
        this.$emit('onChange', {
          file: this.file,
          url: this.getBlobUrl(this.file),
          base64: await this.getBase64Url(this.file)
        })
      }

      if (this.resetOnSelect) this.resetInput()
    },

    // check type match with at least 1 of the accepted mimetypes
    checkFileType(type) {
      let valid = false
      let errors = []

      for (const acceptedType of this.acceptedTypes) {
        if (!type.match(acceptedType.mime)) {
          errors.push(acceptedType.error)
        } else {
          valid = true
        }
      }

      if (!valid) {
        this.$toast.error(`The file is not ${errors.join(' or ')}`)
      }

      return valid
    },
    checkFileSize(fileSize) {
      const sizeMB = fileSize / (1024 * 1024)

      if (sizeMB > this.maxSizeMB) {
        this.$toast.error(this.tooBigMsg)
        return false
      }

      return true
    }
  }
}
</script>

<style scoped>
input {
  display: none;
}
</style>
