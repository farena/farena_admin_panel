<template>
  <div class="topbar">
    <button class="btn btn-transparent menu-handler" @click.stop="openSidebar">
      <i class="fa fa-bars"></i>
    </button>

    <ul class="topbar-buttons">
      <li @click="$router.push('/settings')"><i class="fa-solid fa-gear"></i></li>
      <li @click="$store.dispatch('logout')">
        <i class="fa-solid fa-power-off"></i>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  mounted() {
    document.addEventListener('click', this.closeSidebar)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeSidebar)
  },
  methods: {
    closeSidebar(e) {
      const sb = document.querySelector('.sidebar')
      if (sb && sb.classList.contains('sidebar-open')) {
        if (e.target.closest('.sidebar')) return

        sb.classList.remove('sidebar-open')
      }
    },
    openSidebar() {
      const sb = document.querySelector('.sidebar')
      sb.classList.add('sidebar-open')
    }
  }
}
</script>
