<template>
  <div class="v-table-pager">
    <div class="vt-results">
      <span v-if="from" v-html="formatShowingEntries()"></span>
    </div>
    <ul>
      <li
        class="vt-desktop"
        :class="current_page - 1 === 0 ? 'disabled' : ''"
        @click.prevent="changePage(1)"
      >
        {{ lang.first }}
      </li>
      <li
        v-for="page in pages_list"
        :key="page.number"
        class="vt-desktop vt-number"
        :class="current_page === page.number ? 'active disabled' : ''"
        @click.prevent="changePage(page.number)"
      >
        {{ page.number }}
      </li>
      <li
        class="vt-desktop"
        :class="!lastPage || current_page + 1 > lastPage ? 'disabled' : ''"
        @click.prevent="changePage(lastPage)"
      >
        {{ lang.last }}
      </li>

      <li
        class="vt-mobile"
        :class="current_page - 1 === 0 ? 'disabled' : ''"
        @click.prevent="changePage(current_page - 1)"
      >
        {{ lang.previous }}
      </li>
      <li
        class="vt-mobile"
        :class="current_page + 1 > lastPage ? 'disabled' : ''"
        @click.prevent="changePage(current_page + 1)"
      >
        {{ lang.next }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    from: {
      type: [Number, String],
      default: null
    },
    to: {
      type: [Number, String],
      default: null
    },
    total: {
      type: [Number, String],
      default: null
    },
    lastPage: {
      type: [Number, String],
      default: 1
    },
    actualPage: {
      type: [Number, String],
      default: 1
    },
    lang: {
      type: Object,
      default: () => ({
        showingEntries: 'Showing from <b>{from}</b> to <b>{to}</b> of <b>{total}</b> entries',
        first: 'First',
        last: 'Last',
        next: 'Next',
        previous: 'Prev'
      })
    }
  },
  data() {
    return {
      current_page: 1,
      pages_list: []
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    lastPage(oldVal, newVal) {
      this.doPagesList()
    },
    actualPage(val) {
      this.current_page = val
      this.doPagesList()
    }
  },
  mounted() {
    this.doPagesList()
  },
  methods: {
    formatShowingEntries() {
      if (!this.from) return ''

      return this.lang.showingEntries
        .replace('{from}', this.from)
        .replace('{to}', this.to)
        .replace('{total}', this.total)
    },

    doPagesList() {
      // Reseteo la lista
      this.pages_list = []

      // Agrego los items antes del actual
      if (this.current_page > 3) {
        for (let i = this.current_page; i >= this.current_page - 2; i -= 1) {
          this.pages_list.unshift({
            number: i
          })
        }
      } else {
        for (let i = 1; i <= this.current_page; i += 1) {
          this.pages_list.push({
            number: i
          })
        }
      }

      // Agrego los items despues del actual
      let rest = this.lastPage - this.current_page

      if (rest !== 0) {
        // reasigno a la cantidad maxima de paginas por delante
        rest = rest > 2 ? 2 : rest

        for (let i = this.current_page + 1; i <= this.current_page + rest; i += 1) {
          this.pages_list.push({
            number: i
          })
        }
      }
    },

    changePage(number) {
      if (number > 0 || number <= this.lastPage()) {
        this.current_page = number
        this.doPagesList()
        this.$emit('changing_page', number)
      }
    }
  }
}
</script>
