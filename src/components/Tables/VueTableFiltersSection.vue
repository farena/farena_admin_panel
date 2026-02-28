<template>
  <div
    class="filters-section"
    :class="{
      collapse: isCollapse,
      collapsed: isCollapse && collapsed,
      hidden
    }"
  >
    <FormSelect
      :label="label"
      flex-field
      :options="options"
      v-model="result"
      v-if="['select', 'select-multiple'].includes(sectionType) && !moduleName"
      :multiple="sectionType === 'select-multiple'"
      :allOption="allOption"
      v-bind="extraAttrs"
    />
    <FormBoolean
      :label="label"
      flex-field
      v-model="result"
      v-else-if="sectionType === 'boolean'"
      :allOption="allOption"
      v-bind="extraAttrs"
    />
    <FormNumber
      :label="label"
      flex-field
      v-model="result"
      v-else-if="sectionType === 'number'"
      v-bind="extraAttrs"
    />
    <FormDate
      :label="label"
      flex-field
      v-model="result"
      v-else-if="sectionType === 'date'"
      v-bind="extraAttrs"
    />
    <FormDateRange
      :label="label"
      flex-field
      v-model="result"
      v-else-if="sectionType === 'date-range'"
      v-bind="extraAttrs"
    />
    <component
      v-else-if="sectionType === 'combobox'"
      flex-field
      :label="label"
      v-model="result"
      :is="comboComponent"
      v-bind="extraAttrs"
    />
    <component
      v-else-if="['select', 'select-multiple'].includes(sectionType) && moduleName"
      flex-field
      :label="label"
      v-model="result"
      :allOption="allOption"
      :is="selectComponent"
      :multiple="sectionType === 'select-multiple'"
      noClearBtn
      v-bind="extraAttrs"
    />

    <template v-else>
      <div class="filters-section-head" @click="collapsed = !collapsed">
        <h6>{{ label }}</h6>
        <div class="icon">
          <i class="fa fa-chevron-down"></i>
        </div>
      </div>
      <div class="filters-section-body">
        <div :class="`filters-type-${sectionType}`">
          <FormCheckbox
            :label="o.name || o"
            v-for="(o, i) of options"
            :key="i"
            :value="o.value || o"
            v-model="result"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import FormCheckbox from '@/components/Form/FormCheckbox.vue'
import FormSelect from '@/components/Form/FormSelect.vue'
import FormNumber from '@/components/Form/FormNumber.vue'
import FormDate from '@/components/Form/FormDate.vue'
import FormDateRange from '@/components/Form/FormDateRange.vue'
import Comboboxes from '@/components/Comboboxes/_combos-modules.js'
import Selects from '@/components/Selects/_select-modules.js'
import FormBoolean from '@/components/Form/FormBoolean.vue'

export default {
  components: {
    FormCheckbox,
    FormDate,
    FormDateRange,
    FormSelect,
    FormNumber,
    FormBoolean
  },
  props: {
    modelValue: {
      type: [Number, String, Array, Object, Boolean],
      default: null
    },
    sectionType: {
      type: String,
      validator: (value) =>
        [
          'select',
          'select-multiple',
          'date',
          'date-range',
          'combobox',
          'number',
          'boolean'
        ].includes(value),
      default: 'select'
    },
    options: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: null
    },
    moduleName: {
      type: String,
      default: null
    },
    allOption: {
      type: String,
      default: null
    },
    extraAttrs: {
      type: Object,
      default: () => {}
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    result: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    },
    isCollapse() {
      return false
      // return ['select-multiple'].includes(this.sectionType)
    },
    comboComponent() {
      return Comboboxes[this.moduleName]
    },
    selectComponent() {
      return Selects[this.moduleName]
    }
  },
  data: () => ({
    collapsed: true
  }),
  mounted() {
    if (this.modelValue || this.modelValue?.length) {
      this.collapsed = false
    }
  }
}
</script>
