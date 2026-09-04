import Swal from 'sweetalert2'

export default {
  install: (app) => {
    const alertInstance = {
      fireModal({
        title,
        html,
        input = null,
        inputPlaceholder = null,
        inputValue = null,
        icon = null
      }) {
        if (input) {
          return new Promise((resolve, reject) => {
            Swal.fire({
              icon,
              title,
              html,
              input,
              inputValue,
              inputPlaceholder,
              showCloseButton: true,
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'btn-sm btn btn-primary',
                cancelButton: 'btn-sm btn btn-medium ml-1'
              },
              showClass: {
                popup: `
                animate__animated
                animate__fadeInUp
                animate__faster
              `
              },
              hideClass: {
                popup: `
                animate__animated
                animate__fadeOutDown
                animate__faster
              `
              }
            }).then((res) => {
              if (res.isConfirmed) {
                resolve(res.value || null)
              } else {
                reject()
              }
            })
          })
        }
        return new Promise((resolve, reject) => {
          Swal.fire({
            icon,
            title,
            html,
            showCloseButton: true,
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'btn-sm btn btn-primary'
            },
            showClass: {
              popup: `
                animate__animated
                animate__fadeInUp
                animate__faster
              `
            },
            hideClass: {
              popup: `
                animate__animated
                animate__fadeOutDown
                animate__faster
              `
            }
          }).then((res) => {
            if (res.value) {
              resolve(res.value)
            } else {
              reject()
            }
          })
        })
      },
      fireConfirm({ title, text, cancelButtonText = 'Cancel', confirmButtonText = 'OK' }) {
        return new Promise((resolve, reject) => {
          Swal.fire({
            icon: 'warning',
            title,
            text,
            showCancelButton: true,
            customClass: {
              confirmButton: 'btn-sm btn btn-primary',
              cancelButton: 'btn-sm btn btn-danger ml-1'
            },
            cancelButtonText,
            confirmButtonText,
            buttonsStyling: false,
            showClass: {
              popup: `
                animate__animated
                animate__fadeInUp
                animate__faster
              `
            },
            hideClass: {
              popup: `
                animate__animated
                animate__fadeOutDown
                animate__faster
              `
            }
          }).then((res) => {
            if (res.value) {
              resolve()
            } else {
              reject()
            }
          })
        })
      }
    }

    app.config.globalProperties.$alert = alertInstance
    app.config.globalProperties.$confirm = alertInstance.fireConfirm

    const { $store } = app.config.globalProperties
    if ($store) {
      $store.$alert = alertInstance
    }
  }
}
