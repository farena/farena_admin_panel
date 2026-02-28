# README_ai.md - Guía de Arquitectura para IA

## Visión General del Proyecto

Este proyecto es un **panel de administración (Admin Dashboard)** construido con **Vue 3**, **Vite** y **Vuex**, diseñado para gestionar las operaciones del sistema YRFitness. Es una aplicación frontend monolítica que proporciona una interfaz de usuario moderna y responsiva para administradores.

**Stack Tecnológico:**
- Vue 3 (framework JavaScript reactivo)
- Vite (herramienta de bundling y desarrollo)
- Vue Router v4 (enrutamiento)
- Vuex v4 (gestión de estado)
- Axios (cliente HTTP)
- Bootstrap 4.6.1 (framework CSS)
- SCSS (preprocesador CSS)
- CKEditor 5 (editor de contenido HTML)
- v-calendar 3 (calendario)
- VueToastification (notificaciones)
- SweetAlert2 (alertas personalizadas)

---

## Estructura del Proyecto

```
admin/
├── src/
│   ├── components/          # Componentes Vue reutilizables
│   │   ├── Form/            # Componentes de formularios
│   │   ├── FormSections/    # Secciones de formularios
│   │   ├── Tables/          # Componentes de tablas
│   │   ├── Modal/           # Sistema de modales
│   │   ├── Comboboxes/      # Dropdowns/selects
│   │   ├── Selects/         # Selects personalizados
│   │   ├── Lists/           # Listas (incluyendo draggable)
│   │   ├── Gallery/         # Galería de imágenes
│   │   ├── Tabs/            # Sistema de pestañas
│   │   ├── HtmlEditor/      # Editor de HTML (con Monaco)
│   │   ├── WidgetCounter.vue
│   │   ├── FullPageLoader.vue
│   │   ├── InactiveModal.vue
│   │   ├── Topbar.vue
│   │   └── SimplePager.vue
│   ├── views/               # Vistas/páginas principales
│   │   ├── Auth/            # Vistas de autenticación
│   │   │   ├── AuthLayout.vue
│   │   │   ├── Login.vue
│   │   │   ├── ForgotPassword.vue
│   │   │   ├── ResetPassword.vue
│   │   │   └── ActivateUser.vue
│   │   ├── Dashboard/       # Vistas del dashboard
│   │   │   ├── DashboardLayout.vue
│   │   │   ├── Dashboard.vue
│   │   │   └── Options.vue
│   │   └── UI/              # Vistas de demostración de componentes
│   │       ├── Forms.vue
│   │       ├── Tables.vue
│   │       ├── Modals.vue
│   │       ├── Tabs.vue
│   │       └── Lists.vue
│   ├── router/              # Configuración de rutas
│   │   ├── index.js         # Definición de rutas
│   │   └── menus.js         # Configuración de menús
│   ├── store/               # Estado global (Vuex)
│   │   ├── index.js         # Módulos principales
│   │   ├── _auth.js         # Módulo de autenticación
│   │   └── _loader.js       # Módulo de cargador global
│   ├── utils/               # Utilidades y helpers
│   │   ├── clients.js       # Clientes API (Axios)
│   │   ├── alert.js         # Sistema de alertas
│   │   ├── toast.js         # Sistema de toasts
│   │   ├── errorHandler.js  # Manejador de errores
│   │   ├── inactivityTracker.js
│   │   ├── date.js          # Utilidades de fechas
│   │   ├── string.js        # Utilidades de strings
│   │   ├── debounce.js      # Debounce
│   │   ├── deepCopy.js      # Deep copy
│   │   ├── downloadFile.js  # Descarga de archivos
│   │   ├── mobileChecker.js # Detección de dispositivo
│   │   └── openFile.js      # Apertura de archivos
│   ├── plugins/             # Plugins Vue
│   ├── assets/              # Recursos estáticos
│   │   └── scss/            # Estilos SCSS
│   │       ├── bootstrap-4.6.1/
│   │       ├── fontawesome-6.1.1/
│   │       └── styles.scss  # Estilos globales
│   ├── App.vue              # Componente raíz
│   └── main.js              # Punto de entrada
├── package.json             # Dependencias y scripts
├── package-lock.json
├── jsconfig.json            # Configuración de paths alias
├── .prettierrc.json         # Configuración de Prettier
└── README.md                # Documentación básica
```

---

## Ciclo de Vida y Flujo de la Aplicación

### 1. **Inicialización (`main.js`)**
```
main.js → crea aplicación Vue
        → configura plugins (Vuex, Router, Toast, Alert, etc.)
        → registra componentes globales
        → monta en #app
```

### 2. **Enrutamiento**
- **Rutas de Autenticación:**
  - `/login` → Login.vue
  - `/forgot_password` → ForgotPassword.vue
  - `/reset_password/:token` → ResetPassword.vue
  - `/activate_user/:token` → ActivateUser.vue

- **Rutas del Dashboard (protegidas):**
  - `/dashboard` → Dashboard.vue
  - `/forms` → Forms.vue
  - `/tables` → Tables.vue
  - `/modals` → Modals.vue
  - `/tabs` → Tabs.vue
  - `/opciones` → Options.vue

### 3. **Gestión de Estado (Vuex)**

**Estructura de Módulos:**
```
store/
├── modules:
│   ├── auth    # Estado de autenticación
│   └── loader  # Estado de cargador global
```

**Módulo `_auth.js`:**
- **State:** usuario logueado, token, permisos
- **Mutations:** actualizar usuario, guardar token
- **Actions:** login, logout, refresh token, validate session
- **Getters:** usuario actual, está autenticado

**Módulo `_loader.js`:**
- **State:** `loader_active` (boolean)
- **Mutations:** activar/desactivar cargador
- **Getters:** estado del cargador

### 4. **Inactividad**
- En `App.vue` se instancia `inactivityTracker`
- Después de 30 minutos de inactividad, muestra modal de advertencia
- Cuenta regresiva de 60 segundos antes de logout automático
- El usuario puede hacer clic en "Mantener sesión" para resetear el timer

---

## Patrones y Convenciones

### Componentes Vue

**Estructura de Componentes:**
```vue
<template>
  <!-- HTML, accesible por data() properties y métodos -->
</template>

<script>
export default {
  name: 'ComponentName',
  components: { /* componentes hijos */ },
  props: { /* props del componente */ },
  data() {
    return {
      /* estado reactivo */
    }
  },
  computed: {
    /* propiedades computadas */
  },
  methods: {
    /* métodos */
  },
  mounted() {
    /* hook de ciclo de vida */
  }
}
</script>

<style scoped>
/* estilos CSS/SCSS scoped al componente */
</style>
```

**Convenciones de Nombrado:**
- **Componentes:** PascalCase (ej: `UserForm.vue`, `DataTable.vue`)
- **Props:** camelCase (ej: `userData`, `isActive`)
- **Data/Methods:** camelCase (ej: `isLoading`, `handleSubmit()`)
- **CSS Classes:** kebab-case (ej: `form-container`, `button-primary`)

### Utilización de Axios/Clientes API

El archivo `utils/clients.js` configura instancias de Axios:

```javascript
// Importar en un componente:
import { clients } from '@/utils/clients'

// Usar:
const response = await clients['users'].get(`/users/${userId}`)
const created = await clients['users'].post('/users', userData)
```

### Sistema de Alertas y Notificaciones

**Alertas (SweetAlert2):**
```javascript
this.$alert.fire({
  title: 'Confirmación',
  text: '¿Estás seguro?',
  icon: 'warning',
  confirmButtonText: 'Sí',
  cancelButtonText: 'No'
})
```

**Toast (Notificaciones):**
```javascript
this.$toast.success('Operación exitosa')
this.$toast.error('Error en la operación')
this.$toast.info('Información')
this.$toast.warning('Advertencia')
```

### Componentes Personalizados

**Tablas Dinámicas (`Tables/`):**
- Sistema de renderizado de tablas con datos dinámicos
- Paginación integrada
- Búsqueda y filtrado
- Acciones por fila

**Modales (`Modal/`):**
- Sistema centralizado de modales
- Componente `VueModal.vue` base
- Se renderiza en `#modal-container` del App.vue
- API: `this.$modal.show(component, props)`

**Formularios (`Form/` y `FormSections/`):**
- Componentes reutilizables de inputs
- Validación integrada
- Soporte para diferentes tipos de campos

---

## Flujo de Desarrollo

### Agregar una Nueva Página/Vista

1. **Crear el componente Vue en `src/views/`**
   ```vue
   <!-- src/views/MyFeature/MyPage.vue -->
   <template>
     <div class="my-page">
       <!-- Contenido -->
     </div>
   </template>

   <script>
   export default {
     name: 'MyPage',
     // ...
   }
   </script>
   ```

2. **Agregar la ruta en `src/router/index.js`**
   ```javascript
   {
     path: '/my-feature',
     component: () => import('@/views/MyFeature/MyPage.vue')
   }
   ```

3. **Actualizar menú en `src/router/menus.js` si es necesario**

### Agregar un Componente Reutilizable

1. **Crear en `src/components/`**
   ```vue
   <!-- src/components/MyComponent.vue -->
   <template>
     <div class="my-component">
       <!-- Contenido -->
     </div>
   </template>

   <script>
   export default {
     name: 'MyComponent',
     props: { /* ... */ },
     // ...
   }
   </script>
   ```

2. **Registrarlo globalmente en `main.js` O importarlo localmente:**
   ```javascript
   // Global en main.js:
   // import MyComponent from '@/components/MyComponent.vue'
   // app.component('MyComponent', MyComponent)

   // Local en componente padre:
   import MyComponent from '@/components/MyComponent.vue'
   ```

### Agregar Lógica de Estado (Vuex)

1. **Crear un nuevo módulo en `src/store/`**
   ```javascript
   // src/store/_myModule.js
   export default {
     state: () => ({
       data: null,
       loading: false
     }),
     mutations: {
       setData(state, payload) { state.data = payload },
       setLoading(state, value) { state.loading = value }
     },
     actions: {
       async fetchData({ commit }) {
         commit('setLoading', true)
         try {
           // API call
         } finally {
           commit('setLoading', false)
         }
       }
     },
     getters: {
       getData: state => state.data
     }
   }
   ```

2. **Registrarlo en `src/store/index.js`**
   ```javascript
   import myModule from './_myModule'

   export default createStore({
     modules: {
       auth,
       loader,
       myModule  // Agregar aquí
     }
   })
   ```

3. **Usarlo en componentes**
   ```javascript
   // Acceder a estado:
   this.$store.state.myModule.data

   // Disparar acciones:
   this.$store.dispatch('fetchData')

   // Usar getters:
   this.$store.getters.getData
   ```

### Agregar Nuevas Utilidades

1. **Crear un nuevo archivo en `src/utils/`**
   ```javascript
   // src/utils/myUtil.js
   export function myFunction(param) {
     // lógica
   }
   ```

2. **Importar y usar en componentes**
   ```javascript
   import { myFunction } from '@/utils/myUtil'
   ```

---

## Configuración y Desarrollo

### Scripts Disponibles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 9091)
npm start

# Compilar para producción
npm run build

# Previsualizar build
npm preview

# Linting y fix de código
npm run lint

# Formateo de código (Prettier)
npm run format

# Crear nuevo módulo (scaffold)
npm run new-module
```

### Variables de Entorno

Crear `.env.local` (basado en `.env.example`):
```
VITE_API_URL=http://localhost:3000
VITE_DOMAIN=http://localhost:9091
# Otras variables según sea necesario
```

### Configuración de Herramientas

**Prettier (`.prettierrc.json`):**
- Semi-colons: no
- Tab width: 2 espacios
- Single quotes: sí
- Print width: 100 caracteres
- Trailing commas: no

**Path Alias (`jsconfig.json`):**
- `@/*` → `./src/*`

---

## Integración con API Backend

### Estructura de Llamadas API

El archivo `utils/clients.js` proporciona clientes HTTP preconfigurados:

```javascript
// Ejemplo en un componente:
import { clients } from '@/utils/clients'

export default {
  methods: {
    async loadUsers() {
      this.$store.commit('loader/setLoading', true)
      try {
        const response = await clients['users'].get('/users')
        this.users = response.data
      } catch (error) {
        this.$toast.error('Error cargando usuarios')
      } finally {
        this.$store.commit('loader/setLoading', false)
      }
    }
  }
}
```

### Manejo de Errores

El archivo `utils/errorHandler.js` proporciona manejo centralizado de errores:

```javascript
// Usado globalmente en main.js
// Captura errores de promesas rechazadas no manejadas
```

### Autenticación

- El estado de autenticación se gestiona en `store/_auth.js`
- El token JWT se almacena en el estado
- Se envía en el header `Authorization: Bearer {token}` en todas las peticiones
- El logout limpia el token y redirige a login

---

## Componentes Clave

### FullPageLoader
Cargador de página completa que se muestra cuando `$store.getters.loader_active` es `true`.

### InactiveModal
Modal de inactividad que muestra al usuario un timer de descuento antes del logout automático.

### Topbar
Barra superior con navegación y opciones de usuario.

### VueModal
Sistema centralizado de modales. Proporciona API para mostrar componentes como modales.

### SimplePager
Paginador simple para tablas.

### DraggableList / DraggableListItem
Listas draggables usando `vuedraggable`.

---

## Debugging y Troubleshooting

### Verificar Estado de Vuex
```javascript
// En la consola del navegador:
$store.state              // Ver todo el estado
$store.state.auth.user    // Ver usuario
$store.state.loader       // Ver estado de cargador
```

### Ver Rutas Disponibles
```javascript
// En componente:
console.log(this.$router.getRoutes())
```

### Inspeccionar Componentes
- Usar Vue DevTools (extensión de navegador)
- Inspeccionar árbol de componentes, props, estado

---

## Mejores Prácticas

1. **Siempre usar path aliases:** `@/` en lugar de rutas relativas
2. **Mantener componentes pequeños:** dividir en componentes más pequeños si es muy grande
3. **Usar computed properties:** en lugar de métodos para propiedades derivadas
4. **Scoped styles:** siempre usar `scoped` en `<style>` para evitar conflictos globales
5. **Gestión de estado:** usar Vuex para estado global, data() para estado local
6. **Manejo de errores:** siempre tener try/catch en acciones asincrónicas
7. **Validación en formularios:** validar antes de enviar al servidor
8. **Feedback al usuario:** siempre mostrar toasts/alertas para operaciones
9. **Código limpio:** seguir convenciones de nombrado, comentar lógica compleja
10. **Performance:** usar lazy loading en rutas, component code splitting

---

## Recursos Útiles

- [Documentación de Vue 3](https://vuejs.org/)
- [Documentación de Vue Router](https://router.vuejs.org/)
- [Documentación de Vuex](https://vuex.vuejs.org/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Axios](https://axios-http.com/)
- [Documentación de Bootstrap](https://getbootstrap.com/docs/4.6/)

---

## Notas Importantes

- El proyecto usa **Vue 3 Composition API** parcialmente, pero la mayoría es Options API
- Asegúrate de usar path aliases (`@/`) para mantener importes consistentes
- El proyecto está configurado para conectarse con un backend API externo
- Los datos se sincroniza con el backend, el estado global (Vuex) es principalmente para UI state
- Siempre revisar el archivo `.env.example` para entender qué variables de entorno se necesitan
