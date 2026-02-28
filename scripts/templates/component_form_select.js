/* eslint-disable no-undef */
module.exports = function generateFormSelect(nameVariants, fields = []) {
  const { 
    singularSC, pluralSC, pluralPC 
  } = nameVariants

  // Determine the label field based on available fields
  const getLabelField = () => {
    if (fields.length === 0) return 'name'
    
    // Look for common label fields
    const labelFields = ['name', 'title', 'label', 'description']
    for (const labelField of labelFields) {
      if (fields.some(f => f.name === labelField)) {
        return labelField
      }
    }
    
    // If no common label field found, use the first string field
    const stringField = fields.find(f => f.type === 'STRING' || f.type === 'TEXT')
    if (stringField) return stringField.name
    
    // Fallback to first field name
    return fields[0]?.name || 'name'
  }

  const vuexAction = `get${pluralPC}List`
  const labelField = getLabelField()

  return `<template>
  <FormSelect
    v-model="result"
    :options="options"
    :disabled="disabled"
    :loading="loading"
    :optionValue="optionValue"
    :optionLabel="optionLabel"
  />
</template>

<script>
import SelectMixin from './selectMixin'

export default {
  mixins: [SelectMixin],
  data: () => ({
    vuex_action: '${vuexAction}',
    vuex_getter: '${pluralSC}',
    primaryKey: '${singularSC}_id',
    optionLabel: '${labelField}',
    optionValue: '${singularSC}_id'
  })
}
</script>
`
}
