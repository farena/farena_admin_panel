<template>
  <FormText
    label="Email"
    icon="fa-solid fa-envelope"
    v-model="form.email"
    @keyup.enter="resetPassword"
  />

  <button class="btn btn-primary btn-block" @click="resetPassword">Reset Password</button>

  <router-link class="small text-center d-block mt-2" :to="{ name: 'login' }">
    Back to Login
  </router-link>
</template>

<script>
import FormText from '@/components/Form/FormText.vue'

export default {
  components: {
    FormText
  },
  data: () => ({
    form: {
      email: null
    }
  }),
  methods: {
    resetPassword() {
      if (!this.form.email) {
        this.$toast.error('Please send an email')
        return
      }

      this.$store.dispatch('forgotPassword', this.form).then(() => {
        this.$toast.success('Password reset has been sent. Please check your email')
      })
    }
  }
}
</script>
