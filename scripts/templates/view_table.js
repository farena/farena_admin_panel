/* eslint-disable no-undef */
module.exports = function generateTableView(nameVariants, fields = [], useCases = []) {
  const { 
    singularSC, singularPC, singularPCSpaced, pluralPC, pluralPCSpaced 
  } = nameVariants

  // Generate table headers based on fields
  const generateHeaders = () => {
    let headers = `      headers: [
        {
          title: '${singularSC}_id',
          mask: 'ID',
          sortable: true
        }`

    if (fields.length > 0) {
      fields.forEach(field => {
        headers += `,
        {
          title: '${field.name}',
          sortable: true
        }`
      })
    } else {
      // Default header if no fields specified
      headers += `,
        {
          title: 'name',
          sortable: true
        }`
    }

    headers += `
      ],`
    return headers
  }

  // Generate actions based on use cases
  const generateActions = () => {
    let actions = `      actions: [`

    if (useCases.includes('delete')) {
      actions += `
        {
          title: 'Delete ${singularPCSpaced}',
          callback: 'onDelete'
        },`
    }

    if (useCases.includes('soft_delete')) {
      if (useCases.includes('delete')) actions += `,`
      actions += `
        {
          title: 'Activate ${singularPCSpaced}',
          callback: 'onActivate',
          hideWhenFn: (item) => item.deleted_at !== null
        },
        {
          title: 'Deactivate ${singularPCSpaced}',
          callback: 'onDeactivate',
          hideWhenFn: (item) => item.deleted_at === null
        },`
    }

    actions += `
      ],`
    return actions
  }

  // Generate methods based on use cases
  const generateMethods = () => {
    let methods = `  methods: {`

    // Always include getData method
    methods += `
    getData(params) {
      this.$store.dispatch('get${pluralPC}PaginableList', params).then((data) => {
        this.vTable.values = data
      })
    },
    onShowDetails(item) {
      this.selectedItem = item
      this.openForm()
    },
    openForm() {
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
      this.selectedItem = null
    },`

    if (useCases.includes('delete')) {
      methods += `
    async onDelete(item) {
      await this.$confirm({
        title: 'Delete ${singularPCSpaced}',
        text: 'Are you sure you want to delete this item?'
      })

      this.$store.dispatch('delete${singularPC}', item.${singularSC}_id).then(() => {
        this.$refs.vTable.init()
      })
    },`
    }

    if (useCases.includes('soft_delete')) {
      methods += `
    async onActivate(item) {
      await this.$confirm({
        title: 'Activate ${singularPCSpaced}',
        text: 'Are you sure you want to activate this item?'
      })

      this.$store.dispatch('activate${singularPC}', item.${singularSC}_id).then(() => {
        this.$refs.vTable.init()
      })
    },
    async onDeactivate(item) {
      await this.$confirm({
        title: 'Deactivate ${singularPCSpaced}',
        text: 'Are you sure you want to deactivate this item?'
      })

      this.$store.dispatch('deactivate${singularPC}', item.${singularSC}_id).then(() => {
        this.$refs.vTable.init()
      })
    },`
    }

    methods += `
  }`
    return methods
  }

  // Generate create button based on use cases
  const generateCreateButton = () => {
    if (useCases.includes('create')) {
      return `    <template #buttons>
      <FormButton @click="openForm">
        <i class="fa fa-plus mr-2"></i>
        New ${singularPCSpaced}
      </FormButton>
    </template>`
    }
    return ''
  }

  // Generate form modal based on use cases
  const generateFormModal = () => {
    if (useCases.includes('create') || useCases.includes('update')) {
      return `
  <${pluralPC}Form v-if="showForm" @close="closeForm" :item="selectedItem" @onSave="getData" />`
    }
    return ''
  }

  // Generate component imports
  const generateImports = () => {
    let imports = `import Widget from '@/components/Widget.vue'`

    if (useCases.includes('create')) {
      imports += `
import FormButton from '@/components/Form/FormButton.vue'`
    }

    if (useCases.includes('create') || useCases.includes('update') || useCases.includes('show')) {
      imports += `
import ${pluralPC}Form from './${pluralPC}Form.vue'`
    }

    return imports
  }

  // Generate component registration
  const generateComponents = () => {
    let components = `  components: {
    Widget`
    
    if (useCases.includes('create')) {
      components += `,
    FormButton`
    }

    if (useCases.includes('create') || useCases.includes('update') || useCases.includes('show')) {
      components += `,
    ${pluralPC}Form`
    }

    components += `
  },`
    return components
  }

  // Generate data properties
  const generateData = () => {
    let data = `  data: () => ({
    vTable: {
      filters: [],
${generateHeaders()}
${generateActions()}
      values: {},
    }`

    if (useCases.includes('create') || useCases.includes('update') || useCases.includes('show')) {
      data += `,
    showForm: false,
    selectedItem: null`
    }

    data += `
  }),`
    return data
  }

  const deleteEvent = useCases.includes('delete') ? `
      @onDelete="onDelete"` : ''

  const softDeleteEvent = useCases.includes('soft_delete') ? `
      @onActivate="onActivate"
      @onDeactivate="onDeactivate"` : ''

  return `<template>
  <Widget>
    <template #title>${pluralPCSpaced}</template>${generateCreateButton()}
    <vue-table
      ref="vTable"
      :values="vTable.values"
      :headers="vTable.headers"
      :actions="vTable.actions"
      :filters="vTable.filters"
      clickeableRows
      @changed="getData"
      @rowClicked="onShowDetails"${softDeleteEvent}${deleteEvent}      
    />
  </Widget>${generateFormModal()}
</template>

<script>
${generateImports()}

export default {
${generateComponents()}
${generateData()}
${generateMethods()}
}
</script>

<style></style>
`
}
