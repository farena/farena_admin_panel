<template>
  <div class="row">
    <div class="col-md-7">
      <Widget>
        <template #title>fa-editor</template>
        <template #description>
          Integracion de @farena/fa-editor con FormHtml. El editor y su lab completo viven en el
          repo del paquete; esta vista prueba que funciona dentro de la app.
        </template>

        <FormHtml
          v-model="html"
          label="Editor"
          placeholder="Escribi algo..."
          :autocompleteOpts="autocompletes"
          height="auto"
        />

        <div class="d-flex flex-wrap" style="gap: 0.5em; margin-bottom: 1em">
          <FormButton
            v-for="sample in samples"
            :key="sample.name"
            theme="secondary"
            small
            @click="html = sample.html"
          >
            {{ sample.name }}
          </FormButton>
          <FormButton theme="danger" small @click="html = ''">Vaciar</FormButton>
        </div>
      </Widget>

      <Widget>
        <template #title>Estados</template>
        <template #description>
          Altura fija (100px por defecto) con scroll interno, validacion y readonly.
        </template>

        <FormHtml v-model="stateHtml" label="Altura fija" class="mb-4" />
        <FormHtml
          v-model="stateHtml"
          label="Con errores"
          :errors="['Campo requerido']"
          class="mb-4"
        />
        <FormHtml v-model="disabledHtml" label="Deshabilitado" disabled />
      </Widget>
    </div>

    <div class="col-md-5">
      <Widget>
        <template #title>HTML de salida</template>
        <template #description>Es lo que se guarda en la base.</template>

        <pre class="fa-editor-lab__output">{{ html || '(vacio)' }}</pre>

        <FormButton theme="primary" @click="showModal = true">Abrir en un modal</FormButton>
      </Widget>

      <Widget>
        <template #title>Vista previa</template>
        <template #description>
          Como lo renderiza el resto de la app con v-html, fuera del editor.
        </template>
        <div class="fa-editor-lab__preview" v-html="html"></div>
      </Widget>
    </div>

    <!-- El modal es el caso critico: los balloons se teleportan a body y tienen
         que quedar por encima y seguir el scroll del modal. -->
    <vue-modal v-if="showModal" size="md" position="right" @close="showModal = false">
      <template #title>fa-editor dentro de un modal</template>
      <template #body>
        <div style="height: 300px">
          Contenido de relleno para poder scrollear el modal y verificar que los balloons de enlace
          y de tabla siguen al contenido.
        </div>
        <FormHtml v-model="modalHtml" label="Editor en modal" :autocompleteOpts="autocompletes" />
        <div style="height: 400px">Mas relleno.</div>
      </template>
    </vue-modal>
  </div>
</template>

<script>
import Widget from '@/components/Widget.vue'
import FormHtml from '@/components/Form/FormHtml.vue'
import FormButton from '@/components/Form/FormButton.vue'

// Muestras para cargar casos dificiles de un click. El corpus completo del
// contrato vive en el repo del paquete (fa-editor/lab); aca alcanza con unas
// pocas, porque lo que se prueba en esta vista es la integracion con la app:
// FormHtml, el tema, la validacion y sobre todo el editor dentro de un modal.
const SAMPLES = [
  {
    name: 'documento combinado',
    html:
      '<h2>Titulo</h2>' +
      '<p style="text-align:justify;">Texto <strong>fuerte</strong> y <i>debil</i>.</p>' +
      '<ul><li>Item con <span class="text-small">tamano</span></li></ul>' +
      '<figure class="table"><table><tbody><tr><td>X</td></tr></tbody></table></figure>' +
      '<p><a target="_blank" rel="noopener noreferrer" href="http://fin.com">Fin</a></p>'
  },
  {
    name: 'tabla con encabezado',
    html:
      '<figure class="table"><table><thead><tr><th>Nombre</th><th>Valor</th></tr></thead>' +
      '<tbody><tr><td>A</td><td>1</td></tr></tbody></table></figure>'
  },
  {
    name: 'tabla con colspan',
    html:
      '<figure class="table"><table><tbody><tr><td colspan="2">Ancha</td></tr>' +
      '<tr><td>A</td><td>B</td></tr></tbody></table></figure>'
  },
  {
    name: 'menciones multiples',
    html:
      '<p><span class="mention" data-mention="#a">#a</span> y ' +
      '<span class="mention" data-mention="#b">#b</span></p>'
  },
  {
    name: 'link con texto alrededor',
    html: '<p>Ver <a target="_blank" rel="noopener noreferrer" href="https://a.com/b?c=1&amp;d=2">esto</a> ahora</p>'
  },
  {
    name: 'lista con formato',
    html: '<ul><li><strong>Uno</strong></li><li>Dos <i>con cursiva</i></li></ul>'
  }
]

export default {
  components: {
    Widget,
    FormHtml,
    FormButton
  },
  data: () => ({
    html: '<h2>Titulo</h2><p>Escribi aca, o carga una muestra.</p>',
    modalHtml:
      '<p>Un <a target="_blank" rel="noopener noreferrer" href="http://a.com">enlace</a> para probar el balloon.</p>',
    stateHtml:
      '<p>Contenido largo para ver el scroll interno.</p><p>Segundo parrafo.</p><p>Tercer parrafo.</p><p>Cuarto parrafo.</p>',
    disabledHtml: '<p>Este editor esta deshabilitado.</p>',
    showModal: false,
    autocompletes: ['#nombre', '#apellido', '#email', '#empresa', 'sin-marker']
  }),
  computed: {
    samples: () => SAMPLES
  }
}
</script>

<style></style>
