<template>
  <Teleport to="#modal-container">
    <transition name="fade" @after-enter="afterEnter">
      <div
        class="vue-modal"
        :class="`position-${position}`"
        v-if="open"
        @keypress.esc="showContent = false"
        tabindex="0"
        v-bind="$attrs"
      >
        <transition :name="`modal-pos-${position}`" @after-leave="endClose">
          <div class="vue-modal-content" v-show="showContent" :class="`modal-${size}`">
            <div class="modal-header">
              <h5 class="modal-title">
                <slot name="title"></slot>
              </h5>
              <slot name="info"></slot>

              <button type="button" class="close" @click="close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-body-wrapper">
                <slot name="body"></slot>
              </div>
            </div>
            <div class="modal-footer" v-if="hasFooter">
              <slot name="footer"></slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script>
export default {
  inheritAttrs: false,
  data() {
    return {
      showContent: false,
      open: false
    }
  },
  emits: ['close', 'onSave', 'onLoad'],
  props: {
    size: {
      validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value),
      default: 'lg'
    },
    position: {
      validator: (value) => ['center', 'left', 'right', 'top', 'bottom'].includes(value),
      default: 'center'
    }
  },
  computed: {
    hasFooter() {
      return !!this.$slots.footer
    }
  },
  mounted() {
    setTimeout(() => (this.open = true), 100)
    document.body.classList.add('no-scrollable')

    const sidebar = document.querySelector('.sidebar')
    if (sidebar) sidebar.style.zIndex = 0
  },
  unmounted() {
    document.body.classList.remove('no-scrollable')

    const sidebar = document.querySelector('.sidebar')
    if (sidebar) sidebar.style.zIndex = 3
  },
  methods: {
    close() {
      this.showContent = false
    },
    endClose() {
      this.$emit('close')
    },
    afterEnter() {
      this.showContent = true
      this.$emit('onLoad')
    }
  }
}
</script>
