<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <Widget>
        <template #title> Cambiar Password </template>

        <form @submit.prevent="savePassword">
          <FormText label="Nueva Password" password v-model="form.new_password" />
          <FormText
            label="Repetir Nueva Password"
            password
            v-model="form.new_password_confirmation"
          />
          <FormText label="Password Actual" password v-model="form.password" />

          <hr />

          <FormButton theme="primary" block type="submit">Guardar</FormButton>
        </form>
      </Widget>
    </div>
  </div>
</template>

<script>
import FormButton from '@/components/Form/FormButton.vue'
import FormText from '@/components/Form/FormText.vue'
import Widget from '@/components/Widget.vue'

export default {
  components: {
    FormText,
    Widget,
    FormButton
  },
  data: () => ({
    form: {
      new_password: null,
      new_password_confirmation: null,
      password: null
    }
  }),
  methods: {
    savePassword() {
      this.$store.dispatch('updateProfile', this.form)
    }
  }
}
</script>
