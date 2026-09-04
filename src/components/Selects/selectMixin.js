import FormSelect from '@/components/Form/FormSelect.vue'

/**
 * Important:
 * When using this select Mixin
 * is a must to declare 2 vars
 * in data (vuex_action, vuex_getter)
 * to use inside getData function
 */
export default {
  components: {
    FormSelect
  },
  emits: ['change', 'update:modelValue', 'ready'],
  props: {
    modelValue: {
      type: [Number, String, Array],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    nullOption: {
      type: String,
      default: null
    },
    allOption: {
      type: String,
      default: null
    },
    newOption: {
      type: String,
      default: null
    }
  },
  data: () => ({
    loading: false,
    optionLabel: 'label',
    optionValue: 'value'
  }),
  computed: {
    result: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)

        this.$emit(
          'change',
          this.options.find((x) => x[this.optionValue] === val)
        )
      }
    },
    options() {
      const options = [...this.$store.getters[this.vuex_getter]] || []
      if (this.nullOption && !options.map((x) => x[this.optionValue]).includes('null'))
        options.unshift({ [this.primaryKey]: 'null', name: this.nullOption })
      if (this.newOption && !options.map((x) => x[this.optionValue]).includes('new'))
        options.unshift({ [this.primaryKey]: 'new', name: this.newOption })
      if (this.allOption && !options.map((x) => x[this.optionValue]).includes('all'))
        options.unshift({ [this.primaryKey]: 'all', name: this.allOption })

      return options
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData(force = false) {
      return new Promise((resolve) => {
        this.loading = true

        this.$store.dispatch(this.vuex_action, { force }).then(() => {
          this.$emit('ready', this.options)
          if (this.result) {
            this.$emit(
              'change',
              this.options.find((x) => x[this.primaryKey] === this.result)
            )
          }
          this.loading = false
          resolve()
        })
      })
    }
  }
}
