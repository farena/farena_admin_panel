<template>
  <div class="v-table">
    <VueTableFilters
      v-show="!noFilters"
      :searchable="searchable"
      :exportable="exportable"
      :filters="filters"
      :headers="headers"
      :searchHelper="searchHelper"
      :lang="lang.filters"
      :initialGetter="initialGetter"
      @search="searched"
      @filter="filtered"
      @onExport="onExport"
      ref="vfilters"
    />
    <div class="v-table-container">
      <table :class="opts.tableClass">
        <thead :class="opts.theadClass">
          <tr>
            <th v-if="checkeable" width="1%">
              <input v-model="checkAll" type="checkbox" />
            </th>
            <template v-for="head in visibleHeaders" :key="head.key">
              <th :style="{ width: head.width ? head.width + '%' : 'auto' }">
                {{ (head.mask || head.title || '').replaceAll('_', ' ').ucwords() }}
              </th>
            </template>
            <th style="width: 1%" v-if="actions?.length" />
          </tr>
        </thead>
        <tbody :class="opts.tbodyClass">
          <template
            v-if="
              !values ||
              values.length === 0 ||
              (Object.keys(values).length === 0 && values.constructor === Object)
            "
          >
            <tr>
              <td :colspan="visibleHeaders.length + 1" style="text-align: center">
                <loader />
              </td>
            </tr>
          </template>
          <tr
            v-for="(item, a) in values.data"
            :key="item.id"
            @mousedown="startHoldTimer"
            @mouseup="endHoldTimer"
            @mouseleave="cancelHoldTimer"
            @click.stop="handleClick(item, a)"
            @click.stop.middle="rowClicked(item, a, true)"
            :class="{ 'v-table-row-clickeable': clickeableRows, [`${item.rowClass || ''}`]: true }"
          >
            <td @click.stop v-if="checkeable">
              <input
                v-model="item.checked"
                type="checkbox"
                @click.stop="
                  $emit('checked', { all: false, value: $event.target.checked, index: a })
                "
              />
            </td>

            <td
              v-for="(head, b) in visibleHeaders"
              :key="b"
              :class="{
                'v-table-editable-td': head.editable,
                'v-table-just-button': head.justButton
              }"
              :data-cell="(head.mask || head.title || '').replaceAll('_', ' ').ucwords()"
            >
              <template v-if="head.slot">
                <div>
                  <slot :name="head.slot" :item="item" :index="a" />
                </div>
              </template>

              <template v-else-if="head.editable">
                <div
                  v-if="head.editable !== 'checkbox'"
                  class="v-table-input-container"
                  :class="opts.inputContainerClass"
                >
                  <input
                    v-if="['text', 'number'].includes(head.editable)"
                    class="v-table-input"
                    :class="opts.inputClass"
                    :type="head.editable"
                    :value="nestedTitle(item, head.title)"
                    @input="$emit('editableInput', a, head.title, $event.target.value)"
                    @change="$emit('editableChange', a, head.title, $event.target.value)"
                  />
                  <select
                    v-if="head.editable === 'select'"
                    :class="opts.inputClass"
                    class="v-table-input"
                    :value="nestedTitle(item, head.title)"
                    @input="$emit('editableInput', a, head.title, $event.target.value)"
                    @change="$emit('editableChange', a, head.title, $event.target.value)"
                  >
                    <option v-for="o in head.options" :key="o.id" :value="o.id">
                      {{ o.label }}
                    </option>
                  </select>
                </div>
                <div v-else class="v-table-checkbox-container" :class="opts.checkboxContainerClass">
                  <input
                    class="v-table-checkbox"
                    :class="opts.checkboxClass"
                    :type="head.editable"
                    :checked="nestedTitle(item, head.title)"
                    @input="$emit('editableInput', a, head.title, $event.target.checked)"
                    @change="$emit('editableChange', a, head.title, $event.target.checked)"
                  />
                </div>
              </template>

              <template v-else>
                <span v-if="head.htmlFormat === true" v-html="parseValue(item, head)" />
                <div v-else :title="parseValue(item, head, true)">
                  <b v-if="head.strong">
                    {{ parseValue(item, head) }}
                  </b>
                  <span v-else>
                    {{ parseValue(item, head) }}
                  </span>
                </div>
              </template>
            </td>

            <td class="vt-actions-cell" v-if="actions?.length">
              <div>
                <button
                  v-if="canMoveRows"
                  class="btn btn-sm btn-borderless-dark"
                  @click.stop="actionSortRow(item, 'decrease')"
                  style="position: relative"
                  :disabled="a === 0"
                >
                  <i class="fa-solid fa-chevron-up"></i>
                </button>
                <button
                  v-if="canMoveRows"
                  class="btn btn-sm btn-borderless-dark"
                  @click.stop="actionSortRow(item, 'increase')"
                  style="position: relative"
                  :disabled="a === values.data.length - 1"
                >
                  <i class="fa-solid fa-chevron-down"></i>
                </button>
                <FormDropdown position="bottom" v-if="itemHasActions(item, actions)">
                  <template #action="{ open }">
                    <button class="btn btn-sm btn-borderless-dark actions-btn" @click.stop="open">
                      <i class="fa fa-ellipsis"></i>
                    </button>
                  </template>
                  <template #default="{ close }">
                    <template v-for="(act, i) in actions">
                      <div :key="i" v-if="!act.hideWhenFn || !act.hideWhenFn(item)">
                        <a
                          v-if="act.to && act.v1"
                          :href="act.to(item)"
                          target="_blank"
                          class="btn btn-borderless-dark vtable-btn"
                        >
                          <small>{{ act.title }}</small>
                        </a>
                        <router-link
                          v-else-if="act.to"
                          :to="act.to(item)"
                          class="btn btn-borderless-dark actions-btn"
                        >
                          <small>{{ act.title }}</small>
                        </router-link>
                        <button
                          v-else
                          class="btn btn-borderless-dark actions-btn"
                          @click.stop="actionClicked(act, item, a, close)"
                          @click.stop.middle="actionClicked(act, item, a, close, true)"
                        >
                          <small>{{ act.title }}</small>
                        </button>
                      </div>
                    </template>
                  </template>
                </FormDropdown>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="values.data && values.data.length <= 0">
          <tr>
            <td colspan="1000" style="text-align: center">{{ lang.noDataToShow }}</td>
          </tr>
        </tfoot>
        <tfoot v-else-if="$slots.footer">
          <tr>
            <slot name="footer" />
          </tr>
        </tfoot>
      </table>
    </div>

    <VueTablePager
      :from="values.from"
      :to="values.to"
      :total="values.total"
      :last-page="values.last_page"
      :actual-page="values.current_page"
      :lang="lang.pager"
      @changing_page="pageChanged"
    />
  </div>
</template>

<script>
/**
 * Valores recibidos
 *
 * # HEADERS
 * - title : string / nullable
 * - mask : string / nullable
 * - width: number(%) / nullable
 * - max_chars: number / nullable
 * - htmlFormat: bool / will parse string into html
 * - dateFormat: bool
 * - dateTimeFormat: bool
 * - dateLocaleFormat: bool
 * - boolean: bool
 * - booleanValues: Object / { true: 'Value for true', false: 'Value for false' }
 * - pre: string / concatenated at beginning
 * - after: string / concatenated at end
 * - sortable: bool
 * - hideable: bool
 * - callback: function(item) / return string to display in cell
 * - slot: string / will create a slot to overwrite cell
 *
 * # VALUES
 * - pagination from laravel (https://laravel.com/docs/5.8/pagination)
 *
 * # ACTIONS
 * - callback
 * - title
 * - hideWhenFn // filter function to hide
 * - to: function(item) / item will be passed as parameter. must return a vuerouter link
 *
 * # FILTERS
 * - title
 * - type: select/select-multiple/combobox/date/date-range/number/boolean
 * - options: array/null (only for select/select-multiple without module)
 * - column // Column to filter
 * - module: string/null (only for combobox/select)
 * - all_option: string/null (only for select with module)
 * - default_value: optional, default value for filter
 *
 * # OPTIONS
 * - tableClass
 * - theadClass
 * - tbodyClass
 */

/**
 * Valores Emitidos
 * - changed (se modifican los parametros de busqueda)
 */
import './utils/ucwords'
import VueTableFilters from './VueTableFilters.vue'
import VueTablePager from './VueTablePager.vue'
import FormDropdown from '@/components/Form/FormDropdown.vue'
import loader from './loader.vue'
import { parseToString, parseToLocale } from '@/utils/date'
import { useClickAndHold } from './utils/useClickAndHold'
import { formatCentsToMoney } from '@/utils/string'

export default {
  name: 'VueTables',
  components: {
    VueTableFilters,
    VueTablePager,
    FormDropdown,
    loader
  },
  props: {
    headers: {
      type: Array,
      default: null
    },
    values: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null
    },
    actions: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Array,
      default: () => []
    },
    truncate: {
      type: [Number, Boolean],
      default: 80
    },
    searchMinLen: {
      type: Number,
      default: 3
    },
    exportable: {
      type: Boolean,
      default: false
    },
    noFilters: {
      type: Boolean,
      default: false
    },
    canMoveRows: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: true
    },
    initialGetter: {
      type: Boolean,
      default: true
    },
    checkeable: Boolean,
    clickeableRows: Boolean,
    searchHelper: String,
    lang: {
      type: Object,
      default: () => ({
        noDataToShow: 'No hay datos para mostrar',
        searchTooShort: 'El valor de búsqueda es demasiado corto',
        filters: {
          searchPlaceholder: 'Buscar...',
          filters: 'Filtros',
          clearFilters: 'Limpiar filtros',
          export: 'Exportar XLS',
          lastUpdate: 'Última actualización',
          filtersModal: {
            title: 'FILTROS',
            showItems: 'Mostrar elementos',
            sortBy: 'Ordenar por',
            hiddenColumns: 'Columnas ocultas',
            clearAll: 'Limpiar todo',
            applyFilters: 'Aplicar filtros'
          }
        },
        pager: {
          showingEntries:
            'Mostrando desde <b>{from}</b> hasta <b>{to}</b> de <b>{total}</b> entradas',
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior'
        },
        booleanValues: {
          true: 'SI',
          false: 'NO'
        }
      })
    }
  },
  data() {
    return {
      opts: {
        tableClass: 'table table-hover',
        theadClass: '',
        tbodyClass: '',
        checkeable: false,
        searchable: true,
        inputContainerClass: '',
        inputClass: '',
        checkboxContainerClass: '',
        checkboxClass: ''
      },
      sortedBy: '',
      sortedDir: 'asc',
      date_column: null,
      vTableParams: {
        page: 1,
        search: null,
        sort_by: null,
        sort_dir: null,
        per_page: 25,
        hidden_cols: [],
        filters: null
      },
      checkAll: false
    }
  },
  setup() {
    // Use composable here
    const { isHold, startHoldTimer, endHoldTimer, cancelHoldTimer } = useClickAndHold(250)

    return {
      isHold,
      startHoldTimer,
      endHoldTimer,
      cancelHoldTimer
    }
  },
  watch: {
    checkAll: {
      handler(val) {
        this.$emit('checked', { all: true, value: val })
      }
    }
  },
  computed: {
    visibleHeaders() {
      return this.headers.filter((x) => !this.vTableParams.hidden_cols.includes(x.title))
    }
  },
  mounted() {
    if (!this.values)
      throw new Error('Input VALUES is empty, please add data. (eg.: :values="myData")')
    if (!this.headers)
      throw new Error('Input HEADERS is empty, please add data. (eg.: :headers="myHeaders")')

    // Validate lang property
    if (this.lang && this.lang !== this.$options.props.lang.default()) {
      const defaultLang = this.$options.props.lang.default()
      this.validateLangObject(this.lang, defaultLang, 'lang')
    }

    if (this.options) {
      Object.keys(this.options).forEach((key) => {
        if (key in this.opts) {
          if (key === 'checkeable' && typeof this.options[key] !== 'boolean') {
            throw new Error('Options "checkeable" must be a Boolean')
          }
          this.opts[key] = this.options[key]
        }
      })
    }
  },
  methods: {
    validateLangObject(obj, defaultObj, path = '') {
      for (const key in defaultObj) {
        const currentPath = path ? `${path}.${key}` : key

        if (typeof defaultObj[key] === 'object' && defaultObj[key] !== null) {
          if (!obj[key] || typeof obj[key] !== 'object') {
            console.warn(`Missing or invalid lang key: ${currentPath}`)
          } else {
            this.validateLangObject(obj[key], defaultObj[key], currentPath)
          }
        } else if (!(key in obj)) {
          console.warn(`Missing lang key: ${currentPath}`)
        }
      }
    },
    pageChanged(val) {
      this.vTableParams.page = val
      this.changed()
    },
    searched(val) {
      if (val && val.length <= this.searchMinLen) {
        this.$toast.error(this.lang.searchTooShort)
        return
      }

      this.vTableParams.page = 1
      this.vTableParams.search = val
      this.changed()
    },
    filtered(val) {
      const { sort, showing, hidden, ...filters } = val

      if (sort && sort !== 'null') {
        const [by, dir] = sort.split('__')

        this.vTableParams.sort_by = by
        this.vTableParams.sort_dir = dir
      } else {
        this.vTableParams.sort_by = null
        this.vTableParams.sort_dir = null
      }

      if (showing !== this.vTableParams.per_page) {
        this.vTableParams.page = 1
        this.vTableParams.per_page = showing
      }

      if (hidden) {
        this.vTableParams.hidden_cols = hidden
      }

      const FILTERS_CHANGED = JSON.stringify(filters) !== JSON.stringify(this.vTableParams.filters)
      if (filters && FILTERS_CHANGED) {
        this.vTableParams.page = 1
        this.vTableParams.filters = filters
      }

      this.changed()
    },

    changed() {
      const { sort_by, sort_dir, page, per_page, search, filters } = this.vTableParams

      this.$emit('changed', {
        sort_by,
        sort_dir,
        page,
        per_page,
        search,
        ...this.parseFilters(filters)
      })
    },

    parseFilters(filters) {
      const allowedSubKeys = ['start', 'end', 'value']
      const aux = {}

      const notNull = (val) => val !== null && val !== undefined

      for (const key of Object.keys(filters)) {
        const filter = filters[key]

        if (typeof filter === 'object' && !Array.isArray(filter) && filter !== null) {
          for (const subkey of Object.keys(filters[key])) {
            if (allowedSubKeys.includes(subkey)) {
              if (notNull(filters[key][subkey])) {
                if (subkey === 'value') {
                  aux[`${key}`] = filters[key][subkey]
                } else {
                  aux[`${key}_${subkey}`] = filters[key][subkey]
                }
              }
            }
          }
        } else if (notNull(filters[key])) {
          aux[key] = filters[key]
        }
      }

      return aux
    },

    nestedTitle(item, val) {
      const value = item[val]
      if (!value) {
        const array = val.split('.')
        let aux = item

        array.forEach((attr) => {
          aux = aux[attr] === null || aux[attr] === undefined ? '-' : aux[attr]
        })
        return aux
      }
      return value
    },

    parseValue(item, head, full = false) {
      let result = this.nestedTitle(item, head.title)

      if (head.dateFormat === true && result !== '-') result = parseToString(result) // YYYY-MM-DD
      else if (head.dateTimeFormat === true && result !== '-')
        result = parseToString(result, true) // YYYY-MM-DD HH:mm
      else if (head.dateLocaleFormat === true && result !== '-')
        result = parseToLocale(result) // MMM DD, YYYY
      else if (head.dateTimeLocaleFormat === true && result !== '-')
        result = parseToLocale(result, true) // HH:mm - MMM DD, YYYY
      else if (head.boolean === true) {
        if (head.booleanValues) {
          result = head.booleanValues[result === true]
        } else {
          result = this.lang.booleanValues[result == true]
        }
      } else if (head.callback !== undefined) result = head.callback(result)

      if (head.pre) {
        if (['€', '$'].includes(head.pre)) {
          result = `${head.pre}${formatCentsToMoney(result)}`
        } else result = `${head.pre}${result}`
      }
      if (head.after) result = `${result}${head.after}`

      if (full) return result || '-'

      if (head.htmlFormat) {
        return result
      }

      if (head.max_chars && result.length > head.max_chars)
        result = `${result.slice(0, head.max_chars)}...`

      if (this.truncate && result?.length > this.truncate)
        result = `${result.slice(0, this.truncate)}...`

      return result || '-'
    },

    init() {
      this.$emit('changed', {
        sort_by: null,
        sort_dir: null,
        search: this.vTableParams.search,
        ...this.parseFilters(this.vTableParams.filters),
        page: this.values.current_page || 1,
        per_page: this.values.per_page || 10
      })
    },

    actionClicked(action, item, index, close, middleBtn = false) {
      this.$emit(action.callback, item, index, middleBtn)
      close()
    },
    onExport() {
      this.$emit('onExport', this.parseFilters(this.vTableParams.filters))
    },
    actionSortRow(item, action) {
      this.$emit('onChangeOrder', {
        item,
        modifier: action === 'increase' ? 1 : -1,
        newSort: action === 'increase' ? item.sort + 1 : item.sort - 1
      })
    },
    handleClick(item, index) {
      if (!this.isHold) {
        this.rowClicked(item, index)
      }
    },
    rowClicked(item, index, middleBtn = false) {
      if (!this.clickeableRows) return
      this.$emit('rowClicked', item, index, middleBtn)
    },
    itemHasActions(item, actions) {
      return actions.some((action) => !action.hideWhenFn || !action.hideWhenFn(item))
    }
  }
}
</script>
