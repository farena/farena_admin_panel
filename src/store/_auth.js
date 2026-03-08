import $router from '../router/index'

export default {
  state: () => ({
    token: null,
    user: null
  }),
  mutations: {
    SET_TOKEN(state, value) {
      if (value) localStorage.setItem('token', value)
      else localStorage.removeItem('token')
      state.token = value
    },
    SET_USER(state, value) {
      if (value) localStorage.setItem('user', JSON.stringify(value))
      else localStorage.removeItem('user')
      state.user = value
    },
    SET_REFRESH_TOKEN(state, value) {
      if (value) localStorage.setItem('refresh_token', value)
      else localStorage.removeItem('refresh_token')
      state.refresh_token = value
    }
  },
  actions: {
    setCredentials({ commit }) {
      commit('SET_TOKEN', localStorage.getItem('token'))
      commit('SET_USER', JSON.parse(localStorage.getItem('user')))
      commit('SET_REFRESH_TOKEN', localStorage.getItem('refresh_token'))
    },
    login({ commit }) {
      commit('SHOW_LOADER')

      commit('SET_TOKEN', 'test')
      commit('SET_USER', 'test')
      commit('HIDE_LOADER')

      // return new Promise((resolve) => {
      //   this.$clients.api
      //     .post('login', form)
      //     .then(({ data }) => {
      //       if (form.remember) {
      //         localStorage.setItem('default_email', form.email)
      //         localStorage.setItem('default_pw', form.password)
      //       } else {
      //         localStorage.removeItem('default_email')
      //         localStorage.removeItem('default_pw')
      //       }
      //       commit('SET_TOKEN', data.data.token)
      //       commit('SET_USER', data.data.user)
      //       commit('SET_REFRESH_TOKEN', data.data.refresh_token)
      //       resolve()
      //     })
      //     .catch(this.$errorHandler)
      //     .finally(() => {
      //       commit('HIDE_LOADER')
      //     })
      // })
    },
    loginAsUser({ commit }, user_id) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .post(`login/${user_id}`)
          .then(({ data }) => {
            const admin_token = localStorage.getItem('token')
            const admin_user = localStorage.getItem('user')

            localStorage.setItem('admin_token', admin_token)
            localStorage.setItem('admin_user', admin_user)

            return data
          })
          .then(({ data }) => {
            commit('SET_TOKEN', data.token)
            commit('SET_USER', data.user)
            resolve()
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
            $router.push('/')
          })
      })
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('refresh_token')
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
        commit('SET_REFRESH_TOKEN', null)
        $router.push('/login')
        resolve()
      })
    },
    logoutToAdmin({ commit }) {
      commit('SHOW_LOADER')

      const admin_token = localStorage.getItem('admin_token')
      const admin_user = localStorage.getItem('admin_user')

      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')

      commit('SET_TOKEN', admin_token)
      commit('SET_USER', admin_user)

      commit('HIDE_LOADER')

      $router.push('/')
    },

    forgotPassword({ commit }, form) {
      commit('SHOW_LOADER')
      return new Promise((resolve) => {
        this.$clients.api
          .post('forgot_password', form)
          .then(({ data }) => {
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },

    resetPassword({ commit }, { token, ...form }) {
      commit('SHOW_LOADER')
      return new Promise((resolve) => {
        this.$clients.api
          .post('reset_password/' + token, form)
          .then(({ data }) => {
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },

    verifyUser({ commit }, { token, ...form }) {
      commit('SHOW_LOADER')
      return new Promise((resolve) => {
        this.$clients.api
          .post(`users/${token}/verify`, form)
          .then(({ data }) => {
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },

    updateProfile({ commit, getters, dispatch }, form) {
      commit('SHOW_LOADER')
      return new Promise((resolve) => {
        this.$clients.api
          .put(
            'profile',
            {
              email: getters.user.email,
              ...form
            },
            {
              headers: {
                Authorization: `Bearer ${getters.token}`
              }
            }
          )
          .then(({ data }) => {
            this.$toast.success(data.data)
            dispatch('logout')
            resolve()
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    }
  },
  getters: {
    isLoggedIn(state) {
      return state.token !== null
    },
    token(state) {
      return state.token
    },
    refresh_token(state) {
      return state.refresh_token
    },
    user(state) {
      return state.user
    },
  }
}
