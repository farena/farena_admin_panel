export default {
  install: async (app) => {
    const { $toast, $store } = app.config.globalProperties;

    const errorHandler = (e) => {
      if (e.constructor.name === "AxiosError") {
        const res = e.response.data;

        // Logout if not authorized
        if ([401, 403].includes(res.code)) {
          $store.dispatch("logout");
        }

        // Show error
        if (res.message) $toast.error(res.message);

        // Show errors
        if (res.errors) {
          Object.values(res.errors).forEach((x) => {
            x.forEach((z) => $toast.error(z));
          });
        }
      } else {
        $toast.error("Error inesperado, vuelva a intentarlo en unos minutos");
        console.error(e);
      }
    };

    app.config.globalProperties.$errorHandler = errorHandler;
    app.config.globalProperties.$store.$errorHandler = errorHandler;
  },
};
