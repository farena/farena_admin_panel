<template>
  <FormSelect :options="options" />
</template>

<script>
import FormSelect from './FormSelect.vue'

export default {
  components: {
    FormSelect
  },
  data: () => ({
    options: [
      {
        value: true,
        label: 'Si'
      },
      {
        value: false,
        label: 'No'
      }
    ]
  })
}
</script>

<style></style>
