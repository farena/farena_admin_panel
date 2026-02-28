/* eslint-disable no-undef */
module.exports = function generateStore(nameVariants, useCases = []) {
  const { 
    singularSC, singularPC, pluralSC, pluralPC, pluralUSC 
  } = nameVariants

  // Generate initial state based on fields
  const generateState = () => {
    let state = `  state: {
    ${pluralSC}: [],
  },`
    return state
  }

  // Generate mutations based on use cases
  const generateMutations = () => {
    let mutations = `  mutations: {
    SET_${pluralUSC}(state, value) {
      state.${pluralSC} = value
    }
  },`
    return mutations
  }

  // Generate actions based on use cases
  const generateActions = () => {
    let actions = `  actions: {`

    if (useCases.includes('paginate')) {
      actions += `
    get${pluralPC}PaginableList({ commit }, params) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .get(\`${pluralSC}\`, {
            params,
          })
          .then(({ data }) => {
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },`
    }

    if (useCases.includes('list')) {
      actions += `
    get${pluralPC}List({ commit, getters }, params) {
      return new Promise((resolve) => {
        if (!this.$clients.api.canFetch('${pluralSC}', params)) {
          resolve(getters.${pluralSC})
          return
        }

        commit('SHOW_LOADER')

        this.$clients.api
          .get(\`${pluralSC}\`, {
            params,
            list: true,
            persist: true,
          })
          .then(({ data }) => {
            commit('SET_${pluralUSC}', data.data)
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },`
    }

    if (useCases.includes('show')) {
      actions += `
    show${singularPC}({ commit }, ${singularSC}_id) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .get(\`${pluralSC}/\${${singularSC}_id}\`)
          .then(({ data }) => {
            commit('SET_CURRENT_${singularPC.toUpperCase()}', data.data)
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },`
    }

    if (useCases.includes('create')) {
      actions += `
    create${singularPC}({ commit }, form) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .post(\`${pluralSC}\`, form)
          .then(({ data }) => {
            this.$toast.success(data.data)
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },`
    }

    if (useCases.includes('update')) {
      actions += `
    update${singularPC}({ commit }, { ${singularSC}_id, form }) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .put(\`${pluralSC}/\${${singularSC}_id}\`, form)
          .then(({ data }) => {
            this.$toast.success(data.data)
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },`
    }

    if (useCases.includes('delete')) {
      actions += `
    delete${singularPC}({ commit }, ${singularSC}_id) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .delete(\`${pluralSC}/\${${singularSC}_id}\`)
          .then(({ data }) => {
            this.$toast.success(data.data)
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },`
    }

    if (useCases.includes('soft_delete')) {
      actions += `
    deactivate${singularPC}({ commit }, ${singularSC}_id) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .put(\`${pluralSC}/\${${singularSC}_id}/deactivate\`)
          .then(({ data }) => {
            this.$toast.success(data.data)
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },
    
    activate${singularPC}({ commit }, ${singularSC}_id) {
      commit('SHOW_LOADER')

      return new Promise((resolve) => {
        this.$clients.api
          .put(\`${pluralSC}/\${${singularSC}_id}/activate\`)
          .then(({ data }) => {
            this.$toast.success(data.data)
            resolve(data.data)
          })
          .catch(this.$errorHandler)
          .finally(() => {
            commit('HIDE_LOADER')
          })
      })
    },`
    }

    actions += `
  },`
    return actions
  }

  // Generate getters
  const generateGetters = () => {
    let getters = `  getters: {
    ${pluralSC}: (state) => state.${pluralSC},
  }`
    return getters
  }

  return `export default {
${generateState()}
${generateMutations()}
${generateActions()}
${generateGetters()}
}
`
}
