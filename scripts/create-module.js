/* eslint-disable no-undef */
const fs = require('fs')
const { getFile, createFile } = require('./utils/folders.js')
const viewTableTemplate = require('./templates/view_table.js')
const viewFormModalTemplate = require('./templates/view_form_modal.js')
const componentFormSelectTemplate = require('./templates/component_form_select.js')
const menuTemplate = require('./templates/menu.js')
const routeTemplate = require('./templates/route.js')

module.exports = function createModule(nameVariants, { selector, menu, fields = [], use_cases = [] }) {
  createRoute(nameVariants, fields, use_cases)
  createTableView(nameVariants, fields, use_cases)

  if(use_cases.includes('create') || use_cases.includes('update') || use_cases.includes('show')) {
    createFormModal(nameVariants, fields, use_cases)
  }

  if (selector) createSelector(nameVariants, fields)
  if (menu) createMenu(nameVariants)
}

function createTableView(nameVariants, fields, useCases) {
  const template = viewTableTemplate(nameVariants, fields, useCases)

  createFile(`../../src/views/Dashboard/${nameVariants.pluralPC}.vue`, template)

  console.log(`Table view created in /src/views/Dashboard/${nameVariants.pluralPC}.vue`)
}

function createFormModal(nameVariants, fields, useCases) {
  const template = viewFormModalTemplate(nameVariants, fields, useCases)

  createFile(`../../src/views/Dashboard/${nameVariants.pluralPC}Form.vue`, template)

  console.log(`Form view created in /src/views/Dashboard/${nameVariants.pluralPC}Form.vue`)
}

function createSelector(nameVariants, fields) {
  const template = componentFormSelectTemplate(nameVariants, fields)

  createFile(`../../src/components/Selects/${nameVariants.singularPC}Select.vue`, template)

  console.log(`Selector created in /src/components/Selects/${nameVariants.singularPC}Select.vue`)

  injectSelector(nameVariants)
}

function injectSelector({ singularPC, singularCC }) {
  // Inject into selectModules file
  const relPath = getFile('../../src/components/Selects/_select-modules.js')

  const fileLines = fs.readFileSync(relPath).toString().split('\n')
  let lineToAppendImport
  let lineToAppendExport

  fileLines.forEach((line, index) => {
    if (line.slice(0, 16) === 'export default {') {
      lineToAppendImport = index - 1
      lineToAppendExport = index + 2
    }
  })

  // Import new Selector
  fileLines.splice(
    lineToAppendImport,
    0,
    `import ${singularPC}Select from './${singularPC}Select.vue';`
  )

  // Export new Selector
  fileLines.splice(lineToAppendExport, 0, `  ${singularCC}: ${singularPC}Select,`)

  fs.writeFile(relPath, fileLines.join('\n'), (err) => {
    if (err) throw err
    else {
      console.log('Selector injected in /src/components/Selects/_select-modules.js')
    }
  })
}

function createMenu(nameVariants) {
  const relPath = getFile('../../src/router/menus.js')
  const template = menuTemplate(nameVariants)

  const fileLines = fs.readFileSync(relPath).toString().split('\n')
  let lineToAppendImport

  fileLines.forEach((line, index) => {
    if (line.slice(0, 1) === ']') {
      lineToAppendImport = index
    }
  })

  // create new menu
  fileLines[lineToAppendImport - 1] = fileLines[lineToAppendImport - 1] + ','
  fileLines.splice(lineToAppendImport, 0, template)

  fs.writeFile(relPath, fileLines.join('\n'), (err) => {
    if (err) throw err
    else {
      console.log('Menu added in /src/router/menus.js')
    }
  })
}

function createRoute(nameVariants) {
  const relPath = getFile('../../src/router/index.js')
  const template = routeTemplate(nameVariants)

  const fileLines = fs.readFileSync(relPath).toString().split('\n')
  let lineToAppendImport

  fileLines.forEach((line, index) => {
    if (line === "const router = createRouter({") {
      lineToAppendImport = index - 4
    }
  })

  // create new route
  fileLines[lineToAppendImport - 1] = fileLines[lineToAppendImport - 1] + ','
  fileLines.splice(lineToAppendImport, 0, template)

  fs.writeFile(relPath, fileLines.join('\n'), (err) => {
    if (err) throw err
    else {
      console.log('Route added in /src/router/index.js')
    }
  })
}
