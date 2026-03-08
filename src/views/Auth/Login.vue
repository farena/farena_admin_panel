<template>
  <FormText label="Email" icon="fa-solid fa-envelope" v-model="form.email" />
  <FormText
    label="Password"
    password
    icon="fa-solid fa-fingerprint"
    v-model="form.password"
    @keyup.enter="signIn"
  />
  <FormSwitch label="Remember me" v-model="form.remember" small />

  <FormButton theme="primary" block class="mt-4" @click="signIn">Log In</FormButton>

  <router-link class="small text-center d-block mt-2" :to="{ name: 'forgotPassword' }">
    Forgot your password?
  </router-link>
</template>

<script>
import FormText from '@/components/Form/FormText.vue'
import FormSwitch from '@/components/Form/FormSwitch.vue'
import FormButton from '@/components/Form/FormButton.vue'

export default {
  components: {
    FormText,
    FormSwitch,
    FormButton
  },
  data: () => ({
    form: {
      email: null,
      password: null,
      remember: true
    }
  }),
  beforeMount() {
    const default_email = localStorage.getItem('default_email')
    const default_pw = localStorage.getItem('default_pw')
    if (default_email) this.form.email = default_email
    if (default_pw) this.form.password = default_pw
  },
  methods: {
    signIn() {
      this.$store.dispatch('login', this.form).then(() => {
        this.$router.push('/dashboard')
      })
    }
  }
}
</script>
