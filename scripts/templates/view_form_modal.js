/* eslint-disable no-undef */
module.exports = function generateFormModal(nameVariants, fields = [], useCases = []) {
  const { 
    singularSC, singularPC, singularPCSpaced 
  } = nameVariants

  // Generate form fields based on fields array
  const generateFormFields = () => {
    if (fields.length === 0) {
      // Default field if none specified
      return `        <FormText label="Name" flex-field v-model="form.name" />`
    }

    return fields.map(field => {
      const label = field.name.charAt(0).toUpperCase() + field.name.slice(1)
      
      switch (field.type) {
        case 'STRING':
          return `        <FormText label="${label}" flex-field v-model="form.${field.name}" />`
        case 'TEXT':
          return `        <FormText textarea label="${label}" flex-field v-model="form.${field.name}" />`
        case 'INTEGER':
          return `        <FormNumber label="${label}" flex-field v-model="form.${field.name}" />`
        case 'BOOLEAN':
          return `        <FormSwitch label="${label}" v-model="form.${field.name}" />`
        case 'DATE':
        case 'DATEONLY':
          return `        <FormDate label="${label}" flex-field v-model="form.${field.name}" />`
        case 'ENUM': {
          return `        <FormSelect 
          label="${label}" 
          flex-field 
          v-model="form.${field.name}"
          :options="field.name_options" 
        />`
        }
        default:
          return `        <FormText label="${label}" flex-field v-model="form.${field.name}" />`
      }
    }).join('\n')
  }

  // Generate form data properties
  const generateFormData = () => {
    if (fields.length === 0) {
      return `      form: {
        name: null,
      }`
    }

    const enumFields = fields.filter(field => field.type === 'ENUM')
    let enumFieldsOptions = ''
    if(enumFields.length > 0) {
      enumFieldsOptions = `,\n`
      enumFieldsOptions = enumFields.map(field => `        ${field.name}_options: [${field.enumValues.map(val => `{ value: '${val}', label: '${val}' }`).join(',\n')}]`).join(',\n')
    }

    const formFields = fields.map(field => `        ${field.name}: null`).join(',\n')
    return `
      form: {
${formFields}
      }${enumFieldsOptions}`
  }

  // Generate component imports based on field types
  const generateImports = () => {
    let imports = [`FormButton`]
    
    if (fields.length === 0) {
      imports.push('FormText')
    } else {
      const fieldTypes = new Set(fields.map(f => f.type))
      
      if (fieldTypes.has('STRING') || fieldTypes.has('TEXT')) {
        imports.push('FormText')
      }
      if (fieldTypes.has('INTEGER')) {
        imports.push('FormNumber')
      }
      if (fieldTypes.has('BOOLEAN')) {
        imports.push('FormSwitch')
      }
      if (fieldTypes.has('DATE') || fieldTypes.has('DATEONLY')) {
        imports.push('FormDate')
      }
      if (fieldTypes.has('ENUM')) {
        imports.push('FormSelect')
      }
    }

    return imports.map(imp => `  import ${imp} from '@/components/Form/${imp}.vue'`).join('\n')
  }

  // Generate component registration
  const generateComponents = () => {
    let components = [`FormButton`]
    
    if (fields.length === 0) {
      components.push('FormText')
    } else {
      const fieldTypes = new Set(fields.map(f => f.type))
      
      if (fieldTypes.has('STRING') || fieldTypes.has('TEXT')) {
        components.push('FormText')
      }
      if (fieldTypes.has('INTEGER')) {
        components.push('FormNumber')
      }
      if (fieldTypes.has('BOOLEAN')) {
        components.push('FormSwitch')
      }
      if (fieldTypes.has('DATE') || fieldTypes.has('DATEONLY')) {
        components.push('FormDate')
      }
      if (fieldTypes.has('ENUM')) {
        components.push('FormSelect')
      }
    }

    return components.map(comp => `      ${comp}`).join(',\n')
  }

  // Generate save method based on use cases
  const generateSaveMethod = () => {
    let saveMethod = `     async saveForm() {`

    if (useCases.includes('validate')) {
      saveMethod += `
        if(!this.validate()) return`
    }

    if (useCases.includes('update')) {
      saveMethod += `
        if (this.item) {
          await this.$store.dispatch('update${singularPC}', {
            ${singularSC}_id: this.item.${singularSC}_id,
            form: this.form
          })
        }`
    }

    if (useCases.includes('create')) {
      if (useCases.includes('update')) {
        saveMethod += ` else {`
      } else {
        saveMethod += `
        if (!this.item) {`
      }
      saveMethod += `
          await this.$store.dispatch('create${singularPC}', this.form)
        }`
    }

    saveMethod += `

      this.$emit('onSave')
      this.close()
    }`

    return saveMethod
  }

  const generateValidateMethod = () => {
    if (useCases.includes('validate')) {
      const rules = fields.length > 0 
        ? fields.map(field => `        ${field.name}: 'required'`).join(',\n') 
        : `        name: 'required'`
      const messages = fields.length > 0 
        ? fields.map(field => `        'required.${field.name}': '${field.name} is required'`).join(',\n') 
        : `        'required.name': 'Name is required'`

      return `
    validate() {
      const rules = {\n${rules}        };
      const messages = {\n${messages}        };

      return this.$validate(this.form, rules, messages)
    },`
    }
  }


  return `<template>
  <vue-modal @close="$emit('close')" ref="modal" size="sm" position="center">
    <template #title>${singularPCSpaced} Form</template>
    <template #body>
${generateFormFields()}
    </template>
    <template #footer>
      <FormButton block icon="fa-save" small theme="medium" class="mr-1" @click="close">
        Cancel
      </FormButton>
      <FormButton block icon="fa-save" small @click="saveForm"> Save </FormButton>
    </template>
  </vue-modal>
</template>

<script>
${generateImports()}

export default {
  components: {
${generateComponents()}
  },
  props: {
    item: {
      type: Object
    }
  },
  data: () => ({${generateFormData()}
  }),
  mounted() {
    if (this.item) {
      this.form = { ...this.item }
    }
  },
  methods: {
    close() {
      this.$refs.modal.close()
    },
${generateValidateMethod()}
${generateSaveMethod()}
  }
}
</script>

<style></style>
`
}
