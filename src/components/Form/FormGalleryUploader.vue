<template>
  <div class="form-gallery-uploader">
    <div class="d-flex justify-content-between align-items-center">
      <label>{{ label }}</label>
      <FormButton
        small
        icon="fa fa-sort"
        tooltip="Cambiar orden de las fotos"
        @click="showOrderList = true"
        v-if="modelValue.length > 0"
      ></FormButton>
    </div>
    <div class="form-gallery-items-wrapper" :style="wrapperStyles">
      <FormUploader
        class="form-gallery-item add-item form-uploader bg-primary bg-hover-primary-shade"
        image-type
        @onChange="imageSelected"
        reset-on-select
        multiple
      >
        <template #default="{ launchPicker }">
          <div @click="launchPicker">
            <i class="fa fa-image"></i>
            <h6 class="label m-0">Agregar foto</h6>
          </div>
        </template>
      </FormUploader>

      <div
        class="form-gallery-item"
        v-for="(img, ix) of modelValue"
        :key="ix"
        :style="`background-image: url('${img.url}')`"
        @click.stop="openGallery(ix)"
      >
        <button class="btn btn-danger btn-rounded" @click.stop="removePhoto(ix)">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>
  </div>

  <Gallery
    v-if="showGallery"
    @close="showGallery = false"
    :items="modelValue"
    :selectedIndex="selectedIndex"
    @onSaveTemplate="saveTemplate"
  />

  <OrderList
    v-if="showOrderList"
    :items="modelValue"
    primaryKey="file_id"
    orderKey="sort"
    nameKey="url"
    isImageArray
    @close="showOrderList = false"
    @save="onSaveOrder"
  />
</template>

<script>
import FormUploader from './FormUploader.vue'
import Gallery from '../Gallery/Gallery.vue'
import FormButton from './FormButton.vue'
import OrderList from '../Lists/OrderList.vue'

export default {
  components: {
    FormUploader,
    Gallery,
    FormButton,
    OrderList
  },
  props: {
    primaryKey: {
      type: String,
      default: 'file_id'
    },
    label: {
      type: String,
      default: 'Gallery'
    },
    modelValue: {
      type: Array,
      default: () => []
    },
    responsiveItems: {
      type: Object,
      default: () => ({
        0: { items: 3 },
        350: { items: 5 },
        512: { items: 6 },
        768: { items: 10 }
      })
    },
    onAdd: Function,
    onDelete: Function,
    onUpdateOrder: Function,
    onSaveTemplate: Function
  },
  mounted() {
    window.addEventListener('resize', this.onResize)
    this.onResize()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },
  data: () => ({
    columns: 3,
    showGallery: false,
    selectedIndex: 0,
    showOrderList: false
  }),
  computed: {
    wrapperStyles() {
      return `--cols: ${this.columns}`
    }
  },
  methods: {
    onResize() {
      Object.keys(this.responsiveItems).map((minWidth) => {
        if (window.innerWidth > minWidth) {
          this.columns = this.responsiveItems[minWidth].items
        }
      })
    },
    async imageSelected(imgs) {
      for (const img of imgs) {
        let file_id
        if (this.onAdd) {
          file_id = await this.onAdd(img)
        }
        this.$emit('update:modelValue', [
          ...this.modelValue,
          { ...img, [this.primary_key]: file_id }
        ])
      }
    },
    async removePhoto(ix) {
      if (this.onDelete) {
        await this.onDelete(this.modelValue[ix])
      }

      const aux = [...this.modelValue]

      aux.splice(ix, 1)
      this.$emit('update:modelValue', aux)
    },
    async onSaveOrder(items) {
      if (this.onUpdateOrder) {
        await this.onUpdateOrder(items)
      }

      this.$emit('update:modelValue', items)
    },
    openGallery(index) {
      this.showGallery = true
      this.selectedIndex = index
    },
    saveTemplate({ index, item }) {
      if (this.onSaveTemplate) {
        this.onSaveTemplate({ index, item })
      }
      const aux = [...this.modelValue]
      aux[index] = item
      this.$emit('update:modelValue', aux)
    }
  }
}
</script>

<style></style>
