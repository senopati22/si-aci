/**
 *  Pages Authentication
 */

const csrfToken = document.querySelector('meta[name="csrf-token"]');
if (csrfToken) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
}

('use strict');
const formAuthentication = document.querySelector('#formAuthentication');

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    // Form validation for Add new record
    if (formAuthentication) {
      const fv = FormValidation.formValidation(formAuthentication, {
        fields: {
          username: {
            validators: {
              notEmpty: {
                message: 'Silahkan masukkan username'
              },
              stringLength: {
                min: 6,
                message: 'Username harus lebih dari 6 karakter'
              }
            }
          },
          email: {
            validators: {
              notEmpty: {
                message: 'Silahkan masukkan email'
              },
              emailAddress: {
                message: 'Mohon masukkan alamat email yang valid'
              }
            }
          },
          // 'email-username': {
          //   validators: {
          //     notEmpty: {
          //       message: 'Silahkan masukkan username / email'
          //     },
          //     stringLength: {
          //       min: 6,
          //       message: 'Username must be more than 6 characters'
          //     }
          //   }
          // },
          password: {
            validators: {
              notEmpty: {
                message: 'Silahkan masukkan password'
              },
              stringLength: {
                min: 6,
                message: 'Password harus lebih dari 6 karakter'
              }
            }
          },
          'confirm-password': {
            validators: {
              notEmpty: {
                message: 'Mohon masukkan konfirmasi password'
              },
              identical: {
                compare: function () {
                  return formAuthentication.querySelector('[name="password"]').value;
                },
                message: 'Konfirmasi password tidak sama, harap cek kembali'
              },
              stringLength: {
                min: 6,
                message: 'Password harus lebih dari 6 karakter'
              }
            }
          },
          terms: {
            validators: {
              notEmpty: {
                message: 'Please agree terms & conditions'
              }
            }
          }
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.mb-5'
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),

          // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
          autoFocus: new FormValidation.plugins.AutoFocus()
        },
        init: instance => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        }
      });

      fv.on('core.form.valid', function () {
        const submitButton = formAuthentication.querySelector('button[type="submit"]');
        submitButton.textContent = 'Memproses...';
        submitButton.disabled = true;

        grecaptcha.ready(function () {
          const siteKey = formAuthentication.dataset.sitekey;
          console.log('reCAPTCHA Site Key from form:', siteKey);

          grecaptcha
            .execute(siteKey, {
              action: 'login'
            })
            .then(function (token) {
              document.getElementById('g-recaptcha-response').value = token;

              axios
                .post(formAuthentication.getAttribute('action'), new FormData(formAuthentication))
                .then(function (response) {
                  // Jika berhasil, tampilkan notifikasi sukses
                  Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: 'Anda akan segera dialihkan ke dashboard.',
                    timer: 1500,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                      Swal.showLoading();
                    }
                  });

                  setTimeout(() => {
                    window.location.href = response.data.redirect;
                  }, 500);
                })
                .catch(function (error) {
                  // Tampilan detail error di console browser untuk debugging
                  console.error('AJAX Error:', error);
                  if (error.response) {
                    console.error('Error Response Data:', error.response.data);
                    console.error('Error Response Status:', error.response.status);
                  }

                  // 1. Cek apakah ini adalah error "Too Many Requests" (akun terkunci)
                  if (error.response && error.response.status === 429 && error.response.data.redirect_url) {
                    // Jika ya, langsung alihkan (redirect) ke halaman yang terkunci
                    window.location.href = error.response.data.redirect_url;
                    return; // Hentikan eksekusi lebih lanjut
                  }

                  // 2. Jika bukan error akun terkunci, lanjutkan dengan logika error biasa
                  let title = 'Login Gagal';
                  let message = 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';

                  if (error.response) {
                    // Error dari server (misal: validasi gagal, password salah)
                    if (error.response.status === 422 || error.response.status === 403) {
                      message = error.response.data.message || 'Data yang Anda masukkan tidak valid.';
                      if (error.response.data.retries_left !== undefined) {
                        message += `<br><br>Sisa percobaan: <strong>${error.response.data.retries_left} kali lagi</strong>.`;
                      }
                    } else if (error.response.status === 419) {
                      // Error CSRF Token
                      title = 'Sesi Kedaluwarsa';
                      message = 'Halaman ini sudah tidak aktif. Silakan muat ulang halaman dan coba lagi.';
                    } else if (error.response.status === 500) {
                      // Error Internal Server
                      title = 'Kesalahan Server';
                      message = 'Terjadi masalah di server kami. Silakan coba beberapa saat lagi.';
                    }
                  } else if (error.request) {
                    // Error jaringan (tidak terhubung ke server)
                    title = 'Kesalahan Jaringan';
                    message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
                  }

                  Swal.fire({
                    icon: 'error',
                    title: title,
                    html: message,
                    showConfirmButton: true
                  });

                  const submitButton = formAuthentication.querySelector('button[type="submit"]');
                  submitButton.textContent = 'Login';
                  submitButton.disabled = false;
                });
            });
        });
      });
    }

    //  Two Steps Verification
    const numeralMask = document.querySelectorAll('.numeral-mask');

    // Verification masking
    if (numeralMask.length) {
      numeralMask.forEach(e => {
        new Cleave(e, {
          numeral: true
        });
      });
    }
  })();
});
