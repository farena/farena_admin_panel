import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VCalendar from 'v-calendar'
import toast from './utils/toast'
import alert from './utils/alert'
import errorHandler from './utils/errorHandler'
import VueTables from './components/Tables'
import VueModal from './components/Modal'
import clients from './utils/clients'
import validator from './utils/validator'

import 'v-calendar/dist/style.css'
import './assets/scss/styles.scss'
import '@farena/fa-editor/style.css'
import './components/Tables/utils/ucwords'

import { loader } from '@guolao/vue-monaco-editor'
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs'
  }
})

createApp(App)
  .use(store)
  .use(router)
  .use(toast)
  .use(alert)
  .use(errorHandler)
  .use(VCalendar, {})
  .use(VueTables)
  .use(VueModal)
  .use(clients)
  .use(validator)
  .mount('#app')
