<template>
  <FormText label="Password" password icon="fa-solid fa-fingerprint" v-model="form.password" />
  <FormText
    label="Password Confirmation"
    password
    icon="fa-solid fa-fingerprint"
    v-model="form.password_confirmation"
    @keyup.enter="resetPassword"
  />

  <FormButton theme="primary" block @click="resetPassword">Reset Password</FormButton>

  <router-link class="small text-center d-block mt-2" :to="{ name: 'login' }">
    Back to Login
  </router-link>
</template>

<script>
import FormText from '@/components/Form/FormText.vue'
import FormButton from '@/components/Form/FormButton.vue'

export default {
  components: {
    FormText,
    FormButton
  },
  data: () => ({
    form: {
      token: null,
      password: null,
      password_confirmation: null
    }
  }),
  mounted() {
    this.form.token = this.$route.params.token
  },
  methods: {
    resetPassword() {
      this.$store.dispatch('resetPassword', this.form).then(() => {
        this.$toast.success('Password updated. You can now sign in')
        this.$router.push({ name: 'login' })
      })
    }
  }
}
</script>
