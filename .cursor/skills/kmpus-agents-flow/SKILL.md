---
name: yrfitness-admin-agents-flow
description: Explains how to use YRFitness Admin agents (implementation-agent-frontend, reviewer-agent-frontend, qa-agent-frontend) and the recommended workflow for feature development. Use when implementing features or understanding the development process.
---

# YRFitness Admin - Agents and Development Flow

## Agents Overview

The Admin Dashboard has three agents for feature implementation:

| Agent | Location | Role |
|-------|----------|------|
| **implementation-agent-frontend** | `admin/.cursor/agents/implementation-agent-frontend.md` | Implements one feature task (Vuex modules, views, components, routes). Produces production-ready code. |
| **reviewer-agent-frontend** | `admin/.cursor/agents/reviewer-agent-frontend.md` | Reviews code for Vue 3/Vuex 4 patterns, scope, error handling. Output: APPROVED / REQUEST_CHANGES. |
| **qa-agent-frontend** | `admin/.cursor/agents/qa-agent-frontend.md` | Generates unit tests for store modules and components using Jest/@vue/test-utils. |

---

## Development Workflow

### Step 1: Plan the Feature

Describe what you want to build:

```
"Implementa una nueva página de administración de usuarios con:
- Listado de usuarios en tabla
- Búsqueda y filtrado
- Crear/editar/eliminar usuario
- Validación de formulario
- Mensajes de éxito/error"
```

### Step 2: Implement with Implementation-Agent

Invoke the implementation agent with your feature description:

```
"Usa implementation-agent-frontend para crear la página de usuarios.
Crea:
1. Vuex store module (_users.js) con actions para API
2. Vista Dashboard/Users/Index.vue con tabla de usuarios
3. Vista Dashboard/Users/Create.vue con formulario
4. Actualiza router/index.js y router/menus.js
5. Sigue los patrones en README_ai.md"
```

The agent will:
- ✅ Create/update files needed for the feature
- ✅ Follow Vue 3 Options API patterns
- ✅ Use Vuex 4 for state management
- ✅ Implement error handling with toasts
- ✅ Handle loading states
- ✅ Update routes and menus

### Step 3: Review with Reviewer-Agent

After implementation, request a code review:

```
"Revisa el código implementado con reviewer-agent-frontend.
Verifica:
- Vuex store patterns correctos
- Rutas y menús actualizados
- Manejo de errores
- Estados de carga
- Criterios de aceptación cumplidos"
```

The reviewer will:
- ✅ Check architecture compliance
- ✅ Verify scope (files touched vs scope array)
- ✅ Check error handling and edge cases
- ✅ Verify routes/menus updated
- ✅ Report APPROVED or REQUEST_CHANGES

**If REQUEST_CHANGES**: Fix issues and request another review.
**If APPROVED**: Proceed to testing.

### Step 4: Test with QA-Agent (Optional but Recommended)

Generate tests for the implementation:

```
"Usa qa-agent-frontend para generar tests para la página de usuarios.
Crea tests para:
- Vuex actions (success/error paths)
- Component rendering (items, empty state)
- User interactions (clicks, form submission)
- Router navigation"
```

The QA agent will:
- ✅ Create `.spec.js` test files
- ✅ Mock API calls and store
- ✅ Test edge cases (empty, error, loading)
- ✅ Provide mock data
- ✅ Test user interactions

### Step 5: Commit and Create PR

Commit your changes:

```bash
git add .
git commit -m "feat: Add users management page

- Create Vuex store module for users CRUD
- Add Users list, create, and edit views
- Add routes and menu items
- Implement form validation and error handling
- Add unit tests for store and components"
```

Push and create a pull request for review.

---

## Quick Reference: Agent Invocation

### Implement a Feature

```
"Implementa [descripción de tarea] usando implementation-agent-frontend.
Scope:
- src/store/_feature.js
- src/views/Dashboard/Feature/Index.vue
- src/views/Dashboard/Feature/Form.vue
- src/router/index.js
- src/router/menus.js

Criterios de aceptación:
1. [Criterion 1]
2. [Criterion 2]
3. [Criterion 3]"
```

### Review Implementation

```
"Usa reviewer-agent-frontend para revisar el código de [feature name].
Verifica:
- Patrones Vuex correctos
- Rutas y menús actualizados
- Manejo de errores completo
- Estados de carga implementados
- Criterios de aceptación cumplidos"
```

### Generate Tests

```
"Usa qa-agent-frontend para crear tests para [feature name].
Cubre:
- Vuex store (actions, mutations, getters)
- Componentes de vista (rendering, eventos)
- Casos edge (vacío, error, cargando)
- Navegación de router"
```

---

## Project Structure Reference

```
admin/
├── src/
│   ├── components/        # Reusable components
│   ├── views/            # Page components
│   │   ├── Auth/         # Login, password reset
│   │   └── Dashboard/    # Main authenticated area
│   ├── router/
│   │   ├── index.js      # Route definitions
│   │   └── menus.js      # Menu/sidebar configuration
│   ├── store/
│   │   ├── index.js      # Store root
│   │   ├── _auth.js      # Auth module
│   │   └── _loader.js    # Loader module
│   ├── utils/            # Helper functions
│   ├── plugins/          # Vue plugins
│   ├── assets/           # Static assets
│   ├── App.vue
│   └── main.js
├── package.json
├── README_ai.md          # Architecture guide for AI
└── .cursor/
    ├── agents/           # Implementation, reviewer, QA agents
    └── skills/           # Development workflow documentation
```

---

## Common Patterns

### Creating a Vuex Module

Store modules go in `src/store/_<name>.js`:

```javascript
export default {
  state: () => ({
    items: [],
    currentItem: null,
  }),
  mutations: {
    setItems(state, items) {
      state.items = items
    },
  },
  actions: {
    loadItems({ commit }) {
      commit('loader/setLoading', true, { root: true })
      // API call with then/catch/finally
    },
  },
  getters: {
    items: (state) => state.items,
  },
}
```

### Creating a View Component

Views go in `src/views/Dashboard/<Feature>/Index.vue`:

```vue
<template>
  <div class="view-container">
    <!-- UI here -->
  </div>
</template>

<script>
export default {
  name: 'FeatureName',
  data() {
    return {
      items: [],
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$store.commit('loader/setLoading', true)
      // Load and render items
    },
  },
}
</script>

<style scoped>
/* Scoped styles only */
</style>
```

### Adding Routes

Edit `src/router/index.js` under DashboardLayout:

```javascript
{
  path: '/feature-name',
  component: () => import('@/views/Dashboard/FeatureName/Index.vue'),
}
```

Then add to `src/router/menus.js`:

```javascript
{
  title: 'Feature Name',
  icon: 'icon-class',
  to: '/feature-name'
}
```

---

## Best Practices

✅ **Always read README_ai.md** before implementing  
✅ **Use existing components** in `src/components/`  
✅ **Implement error handling** with `this.$toast.error()`  
✅ **Show loading states** using Vuex loader  
✅ **Use path aliases** (`@/` prefix)  
✅ **Keep styles scoped** to components  
✅ **Mock API calls** in tests  
✅ **Test edge cases** (empty, error, loading)  

❌ **Don't hardcode URLs** or credentials  
❌ **Don't call APIs** from components  
❌ **Don't skip error handling**  
❌ **Don't add TODOs** in code  
❌ **Don't use async/await** in actions  

---

## Troubleshooting

**Q: Route added but not visible in menu**  
A: Update `src/router/menus.js` with the new route

**Q: API call not working**  
A: Move the call from component to Vuex action. Use `clients` from `utils/clients.js`

**Q: Component not responsive**  
A: Use Bootstrap grid classes (row, col-*, d-flex) and test on different screen sizes

**Q: State not updating**  
A: Ensure you're using mutations in actions (commit), not direct state modification

**Q: Tests failing**  
A: Mock API calls and store. Don't hit real backend in unit tests

---

## Resources

- `README_ai.md` - Complete architecture guide
- `.cursor/agents/implementation-agent-frontend.md` - Implementation patterns
- `.cursor/agents/reviewer-agent-frontend.md` - Code review standards
- `.cursor/agents/qa-agent-frontend.md` - Testing patterns
