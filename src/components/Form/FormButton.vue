<template>
  <button
    v-if="!to"
    :type="type"
    class="btn"
    :class="[
      { 'btn-block': block, 'btn-sm': small, disabled, 'btn-rounded': justIcon },
      `btn-${outlined ? 'outline-' : ''}${theme}`,
      { 'btn-plain': plain }
    ]"
    @mouseover="adjustTooltipPosition"
    ref="button"
  >
    <div :class="['tooltip', tooltipPosition]" v-if="tooltip" ref="tooltip">
      {{ tooltip }}
    </div>
    <div class="icon" v-if="icon">
      <i class="fa" :class="icon"></i>
    </div>

    <span v-if="hasDefaultSlot">
      <slot />
    </span>
  </button>

  <a
    :href="to"
    target="_blank"
    class="btn"
    :class="[
      { 'btn-block': block, 'btn-sm': small, disabled, 'btn-rounded': justIcon },
      `btn-${outlined ? 'outline-' : ''}${theme}`,
      { 'btn-plain': plain }
    ]"
    v-else-if="typeof to === 'string' && to.slice(0, 4) === 'http'"
    @mouseover="adjustTooltipPosition"
    ref="button"
  >
    <div :class="['tooltip', tooltipPosition]" v-if="tooltip" ref="tooltip">
      {{ tooltip }}
    </div>
    <div class="icon" v-if="icon">
      <i class="fa" :class="icon"></i>
    </div>

    <span v-if="hasDefaultSlot">
      <slot />
    </span>
  </a>

  <router-link
    v-else
    :to="to"
    class="btn"
    :class="[
      { 'btn-block': block, 'btn-sm': small, disabled, 'btn-rounded': justIcon },
      `btn-${outlined ? 'outline-' : ''}${theme}`,
      { 'btn-plain': plain }
    ]"
    @mouseover="adjustTooltipPosition"
    ref="button"
  >
    <div :class="['tooltip', tooltipPosition]" v-if="tooltip" ref="tooltip">
      {{ tooltip }}
    </div>
    <div class="icon" v-if="icon">
      <i class="fa" :class="icon"></i>
    </div>

    <span v-if="hasDefaultSlot">
      <slot />
    </span>
  </router-link>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'button'
    },
    theme: {
      type: String,
      default: 'primary'
    },
    to: {
      type: [String, Object],
      default: null
    },
    block: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: false
    },
    justIcon: {
      type: Boolean,
      default: false
    },
    icon: {
      type: [String, Object]
    },
    tooltip: {
      type: String
    },
    tooltipContainer: {
      type: [String, HTMLElement],
      default: '.content-wrapper'
    },
    plain: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tooltipPosition: 'left'
    }
  },
  computed: {
    hasDefaultSlot() {
      return (
        this.$slots.default && this.$slots.default().filter((x) => x.children !== 'v-if').length > 0
      )
    }
  },
  methods: {
    adjustTooltipPosition() {
      if (!this.$refs.tooltip) return

      this.$nextTick(() => {
        const wrapper =
          typeof this.tooltipContainer === 'string'
            ? document.querySelector(this.tooltipContainer)
            : this.tooltipContainer
        const wrapperRect = wrapper.getBoundingClientRect()
        const buttonRect = this.$refs.button.getBoundingClientRect()
        const tooltipRect = this.$refs.tooltip.getBoundingClientRect()

        const tooltipWidth = tooltipRect.width
        const tooltipHeight = tooltipRect.height

        // Verifica la proximidad al borde derecho del contenedor
        if (wrapperRect.right - buttonRect.right < tooltipWidth) {
          this.tooltipPosition = 'left'
        }
        // Verifica la proximidad al borde izquierdo del contenedor
        else if (buttonRect.left - wrapperRect.left < tooltipWidth) {
          this.tooltipPosition = 'right'
        }
        // Verifica la proximidad al borde inferior del contenedor
        else if (wrapperRect.bottom - buttonRect.bottom < tooltipHeight) {
          this.tooltipPosition = 'top'
        }
        // Verifica la proximidad al borde superior del contenedor
        else if (buttonRect.top - wrapperRect.top < tooltipHeight) {
          this.tooltipPosition = 'bottom'
        } else {
          this.tooltipPosition = 'left' // Posición por defecto
        }
      })
    }
  }
}
</script>
