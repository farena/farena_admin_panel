<template>
  <div class="v-table-filters">
    <div class="vt-search">
      <input
        v-if="searchable"
        type="text"
        :placeholder="lang.searchPlaceholder"
        class="form-control"
        @keyup.enter="search"
      />

      <span class="fa fa-circle-info vt-search-helper" v-if="searchHelper">
        <div class="tooltip">{{ searchHelper }}</div>
      </span>
    </div>

    <div class="vt-filters">
      <div class="vt-filters-wrapper">
        <a
          href="#"
          class="small underlined text-dark px-2"
          @click="clearFilters"
          v-if="activeFilters"
        >
          {{ lang.clearFilters }}
        </a>

        <button class="btn btn-sm btn-dark" @click="showFilters = true">
          <i class="material-symbols-outlined"> tune </i>
          <span>{{ lang.filters }}</span>
          <span class="badge badge-white" v-if="activeFilters">{{ activeFilters }}</span>
        </button>
        <button class="btn btn-sm btn-dark" v-if="exportable" @click="$emit('onExport')">
          <i class="fa fa-file-excel mr-2"></i>
          <span>{{ lang.export }}</span>
        </button>
      </div>

      <VueTableFiltersModal
        v-if="showFilters"
        @close="showFilters = false"
        v-model="result"
        @filter="applyFilters"
        @clearFilters="clearFilters"
        :sortOpts="sortOpts"
        :showOpts="showOpts"
        :hideOpts="hideOpts"
        :filters="filters"
        :lang="lang.filtersModal"
      />
    </div>
  </div>
</template>

<script>
import VueTableFiltersModal from './VueTableFiltersModal.vue'

/**
 * # INPUT
 * - lastPage | required
 *
 * # OUTPUT
 * - changing_page
 * - searching
 * - changing_showing
 */
export default {
  props: {
    searchable: {
      type: [Boolean, Number],
      default: true
    },
    filters: {
      type: [Array],
      default: () => []
    },
    headers: {
      type: Array,
      default: () => []
    },
    exportable: {
      type: Boolean,
      default: false
    },
    searchHelper: {
      type: String,
      default: ''
    },
    lang: {
      type: Object,
      default: () => ({
        searchPlaceholder: 'Search...',
        filters: 'Filters',
        clearFilters: 'Clear filters',
        export: 'Export XLS',
        lastUpdate: 'Last update',
        filtersModal: {
          title: 'FILTERS',
          showItems: 'Show Items',
          sortBy: 'Sort By',
          hiddenColumns: 'Hidden Columns',
          clearAll: 'Clear All',
          applyFilters: 'Apply filters'
        }
      })
    },
    initialGetter: {
      type: Boolean,
      default: true
    }
  },
  emits: ['onExport', 'filter', 'search'],
  components: {
    VueTableFiltersModal
  },
  data() {
    return {
      showFilters: false,
      showOpts: [10, 25, 50, 100],
      types_default_values: {
        number: null,
        select: null,
        'select-multiple': [],
        date: null,
        'date-range': { start: null, end: null },
        combobox: null,
        boolean: false
      },
      resultDefault: '',
      result: {
        showing: 25,
        sort: null,
        hidden: []
      }
    }
  },
  computed: {
    sortOpts() {
      const sortableCols = this.headers.filter((x) => x.sortable)

      return [
        {
          value: 'null',
          label: this.lang.lastUpdate
        },
        ...sortableCols.map((x) => ({
          value: `${x.sort_value || x.title}__asc`,
          label: `${(x.mask || x.title).replaceAll('_', ' ').ucwords()} - ASC`
        })),
        ...sortableCols.map((x) => ({
          value: `${x.sort_value || x.title}__desc`,
          label: `${(x.mask || x.title).replaceAll('_', ' ').ucwords()} - DESC`
        }))
      ].sort((a, b) => (a.label < b.label ? -1 : 1))
    },
    hideOpts() {
      return this.headers
        .filter((x) => x.hideable)
        .map((x) => ({
          value: x.title,
          name: (x.mask || x.title).replaceAll('_', ' ').ucwords()
        }))
    },
    activeFilters() {
      return Object.keys(this.result).reduce((sum, key) => {
        const value = this.result[key]
        const defaultKeys = ['showing', 'sort', 'hidden']

        if (defaultKeys.includes(key) || !value) return sum

        const isDateRange =
          Object.keys(value).includes('start') && Object.keys(value).includes('end')
        if (isDateRange && (!value.start || !value.end)) return sum

        const isArray = Array.isArray(value)
        if (isArray && !value.length) return sum

        return sum + 1
      }, 0)
    }
  },
  mounted() {
    if (this.filters.length) {
      for (const f of this.filters) {
        this.result[f.column] = f.default_value || this.types_default_values[f.type]
      }
    }
    this.resultDefault = JSON.stringify(this.result)

    this.loadFilters()
  },
  methods: {
    loadFilters() {
      const route = this.$route.fullPath.replaceAll('/', '_')

      const inMemoryFilters = localStorage.getItem(`vt_filters_${route}`)

      if (inMemoryFilters) {
        const DEFAULT_KEYS = Object.keys(JSON.parse(this.resultDefault)).sort().join(',')
        const INMEMORY_KEYS = Object.keys(JSON.parse(inMemoryFilters)).sort().join(',')

        if (DEFAULT_KEYS === INMEMORY_KEYS) {
          this.result = JSON.parse(inMemoryFilters)
        }
      }

      this.applyFilters(this.result, this.initialGetter)
    },
    saveFilters(evt) {
      this.result = evt
      const route = this.$route.fullPath.replaceAll('/', '_')
      localStorage.setItem(`vt_filters_${route}`, JSON.stringify(this.result))
    },
    clearFilters(send = true) {
      this.applyFilters(JSON.parse(this.resultDefault), send)
    },
    applyFilters(evt, send = true) {
      this.saveFilters(evt)

      const aux = JSON.parse(JSON.stringify(evt))
      Object.keys(aux).forEach((key) => {
        if (!aux[key]) return

        // If the value is an object with a key of the same name, use the value of that key
        if (aux[key][key]) {
          aux[key] = aux[key][key]
        }

        // if the value is an array, and the array has a key of the same name, use the value of that key
        if (Array.isArray(aux[key]) && aux[key].length && aux[key][0][key]) {
          aux[key] = aux[key].map((x) => x[key])
        }
      })

      if (send) this.$emit('filter', aux)
    },

    search(evt) {
      this.clearFilters(false)
      this.$emit('search', evt.target.value)
    }
  }
}
</script>
