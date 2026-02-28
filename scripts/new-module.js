/* eslint-disable no-undef */
const yargsInteractive = require('yargs-interactive')
const { parseName, parseFields } = require('./utils/name-parser.js')
const createStore = require('./create-store.js')
const createModule = require('./create-module.js')

try {
  const options = {
    interactive: { default: true },
    name: {
      type: 'input',
      describe: 'Enter a name for the module',
      prompt: 'if-no-arg',
      validate(value) {
        if (!value) return 'The name is required'
        return true
      },
    },
    use_cases: {
      type: 'checkbox',
      prompt: 'if-no-arg',
      describe: 'Select default use cases',
      choices: [
        {
          name: 'Paginable List',
          value: 'paginate',
        },
        {
          name: 'List',
          value: 'list',
        },
        {
          name: 'Show',
          value: 'show',
        },
        {
          name: 'Create',
          value: 'create',
        },
        {
          name: 'Update',
          value: 'update',
        },
        {
          name: 'Delete',
          value: 'delete',
        },
        {
          name: 'Soft Delete',
          value: 'soft_delete',
        },
        {
          name: 'Validate',
          value: 'validate',
        },
      ],
      validate(value) {
        if (!value.length) return 'Select at least one use case';
        return true;
      },
    },
    selector: {
      type: 'confirm',
      prompt: 'if-no-arg',
      describe: 'Create selector',
      default: false,
    },
    menu: {
      type: 'confirm',
      prompt: 'if-no-arg',
      describe: 'Create menu',
      default: true,
    },
    fields: {
      type: 'input',
      prompt: 'if-no-arg',
      describe: 'Enter the fields for the model (format: name:TYPE;name2:TYPE2)',
      default: '',
    },
  }

  yargsInteractive()
    .usage('$0 <command> [args]')
    .interactive(options)
    .then(async (result) => {
      const nameVariants = parseName(result.name)
      const fields = parseFields(result.fields)

      createStore(nameVariants, result.use_cases)
      createModule(nameVariants, {
        selector: result.selector,
        menu: result.menu,
        fields: fields,
        use_cases: result.use_cases
      })
    })
} catch (error) {
  console.error(error)
}
