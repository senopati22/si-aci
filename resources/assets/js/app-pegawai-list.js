/**
 * Halaman Daftar Pegawai (Versi Final FIX - Hapus Plugin Bootstrap5 FV)
 */

'use strict';

$(document).ready(function () {
  // Guard & Utilities to avoid duplicate submits/alerts
  var isSubmittingPegawai = false;
  var isAlertVisible = false;

  function showAlertOnce(options) {
    // Prevent multiple alerts
    if (isAlertVisible) {
      return Promise.resolve();
    }

    isAlertVisible = true;

    try {
      if (Swal.isVisible && Swal.isVisible()) {
        Swal.close();
      }
    } catch (e) {}

    // Add default animation classes if not specified
    if (!options.showClass) {
      options.showClass = {
        popup: 'swal2-show'
      };
    }
    if (!options.hideClass) {
      options.hideClass = {
        popup: 'swal2-hide'
      };
    }

    // Set default z-index to ensure SweetAlert appears above all elements
    if (!options.customClass) {
      options.customClass = {};
    }
    if (!options.customClass.popup) {
      options.customClass.popup = 'swal2-popup-custom';
    }

    // Ensure backdrop has proper z-index
    if (!options.backdrop) {
      options.backdrop = true;
    }

    return Swal.fire(options).finally(() => {
      isAlertVisible = false;
    });
  }

  // Loading screen functions
  function showLoadingScreen(message = 'Memproses data...') {
    if (isAlertVisible) return;

    isAlertVisible = true;
    Swal.fire({
      title: message,
      text: 'Mohon tunggu sebentar...',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        // Set minimum loading time
        window.loadingStartTime = Date.now();

        try {
          const container = Swal.getPopup(); // Dapatkan container modalnya
          if (container) {
            const actions = container.querySelector('.swal2-actions');
            const confirmButton = container.querySelector('.swal2-confirm');
            const cancelButton = container.querySelector('.swal2-cancel');
            const denyButton = container.querySelector('.swal2-deny');

            // Sembunyikan seluruh container tombol jika ada
            if (actions) {
              actions.style.display = 'none';
            }
            // Sembunyikan tombol satu per satu (jika container tidak ditemukan)
            if (confirmButton) {
              confirmButton.style.display = 'none';
            }
            if (cancelButton) {
              cancelButton.style.display = 'none';
            }
            if (denyButton) {
              denyButton.style.display = 'none';
            }
          }
        } catch (e) {
          console.error('Gagal menyembunyikan tombol:', e);
        }
      }
    });
  }

  function hideLoadingScreen() {
    if (Swal.isVisible && Swal.isVisible()) {
      // Ensure minimum loading time of 1 second for better UX
      var minLoadingTime = 1000; // 1 second
      var elapsedTime = Date.now() - (window.loadingStartTime || 0);
      var remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(function () {
        Swal.close();
        isAlertVisible = false;
      }, remainingTime);
    } else {
      isAlertVisible = false;
    }
  }

  // Field display name mapping
  function getFieldDisplayName(fieldName) {
    const fieldNames = {
      ni_pegawai: 'Nomor Induk Pegawai',
      nama_pegawai: 'Nama Lengkap',
      kepala_bidang: 'Kepala Bidang',
      nama_jabatan_pegawai: 'Nama Jabatan',
      id_jabatan: 'Jabatan',
      status_plt: 'Status PLT',
      no_telp_pegawai: 'Nomor Telepon',
      alamat_pegawai: 'Alamat KTP',
      alamat_domisili_pegawai: 'Alamat Domisili',
      id_pangkat: 'Pangkat',
      id_golongan: 'Golongan',
      id_eselon: 'Eselon',
      tempat_lahir_pegawai: 'Tempat Lahir',
      tanggal_lahir_pegawai: 'Tanggal Lahir',
      jk_pegawai: 'Jenis Kelamin',
      status_pegawai: 'Status Pegawai',
      foto_pegawai: 'Foto Pegawai'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // DataTable loading functions
  function showDataTableLoading() {
    // Hide existing processing indicator
    $('.dataTables_processing').hide();

    // Create custom loading indicator
    var loadingHtml =
      '<div class="datatable-custom-loading" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.95); padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); z-index: 9999; text-align: center;">' +
      '<div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #e9ecef; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px;"></div>' +
      'Memuat data pegawai...' +
      '</div>';

    // Remove existing custom loading
    $('.datatable-custom-loading').remove();

    // Add new loading indicator
    $('body').append(loadingHtml);

    // Auto hide after 2 seconds (fallback)
    setTimeout(function () {
      $('.datatable-custom-loading').fadeOut(300, function () {
        $(this).remove();
      });
    }, 2000);
  }

  // Button loading state functions
  function setButtonLoading(loading = true) {
    var submitBtn = $('#submitBtn');
    var btnText = submitBtn.find('.btn-text');
    var btnLoading = submitBtn.find('.btn-loading');

    if (loading) {
      submitBtn.prop('disabled', true);
      btnText.addClass('d-none');
      btnLoading.removeClass('d-none');
    } else {
      submitBtn.prop('disabled', false);
      btnText.removeClass('d-none');
      btnLoading.addClass('d-none');
    }
  }
  // --- Blok Setup Awal (Tidak Berubah) ---
  // console.log('Document ready, checking FormValidation:', typeof FormValidation);
  // console.log('Form element exists:', $('#pegawaiForm_KHUSUS_INI').length);
  // console.log('Submit button exists:', $('#pegawaiForm_KHUSUS_INI button[type="submit"]').length);
  let borderColor, bodyBg, headingColor;
  if (typeof isDarkStyle !== 'undefined' && isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }
  $.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') } });
  var statusPgw = {
    Aktif: { title: 'Aktif', class: 'bg-label-success' },
    Nonaktif: { title: 'Non-Aktif', class: 'bg-label-danger' }
  };
  // --- Akhir Blok Setup Awal ---

  // --- INISIALISASI SEMUA SELECT2 ---
  function initSelect2(selector, placeholder) {
    const el = $(selector);
    if (el.length) {
      if (el.data('select2')) {
        el.select2('destroy');
        if (el.parent().is('div.position-relative')) {
          el.unwrap();
        }
      }
      el.wrap('<div class="position-relative"></div>')
        .select2({
          placeholder: placeholder,
          dropdownParent: el.parent(),
          allowClear: true
        })
        .on('change', function () {
          // Revalidate manual karena plugin Bootstrap5 dihapus
          if (typeof fv !== 'undefined' && fv !== null) {
            try {
              fv.revalidateField($(this).attr('name'));
            } catch (e) {
              console.warn('Error revalidating field:', e);
            }
          }
        });
    }
  }

  // Inisialisasi Select2 setelah DOM siap
  setTimeout(function () {
    initSelect2('#id_jabatan', 'Pilih Jabatan');
    initSelect2('#id_pangkat', 'Pilih Pangkat');
    initSelect2('#id_golongan', 'Pilih Golongan');
    initSelect2('#id_eselon', 'Pilih Eselon');
  }, 100);
  // --- AKHIR SELECT2 ---

  // --- INISIALISASI FLATPICKR ---
  function initFlatpickr() {
    setTimeout(function () {
      const tanggalLahirInput = document.getElementById('tanggal_lahir_pegawai');
      if (tanggalLahirInput) {
        // Cek apakah Flatpickr sudah ada
        if (tanggalLahirInput._flatpickr) {
          tanggalLahirInput._flatpickr.destroy();
        }

        // Inisialisasi Flatpickr menggunakan method .flatpickr()
        tanggalLahirInput.flatpickr({
          dateFormat: 'Y-m-d',
          maxDate: 'today',
          // Remove locale: 'id' as it's causing error
          allowInput: true,
          clickOpens: true,
          placeholder: 'Pilih Tanggal Lahir',
          disableMobile: true, // Gunakan native picker di mobile
          onChange: function (selectedDates, dateStr, instance) {
            // Trigger validation jika ada
            if (typeof fv !== 'undefined' && fv !== null) {
              try {
                fv.revalidateField('tanggal_lahir_pegawai');
              } catch (e) {
                console.warn('Error revalidating tanggal_lahir_pegawai:', e);
              }
            }
          }
        });
        // console.log('Flatpickr initialized for tanggal_lahir_pegawai');
      } else {
        console.warn('tanggal_lahir_pegawai input not found');
      }
    }, 200);
  }

  // Panggil inisialisasi Flatpickr
  initFlatpickr();
  // --- AKHIR FLATPICKR ---

  // --- VARIABEL GLOBAL UNTUK FV ---
  let fv;

  // --- FUNGSI INISIALISASI FV ---
  function initFormValidation() {
    // Tunggu sebentar untuk memastikan semua elemen sudah ter-render
    setTimeout(function () {
      const pegawaiForm = document.getElementById('pegawaiForm_KHUSUS_INI');
      if (!pegawaiForm) {
        console.error('Form #pegawaiForm_KHUSUS_INI tidak ditemukan!');
        return;
      }

      // Pastikan semua elemen form sudah ada
      const requiredElements = [
        'ni_pegawai',
        'nama_pegawai',
        'nama_jabatan_pegawai',
        'id_jabatan',
        'plt_pegawai',
        'no_telp_pegawai',
        'tempat_lahir_pegawai',
        'tanggal_lahir_pegawai',
        'alamat_pegawai',
        'id_pangkat',
        'id_golongan',
        'id_eselon',
        'foto_pegawai',
        'status_pegawai'
      ];

      // Cek radio button jk_pegawai secara terpisah
      const jkRadioButtons = pegawaiForm.querySelectorAll('input[name="jk_pegawai"]');
      if (jkRadioButtons.length === 0) {
        console.error('Radio button jk_pegawai tidak ditemukan!');
        return;
      }

      let missingElements = [];
      requiredElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
          missingElements.push(elementId);
        }
      });

      if (missingElements.length > 0) {
        console.error('Elemen form yang hilang:', missingElements);
        return;
      }

      try {
        // console.log('Mencoba inisialisasi FV untuk #pegawaiForm_KHUSUS_INI...');
        // console.log('FormValidation object:', typeof FormValidation, FormValidation);
        fv = FormValidation.formValidation(pegawaiForm, {
          fields: {
            ni_pegawai: {
              validators: {
                notEmpty: { message: 'Nomor Induk Pegawai wajib diisi.' },
                stringLength: { min: 10, max: 18, message: 'Nomor Induk Pegawai harus antara 10 - 18 karakter.' },
                regexp: { regexp: /^[0-9]+$/, message: 'Nomor Induk Pegawai hanya boleh berisi angka.' }
              }
            },
            nama_pegawai: {
              validators: {
                notEmpty: { message: 'Nama Lengkap wajib diisi.' },
                stringLength: { min: 3, max: 255, message: 'Nama Lengkap harus antara 3 - 255 karakter.' },
                regexp: {
                  regexp: /^[A-Za-zÀ-ÖØ-öø-ÿ'.,\-\s]+$/,
                  message: 'Nama hanya boleh huruf, spasi, titik, koma, apostrof, dan tanda minus.'
                }
              }
            },
            nama_jabatan_pegawai: {
              validators: {
                notEmpty: { message: 'Nama Jabatan wajib diisi.' },
                stringLength: { min: 1, max: 50, message: 'Nama Jabatan harus antara 1 - 50 karakter.' },
                regexp: {
                  regexp: /^[A-Za-z0-9À-ÖØ-öø-ÿ'.,()\/\-\s]+$/,
                  message: 'Nama jabatan hanya boleh huruf/angka dan tanda . , ( ) / -'
                }
              }
            },
            id_jabatan: { validators: { notEmpty: { message: 'Jabatan wajib dipilih.' } } },
            plt_pegawai: { validators: { notEmpty: { message: 'Status PLT wajib dipilih.' } } },
            no_telp_pegawai: {
              validators: {
                notEmpty: { message: 'Nomor Telepon wajib diisi.' },
                stringLength: { max: 100, message: 'Nomor Telepon maksimal 100 karakter.' },
                regexp: { regexp: /^[0-9+\-\s()]+$/, message: 'Format Nomor Telepon tidak valid.' }
              }
            },
            tempat_lahir_pegawai: {
              validators: {
                notEmpty: { message: 'Tempat Lahir wajib diisi.' },
                stringLength: { min: 2, max: 100, message: 'Tempat Lahir harus antara 2 - 100 karakter.' },
                regexp: {
                  regexp: /^[A-Za-zÀ-ÖØ-öø-ÿ'\.\-\s]+$/,
                  message: 'Tempat lahir hanya boleh huruf, spasi, titik, apostrof, dan tanda minus.'
                }
              }
            },
            tanggal_lahir_pegawai: {
              validators: {
                notEmpty: { message: 'Tanggal Lahir wajib diisi.' },
                date: {
                  format: 'YYYY-MM-DD',
                  message: 'Format Tanggal Lahir tidak valid.'
                }
              }
            },
            jk_pegawai: { validators: { notEmpty: { message: 'Jenis Kelamin wajib dipilih.' } } },
            alamat_pegawai: {
              validators: {
                notEmpty: { message: 'Alamat KTP wajib diisi.' },
                stringLength: { min: 10, max: 255, message: 'Alamat KTP harus antara 10 - 255 karakter.' },
                regexp: {
                  regexp: /^[A-Za-z0-9À-ÖØ-öø-ÿ'.,()\/\-\s]+$/,
                  message: 'Alamat hanya boleh huruf/angka dan tanda . , ( ) / -'
                }
              }
            },
            alamat_domisili_pegawai: {
              validators: {
                notEmpty: { message: 'Alamat Domisili wajib diisi.' },
                stringLength: { min: 10, max: 255, message: 'Alamat Domisili harus antara 10 - 255 karakter.' },
                regexp: {
                  regexp: /^[A-Za-z0-9À-ÖØ-öø-ÿ'.,()\/\-\s]+$/,
                  message: 'Alamat hanya boleh huruf/angka dan tanda . , ( ) / -'
                }
              }
            },
            id_pangkat: { validators: { notEmpty: { message: 'Pangkat wajib dipilih.' } } },
            id_golongan: { validators: { notEmpty: { message: 'Golongan wajib dipilih.' } } },
            id_eselon: { validators: { notEmpty: { message: 'Eselon wajib dipilih.' } } },
            foto_pegawai: {
              validators: {
                file: {
                  extension: 'jpeg,jpg,png,gif',
                  type: 'image/jpeg,image/png,image/gif',
                  maxSize: 2097152,
                  message: 'File harus gambar (jpg, png, gif) & maksimal 2MB.'
                }
              }
            },
            status_pegawai: { validators: { notEmpty: { message: 'Status Pegawai wajib dipilih.' } } }
          },
          plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            submitButton: new FormValidation.plugins.SubmitButton(),
            autoFocus: new FormValidation.plugins.AutoFocus()
          }
        });
        // console.log('Inisialisasi FV SELESAI.');
      } catch (error) {
        console.error('FormValidation initialization failed:', error);
        // Jika FV gagal, set fv ke null agar tidak error di submit handler
        fv = null;
        showAlertOnce({
          icon: 'error',
          title: 'Gagal Memuat Validasi!',
          html: `<div style="text-align: left; max-width: 500px;">
            <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
              <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                Sistem validasi form tidak dapat dimuat
              </p>
              <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                Terjadi masalah saat memuat sistem validasi form. Silakan refresh halaman dan coba lagi.
              </p>
            </div>
            <div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
              <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                <strong>💡 Solusi:</strong> Refresh halaman (F5) atau hubungi administrator jika masalah berlanjut.
              </p>
            </div>
          </div>`,
          customClass: {
            confirmButton: 'btn btn-danger',
            popup: 'swal2-popup-custom',
            container: 'swal2-container-custom'
          },
          allowOutsideClick: false,
          allowEscapeKey: true,
          focusConfirm: true
        });
      }
    }, 500); // Tunggu 500ms untuk memastikan DOM siap
  }

  // Panggil inisialisasi setelah DOM siap
  initFormValidation();

  // --- REAL-TIME VALIDATION ---
  function initRealTimeValidation() {
    // Add real-time validation for all form fields
    $('#pegawaiForm_KHUSUS_INI').on('input change blur', 'input, select, textarea', function () {
      var element = $(this);
      var fieldName = element.attr('name');
      var labelName = element.attr('label');
      var fieldValue = element.val();

      // console.log('Real-time validation for field:', fieldName, 'Value:', fieldValue);

      // Remove previous error state more thoroughly
      element.removeClass('is-invalid');
      element.removeClass('is-valid'); // Remove valid class too

      // Remove error messages from multiple possible locations with animation
      // var errorMessages = element
      //   .closest('.form-floating, .position-relative, .d-flex, .mb-5, .col-md-6')
      //   .find('.invalid-feedback');
      // errorMessages.add(element.siblings('.invalid-feedback'));
      // errorMessages.add(element.parent().find('.invalid-feedback'));
      // errorMessages.add(element.next('.invalid-feedback'));
      var errorMessages = element.next('.invalid-feedback');
      errorMessages = errorMessages.add(element.parent().next('.invalid-feedback'));

      // Animate removal
      errorMessages.addClass('removing');
      setTimeout(function () {
        errorMessages.remove();
      }, 300);

      // Validate field
      var isValid = true;
      var errorMessage = '';

      // Check if field is empty
      if (!fieldValue || fieldValue === '') {
        // Only show error for required fields
        var requiredFields = [
          'ni_pegawai',
          'nama_pegawai',
          'nama_jabatan_pegawai',
          'id_jabatan',
          'plt_pegawai',
          'no_telp_pegawai',
          'tempat_lahir_pegawai',
          'tanggal_lahir_pegawai',
          'alamat_pegawai',
          'alamat_domisili_pegawai',
          'id_pangkat',
          'id_golongan',
          'id_eselon',
          'status_pegawai'
        ];

        if (requiredFields.includes(fieldName)) {
          isValid = false;
          errorMessage = getFieldDisplayName(fieldName) + ' wajib diisi';
        }
      }
      // Check field format based on field name
      else {
        // Nama field validation
        if (fieldName === 'nama_pegawai' || fieldName === 'nama_jabatan_pegawai') {
          // Check if contains numbers
          if (/\d/.test(fieldValue)) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' tidak boleh mengandung angka';
          }
          // Check if contains special characters (except allowed ones)
          else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'.,\-\s]+$/.test(fieldValue)) {
            isValid = false;
            errorMessage =
              getFieldDisplayName(fieldName) + ' hanya boleh huruf, spasi, titik, koma, apostrof, dan tanda minus';
          }
        } else if (fieldName === 'foto_pegawai') {
          // Validasi ini hanya berjalan jika user memilih file
          if (element[0].files && element[0].files.length > 0) {
            const file = element[0].files[0];
            const fileSize = file.size; // Ukuran dalam bytes
            const fileType = file.type; // Tipe file (e.g., "image/jpeg")

            // Tentukan ukuran maks 2MB dalam bytes
            const maxSizeInBytes = 2 * 1024 * 1024;

            // Tentukan tipe file yang diizinkan
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

            // 1. Cek Ukuran File
            if (fileSize > maxSizeInBytes) {
              isValid = false;
              errorMessage = 'Ukuran file foto maksimal adalah 2MB';
            }

            // 2. Cek Tipe File
            else if (!allowedTypes.includes(fileType)) {
              isValid = false;
              errorMessage = 'Format file tidak valid. Hanya (jpeg, jpg dan png) yang diizinkan';
            }
          }
        }

        // NI Pegawai validation
        else if (fieldName === 'ni_pegawai') {
          if (!/^[0-9]+$/.test(fieldValue)) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' hanya boleh berisi angka';
          } else if (fieldValue.length < 10 || fieldValue.length > 18) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' harus antara 10 - 18 karakter';
          }
        }
        // Phone number validation
        else if (fieldName === 'no_telp_pegawai') {
          if (!/^[0-9+\-\s()]+$/.test(fieldValue)) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' format tidak valid';
          }
        }
        // Address validation
        else if (fieldName === 'alamat_pegawai' || fieldName === 'alamat_domisili_pegawai') {
          if (fieldValue.length < 10) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' minimal 10 karakter';
          } else if (!/^[A-Za-z0-9À-ÖØ-öø-ÿ'.,()\/\-\s]+$/.test(fieldValue)) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' hanya boleh huruf/angka dan tanda . , ( ) / -';
          }
        }
        // Place of birth validation
        else if (fieldName === 'tempat_lahir_pegawai') {
          if (fieldValue.length < 2) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' minimal 2 karakter';
          } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'\.\-\s]+$/.test(fieldValue)) {
            isValid = false;
            errorMessage =
              getFieldDisplayName(fieldName) + ' hanya boleh huruf, spasi, titik, apostrof, dan tanda minus';
          }
        }
        // Date validation
        else if (fieldName === 'tanggal_lahir_pegawai') {
          var dateValue = new Date(fieldValue);
          var today = new Date();
          if (isNaN(dateValue.getTime())) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' format tidak valid';
          } else if (dateValue > today) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' tidak boleh di masa depan';
          }
        }
      }

      // Show error if invalid
      if (!isValid) {
        element.addClass('is-invalid');

        // Add error message
        let msgElement = $(
          '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
        );
        msgElement.text(errorMessage);

        // Place error message
        let targetElement = element;
        if (element.parent().hasClass('form-floating') || element.parent().hasClass('position-relative')) {
          targetElement = element.parent();
        }
        targetElement.after(msgElement);

        // Force visibility
        msgElement.show();
        msgElement.css('display', 'block');

        // console.log('Real-time validation - Field', fieldName, 'is invalid:', errorMessage);
      } else {
        // Field is valid, remove any error state more thoroughly
        element.removeClass('is-invalid');
        element.removeClass('is-valid');

        // Remove error messages from multiple possible locations with animation
        var errorMessages = element.next('.invalid-feedback');
        errorMessages = errorMessages.add(element.parent().next('.invalid-feedback'));

        // Animate removal
        errorMessages.addClass('removing');
        setTimeout(function () {
          errorMessages.remove();
        }, 300);

        // Add valid class for visual feedback
        element.addClass('is-valid');

        // console.log('Real-time validation - Field', fieldName, 'is valid');
      }
    });

    // Special handling for radio buttons
    $('#pegawaiForm_KHUSUS_INI').on('change', 'input[name="jk_pegawai"]', function () {
      var jkElements = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]');
      var jkChecked = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]:checked').length > 0;

      if (jkChecked) {
        // Remove error state more thoroughly
        jkElements.removeClass('is-invalid');
        jkElements.removeClass('is-valid');

        // Remove error messages from multiple possible locations with animation
        var errorMessages = jkElements.closest('.d-flex, .form-check, .mb-5, .col-md-6').find('.invalid-feedback');
        errorMessages = errorMessages.add(jkElements.closest('.d-flex, .form-check').next('.invalid-feedback'));
        errorMessages = errorMessages.add(jkElements.parent().next('.invalid-feedback'));

        // Animate removal
        errorMessages.addClass('removing');
        setTimeout(function () {
          errorMessages.remove();
        }, 300);

        // Add valid class for visual feedback
        jkElements.addClass('is-valid');

        // console.log('Real-time validation - Radio button jk_pegawai is valid');
      }
    });
  }

  // Initialize real-time validation
  initRealTimeValidation();

  // Clear all error messages when form opens
  $('#pegawaiForm_KHUSUS_INI').on('show.bs.offcanvas', function () {
    // console.log('Form opened, clearing all error messages');

    // Clear all error states
    $('#pegawaiForm_KHUSUS_INI').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');

    // Remove all error messages with animation
    var allErrorMessages = $('#pegawaiForm_KHUSUS_INI').find('.invalid-feedback');
    allErrorMessages.addClass('removing');
    setTimeout(function () {
      allErrorMessages.remove();
    }, 300);
  });
  // --- AKHIR REAL-TIME VALIDATION ---
  // --- AKHIR VALIDASI ---

  var table = $('.datatables-pegawai').DataTable({
    // (Konfigurasi DataTable Anda ... tetap sama)
    processing: true,
    serverSide: true,
    ajax: '/pegawai/data',
    // Add loading state management
    initComplete: function () {
      // Add loading state to pagination buttons
      $('.dataTables_wrapper').on('click', '.paginate_button', function () {
        if (!$(this).hasClass('disabled')) {
          // Show custom loading indicator
          showDataTableLoading();
        }
      });

      // Add loading state to search input
      $('.dataTables_wrapper').on('keyup', 'input[type="search"]', function () {
        showDataTableLoading();
      });

      // Add loading state to length change
      $('.dataTables_wrapper').on('change', 'select[name="datatables-pegawai_length"]', function () {
        showDataTableLoading();
      });
    },
    // Hide loading indicator when data is loaded
    drawCallback: function () {
      $('.datatable-custom-loading').fadeOut(300, function () {
        $(this).remove();
      });
    },
    language: {
      processing: 'Memuat data pegawai...',
      loadingRecords: 'Memuat data pegawai...',
      empty: 'Tidak ada data pegawai',
      zeroRecords: 'Data tidak ditemukan',
      info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ data',
      infoEmpty: 'Menampilkan 0 sampai 0 dari 0 data',
      infoFiltered: '(disaring dari _MAX_ total data)',
      lengthMenu: 'Tampilkan _MENU_ data per halaman',
      search: 'Cari:',
      paginate: {
        first: 'Pertama',
        last: 'Terakhir',
        next: 'Selanjutnya',
        previous: 'Sebelumnya'
      }
    },
    columns: [
      { data: null, defaultContent: '', name: 'responsive' },
      { data: 'DT_RowIndex', name: 'DT_RowIndex' },
      { data: 'foto_pegawai', name: 'foto_pegawai' },
      { data: 'nama_pegawai', name: 'nama_pegawai' },
      { data: 'nama_jabatan_pegawai', name: 'nama_jabatan_pegawai' },
      { data: 'nama_pangkat', name: 'nama_pangkat' },
      { data: 'nama_golongan', name: 'nama_golongan' },
      { data: 'status_pegawai', name: 'status_pegawai' },
      { data: 'action', name: 'action' }
    ],
    columnDefs: [
      { className: 'control', orderable: false, searchable: false, targets: 0 },
      { orderable: false, searchable: false, targets: [1, 2, 8] },
      { responsivePriority: 1, targets: 3 },
      { responsivePriority: 2, targets: 8 },
      {
        targets: 2, // Kolom foto
        render: function (data, type, full, meta) {
          var $name = full['nama_pegawai'],
            $image = full['foto_pegawai'];
          var $output;
          // console.log('Rendering foto for:', $name, 'Image path:', $image);
          if ($image && $image !== '' && $image !== null) {
            var imageUrl;
            if ($image.startsWith('public/')) {
              imageUrl = '/storage/' + $image.substring(7);
            } else if ($image.startsWith('storage/app/public/')) {
              imageUrl = '/storage/' + $image.substring(8);
            } else if ($image.startsWith('/storage/')) {
              imageUrl = $image;
            } else if ($image.startsWith('foto_pegawai/')) {
              imageUrl = '/storage/' + $image;
            } else {
              imageUrl = '/storage/' + $image;
            }
            // console.log('Generated image URL:', imageUrl);
            $output =
              '<img src="' +
              imageUrl +
              '" alt="Foto" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">';
          } else {
            var stateNum = Math.floor(Math.random() * 6);
            var states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
            var $state = states[stateNum],
              $initials = ($name && $name.match(/\b\w/g)) || [];
            $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
            $output =
              '<div class="avatar-initial bg-label-' +
              $state +
              ' rounded-circle" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">' +
              $initials +
              '</div>';
          }
          return $output;
        }
      },
      {
        targets: 3, // Kolom nama
        render: function (data, type, full, meta) {
          var $name = full['nama_pegawai'],
            $ni_pegawai = full['ni_pegawai'];
          var $row_output =
            '<div class="d-flex flex-column">' +
            '<span class="text-truncate text-heading fw-medium">' +
            ($name || '') +
            '</span>' +
            '<small>' +
            ($ni_pegawai || '') +
            '</small>' +
            '</div>';
          return $row_output;
        }
      },
      {
        targets: 4,
        render: function (data, type, full, meta) {
          return '<span>' + (data || '-') + '</span>';
        }
      },
      {
        targets: 5,
        render: function (data, type, full, meta) {
          return '<span>' + (data || '-') + '</span>';
        }
      },
      {
        targets: 6,
        render: function (data, type, full, meta) {
          var $golongan = full['nama_golongan'] || '-';
          var $eselon = full['nama_eselon'] || '-';
          return '<span>' + $golongan + '</span><br><small>' + $eselon + '</small>';
        }
      },
      {
        targets: 7,
        render: function (data, type, full, meta) {
          var $status = full['status_pegawai'];
          return (
            '<span class="badge rounded-pill ' +
            (statusPgw[$status] ? statusPgw[$status].class : 'bg-label-secondary') +
            '">' +
            (statusPgw[$status] ? statusPgw[$status].title : $status || 'N/A') +
            '</span>'
          );
        }
      }
    ],
    order: [[2, 'asc']],
    dom: '<"row mx-4"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"row mx-4"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
    language: { search: '', searchPlaceholder: 'Cari Pegawai...' },
    buttons: [],
    initComplete: function () {
      var actionsContainer = $('<div class="card-actions d-flex align-items-center"></div>');
      var exportButton = new $.fn.dataTable.Buttons(table, {
        buttons: [
          {
            extend: 'collection',
            className: 'btn btn-outline-secondary dropdown-toggle me-3',
            text: '<i class="ri-upload-2-line ri-16px me-2"></i>Export',
            buttons: [
              {
                extend: 'print',
                text: '<i class="ri-printer-line me-1" ></i>Print',
                className: 'dropdown-item',
                exportOptions: { columns: [1, 3, 4, 5, 6, 7] }
              },
              {
                extend: 'csv',
                text: '<i class="ri-file-text-line me-1" ></i>Csv',
                className: 'dropdown-item',
                exportOptions: { columns: [1, 3, 4, 5, 6, 7] }
              },
              {
                extend: 'excel',
                text: '<i class="ri-file-excel-line me-1"></i>Excel',
                className: 'dropdown-item',
                exportOptions: { columns: [1, 3, 4, 5, 6, 7] }
              },
              {
                extend: 'pdf',
                text: '<i class="ri-file-pdf-line me-1"></i>Pdf',
                className: 'dropdown-item',
                exportOptions: { columns: [1, 3, 4, 5, 6, 7] }
              },
              {
                extend: 'copy',
                text: '<i class="ri-file-copy-line me-1"></i>Copy',
                className: 'dropdown-item',
                exportOptions: { columns: [1, 3, 4, 5, 6, 7] }
              }
            ]
          }
        ]
      }).container();
      var addButton =
        '<button type="button" class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#offcanvasPegawai">' +
        '<i class="ri-add-line me-sm-1"></i> <span class="d-none d-sm-inline-block">Tambah Pegawai</span>' +
        '</button>';
      actionsContainer.append(exportButton).append(addButton);
      var cardHeader = $('.card-header');
      cardHeader.find('.card-actions').remove();
      cardHeader.addClass('d-flex justify-content-between align-items-center');
      cardHeader.append(actionsContainer);
    },
    responsive: {
      details: {
        display: $.fn.dataTable.Responsive.display.modal({
          header: function (row) {
            var data = row.data();
            return 'Detail dari ' + data['nama_pegawai'];
          }
        }),
        type: 'column',
        renderer: function (api, rowIdx, columns) {
          var data = $.map(columns, function (col, i) {
            if (col.columnIndex === 0 || col.columnIndex === api.columns().count() - 1) {
              return '';
            }
            return col.title !== ''
              ? '<tr data-dt-row="' +
                  col.rowIndex +
                  '" data-dt-column="' +
                  col.columnIndex +
                  '"><td>' +
                  col.title +
                  ':' +
                  '</td> <td>' +
                  (col.data || '-') +
                  '</td></tr>'
              : '';
          }).join('');
          return data ? $('<table class="table"/><tbody />').append(data) : false;
        }
      }
    }
  });

  // =================================================================
  // LOGIKA CRUD (Sekarang akan berfungsi)
  // =================================================================

  // CREATE: Reset Form
  $('body').on('click', '.btn-primary[data-bs-target="#offcanvasPegawai"]', function () {
    // Reset flags
    isSubmittingPegawai = false;
    isAlertVisible = false;
    setButtonLoading(false);

    $('#pegawaiForm_KHUSUS_INI').trigger('reset');
    // Hanya reset jika fv berhasil diinisialisasi
    if (typeof fv !== 'undefined' && fv !== null) {
      try {
        fv.resetForm(true);
      } catch (e) {
        console.warn('Error resetting form validation:', e);
      }
    }
    // Hapus class is-invalid secara manual
    $('#pegawaiForm_KHUSUS_INI').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
    $('#pegawaiForm_KHUSUS_INI').find('.invalid-feedback, .valid-feedback').remove(); // Hapus pesan error lama
    $('#pegawai_id').val('');
    $('#offcanvasPegawaiLabel').html('Tambah Pegawai');
    // Reset Select2 secara manual
    $('#id_jabatan, #id_pangkat, #id_golongan, #id_eselon').val(null).trigger('change');
    $('input[name="jk_pegawai"]').prop('checked', false);
    $('#foto_pegawai').val('');
    // Reinitialize Flatpickr
    setTimeout(function () {
      initFlatpickr();
    }, 100);
  });

  // EDIT: Isi Form
  $('body').on('click', '.edit-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var id = $(this).data('id');
    // console.log('Edit button clicked, ID:', id, 'Element:', this);
    if (!id) {
      console.error('ID tidak ditemukan untuk edit!');
      showAlertOnce({
        icon: 'error',
        title: 'Data Tidak Ditemukan!',
        html: `<div style="text-align: left; max-width: 500px;">
          <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
            <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
              ID pegawai tidak ditemukan
            </p>
            <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
              Tidak dapat menemukan ID pegawai yang diminta. Silakan refresh halaman dan coba lagi.
            </p>
          </div>
          <div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
            <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
              <strong>💡 Solusi:</strong> Refresh halaman (F5) atau hubungi administrator jika masalah berlanjut.
            </p>
          </div>
        </div>`,
        customClass: {
          confirmButton: 'btn btn-danger',
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        },
        allowOutsideClick: false,
        allowEscapeKey: true,
        focusConfirm: true
      });
      return;
    }

    // Reset flags
    isSubmittingPegawai = false;
    isAlertVisible = false;
    setButtonLoading(false);

    // Reset form terlebih dahulu
    $('#pegawaiForm_KHUSUS_INI').trigger('reset');

    // Hanya reset jika fv berhasil diinisialisasi
    if (typeof fv !== 'undefined' && fv !== null) {
      try {
        fv.resetForm(true);
      } catch (e) {
        console.warn('Error resetting form validation:', e);
      }
    }

    // Hapus class is-invalid secara manual
    $('#pegawaiForm_KHUSUS_INI').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
    $('#pegawaiForm_KHUSUS_INI').find('.invalid-feedback, .valid-feedback').remove(); // Hapus pesan error lama

    $.get('/pegawai/' + id + '/edit', function (data) {
      // console.log('Edit data received:', data);
      $('#offcanvasPegawaiLabel').html('Edit Pegawai');
      // Isi form seperti biasa
      $('#pegawai_id').val(data.id_pegawai);
      $('#ni_pegawai').val(data.ni_pegawai);
      $('#nama_pegawai').val(data.nama_pegawai);
      $('#nama_jabatan_pegawai').val(data.nama_jabatan_pegawai);
      $('#plt_pegawai').val(data.plt_pegawai);
      $('#no_telp_pegawai').val(data.no_telp_pegawai);
      $('#tempat_lahir_pegawai').val(data.tempat_lahir_pegawai);
      $('#tanggal_lahir_pegawai').val(data.tanggal_lahir_pegawai);
      if (data.jk_pegawai) {
        $('input[name="jk_pegawai"][value="' + data.jk_pegawai + '"]').prop('checked', true);
      }
      $('#alamat_pegawai').val(data.alamat_pegawai);
      $('#alamat_domisili_pegawai').val(data.alamat_domisili_pegawai);
      $('#status_pegawai').val(data.status_pegawai);
      $('#id_jabatan').val(data.id_jabatan).trigger('change');
      $('#id_pangkat').val(data.id_pangkat).trigger('change');
      $('#id_golongan').val(data.id_golongan).trigger('change');
      $('#id_eselon').val(data.id_eselon).trigger('change');
      $('#foto_pegawai').val('');
      $('#offcanvasPegawai').offcanvas('show');
      // Reinitialize Flatpickr setelah form diisi
      setTimeout(function () {
        initFlatpickr();
      }, 100);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('AJAX error:', textStatus, errorThrown, jqXHR.responseText);
      showAlertOnce({
        icon: 'error',
        title: 'Gagal Memuat Data!',
        html: `<div style="text-align: left; max-width: 500px;">
          <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
            <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
              Tidak dapat memuat data untuk diedit
            </p>
            <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
              Terjadi masalah saat mengambil data pegawai dari server. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
            </p>
          </div>
          <div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
            <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
              <strong>💡 Solusi:</strong> Coba refresh halaman atau hubungi administrator jika masalah berlanjut.
            </p>
          </div>
        </div>`,
        customClass: {
          confirmButton: 'btn btn-danger',
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        },
        allowOutsideClick: false,
        allowEscapeKey: true,
        focusConfirm: true
      });
    });
  });

  // SUBMIT (CREATE / UPDATE) - Event handler untuk form submit
  setTimeout(function () {
    // console.log('Setting up form submit handler...');
    $('#pegawaiForm_KHUSUS_INI')
      .off('submit')
      .on('submit', function (e) {
        e.preventDefault();
        // console.log('=== FORM SUBMIT DEBUG ===');
        // console.log('Form submit triggered');
        // console.log('FormValidation (fv) status:', typeof fv, fv);
        // console.log('Form element:', this);
        // console.log('Form data:', $(this).serialize());
        // console.log('Form action:', $(this).attr('action'));
        // console.log('Form method:', $(this).attr('method'));

        // Hapus class is-invalid & pesan error lama sebelum validasi
        $('#pegawaiForm_KHUSUS_INI').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        $('#pegawaiForm_KHUSUS_INI').find('.invalid-feedback, .valid-feedback').remove();

        // Jika fv tidak terdefinisi atau null (karena error init), submit saja
        if (typeof fv === 'undefined' || fv === null) {
          console.warn('FormValidation (fv) is not defined or null! Submitting form directly.');
          // console.log('Proceeding with manual validation...');
          // Validasi manual sederhana dengan pesan yang lebih jelas
          var isValid = true;
          var errorMessages = [];
          var requiredFields = [
            { name: 'ni_pegawai', label: 'Nomor Induk Pegawai' },
            { name: 'nama_pegawai', label: 'Nama Lengkap' },
            { name: 'nama_jabatan_pegawai', label: 'Nama Jabatan' },
            { name: 'id_jabatan', label: 'Jabatan' },
            { name: 'plt_pegawai', label: 'Status PLT' },
            { name: 'no_telp_pegawai', label: 'Nomor Telepon' },
            { name: 'tempat_lahir_pegawai', label: 'Tempat Lahir' },
            { name: 'tanggal_lahir_pegawai', label: 'Tanggal Lahir' },
            { name: 'alamat_pegawai', label: 'Alamat KTP' },
            { name: 'alamat_domisili_pegawai', label: 'Alamat Domisili' },
            { name: 'id_pangkat', label: 'Pangkat' },
            { name: 'id_golongan', label: 'Golongan' },
            { name: 'id_eselon', label: 'Eselon' },
            { name: 'status_pegawai', label: 'Status Pegawai' }
          ];

          requiredFields.forEach(function (field) {
            var element = $('#pegawaiForm_KHUSUS_INI').find('[name="' + field.name + '"]');
            // console.log(
            //   'Manual validation - Checking field:',
            //   field.name,
            //   'Element found:',
            //   element.length,
            //   'Value:',
            //   element.val()
            // );

            if (element.length > 0 && (!element.val() || element.val() === '')) {
              isValid = false;
              // console.log('Manual validation - Field', field.name, 'is empty, marking as invalid');
              element.addClass('is-invalid');

              // Force redraw to ensure styles are applied
              element[0].offsetHeight;

              // Add error message
              let msgElement = $(
                '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
              );
              msgElement.text(field.label + ' wajib diisi');
              // console.log(
              //   'Manual validation - Created error message for',
              //   field.name,
              //   ':',
              //   field.label + ' wajib diisi'
              // );

              // Place error message
              let targetElement = element;
              if (element.parent().hasClass('form-floating') || element.parent().hasClass('position-relative')) {
                targetElement = element.parent();
              }
              targetElement.after(msgElement);
              // console.log('Manual validation - Placed error message for', field.name);

              // Force visibility
              msgElement.show();
              msgElement.css('display', 'block');
              // console.log('Manual validation - Forced visibility for error message of', field.name);

              errorMessages.push('• ' + field.label + ' wajib diisi');
            }
          });

          // Cek radio button jk_pegawai
          var jkChecked = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]:checked').length > 0;
          // console.log('Manual validation - Radio button jk_pegawai checked:', jkChecked);

          if (!jkChecked) {
            isValid = false;
            // console.log('Manual validation - Radio button jk_pegawai not checked, marking as invalid');
            var jkElements = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]');
            // console.log('Manual validation - Found radio button elements:', jkElements.length);
            jkElements.addClass('is-invalid');

            // Force redraw to ensure styles are applied
            jkElements[0].offsetHeight;

            // Add error message for radio buttons
            let msgElement = $(
              '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
            );
            msgElement.text('Jenis Kelamin wajib dipilih');
            // console.log('Manual validation - Created error message for radio button');

            // Place error message after radio button container
            let targetElement = jkElements.closest('.d-flex') || jkElements.closest('.form-check');
            if (targetElement.length === 0) {
              targetElement = jkElements.parent();
            }
            // console.log('Manual validation - Target element for radio button:', targetElement);
            targetElement.after(msgElement);
            // console.log('Manual validation - Placed error message for radio button');

            // Force visibility
            msgElement.show();
            msgElement.css('display', 'block');
            // console.log('Manual validation - Forced visibility for radio button error message');

            errorMessages.push('• Jenis Kelamin wajib dipilih');
          }

          if (isValid) {
            submitFormAjax();
          } else {
            showAlertOnce({
              icon: 'error',
              title: 'Data Tidak Lengkap!',
              html: `<div style="text-align: left; max-width: 500px;">
                <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
                  <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                    Terdapat ${errorMessages.length} field yang wajib diisi
                  </p>
                  <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                    Silakan lengkapi semua field yang ditandai dengan warna merah di bawah ini:
                  </p>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                    ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                </div>
                <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                  <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                    <strong>💡 Tips:</strong> Field yang bermasalah akan ditandai dengan warna merah. Klik "OK" untuk melihat field yang perlu diperbaiki.
                  </p>
                </div>
              </div>`,
              customClass: {
                confirmButton: 'btn btn-danger',
                popup: 'swal2-popup-custom',
                container: 'swal2-container-custom'
              },
              allowOutsideClick: false,
              allowEscapeKey: true,
              focusConfirm: true
            });

            // Scroll to first error
            const firstError = $('#pegawaiForm_KHUSUS_INI').find('.is-invalid').first();
            if (firstError.length) {
              $('#offcanvasPegawai .offcanvas-body').animate(
                {
                  scrollTop: firstError.offset().top - $('#offcanvasPegawai .offcanvas-body').offset().top - 20
                },
                300
              );
            }
          }
          return;
        }

        // Validasi form dengan error handling yang lebih baik
        try {
          fv.validate()
            .then(function (status) {
              // console.log('FV validation status:', status);
              if (status === 'Valid') {
                submitFormAjax(); // Panggil fungsi AJAX jika valid
              } else {
                // Jika validasi gagal (sisi klien)
                // console.log('Form validation failed!');

                // Tampilkan error manual dengan detail
                try {
                  // Try different methods to get invalid fields
                  let invalidFields = {};

                  // Method 1: Try getInvalidFields
                  if (typeof fv.getInvalidFields === 'function') {
                    invalidFields = fv.getInvalidFields();
                    // console.log('Using getInvalidFields method');
                  }
                  // Method 2: Try getInvalidElements
                  else if (typeof fv.getInvalidElements === 'function') {
                    invalidFields = fv.getInvalidElements();
                    // console.log('Using getInvalidElements method');
                  }
                  // Method 3: Try getErrors
                  else if (typeof fv.getErrors === 'function') {
                    invalidFields = fv.getErrors();
                    // console.log('Using getErrors method');
                  }
                  // Method 4: Try validate and get results
                  else if (typeof fv.validate === 'function') {
                    fv.validate().then(function (result) {
                      if (result && result.invalidFields) {
                        invalidFields = result.invalidFields;
                        // console.log('Using validate result method');
                      }
                    });
                  }
                  // Method 5: Fallback - manual validation
                  else {
                    // console.log('FormValidation methods not available, using manual validation');
                    // Use manual validation instead
                    showAlertOnce({
                      icon: 'error',
                      title: 'Data Tidak Valid!',
                      html: `<div style="text-align: left; max-width: 500px;">
                        <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
                          <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                            Data form tidak valid
                          </p>
                          <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                            Mohon periksa kembali isian form Anda. Pastikan semua field diisi dengan benar.
                          </p>
                        </div>
                        <div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
                          <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                            <strong>💡 Tips:</strong> Field yang bermasalah akan ditandai dengan warna merah. Periksa detail error di bawah ini.
                          </p>
                        </div>
                      </div>`,
                      customClass: {
                        confirmButton: 'btn btn-danger',
                        popup: 'swal2-popup-custom',
                        container: 'swal2-container-custom'
                      },
                      allowOutsideClick: false,
                      allowEscapeKey: true,
                      focusConfirm: true
                    });
                    return;
                  }

                  // console.log('Invalid fields:', invalidFields); // Cek field apa saja yang gagal

                  // Check if invalidFields is empty or has no properties
                  var hasInvalidFields = false;
                  for (const key in invalidFields) {
                    if (invalidFields.hasOwnProperty(key)) {
                      hasInvalidFields = true;
                      break;
                    }
                  }

                  // If no invalid fields detected by FormValidation, use manual validation
                  if (!hasInvalidFields || Object.keys(invalidFields).length === 0) {
                    // console.log('FormValidation returned empty invalid fields, using manual validation');

                    // Manual validation for common fields
                    var manualErrors = [];
                    var manualErrorCount = 0;

                    // Check required fields manually
                    var requiredFields = [
                      { name: 'ni_pegawai', label: 'Nomor Induk Pegawai' },
                      { name: 'nama_pegawai', label: 'Nama Lengkap' },
                      { name: 'nama_jabatan_pegawai', label: 'Nama Jabatan' },
                      { name: 'id_jabatan', label: 'Jabatan' },
                      { name: 'plt_pegawai', label: 'Status PLT' },
                      { name: 'no_telp_pegawai', label: 'Nomor Telepon' },
                      { name: 'tempat_lahir_pegawai', label: 'Tempat Lahir' },
                      { name: 'tanggal_lahir_pegawai', label: 'Tanggal Lahir' },
                      { name: 'alamat_pegawai', label: 'Alamat KTP' },
                      { name: 'alamat_domisili_pegawai', label: 'Alamat Domisili' },
                      { name: 'id_pangkat', label: 'Pangkat' },
                      { name: 'id_golongan', label: 'Golongan' },
                      { name: 'id_eselon', label: 'Eselon' },
                      { name: 'status_pegawai', label: 'Status Pegawai' }
                    ];

                    // Clear previous errors
                    $('#pegawaiForm_KHUSUS_INI .is-invalid').removeClass('is-invalid');
                    $('#pegawaiForm_KHUSUS_INI .invalid-feedback').remove();

                    // Check each required field
                    requiredFields.forEach(function (field) {
                      var element = $('#pegawaiForm_KHUSUS_INI').find('[name="' + field.name + '"]');
                      // console.log(
                      //   'Manual validation - Checking field:',
                      //   field.name,
                      //   'Element found:',
                      //   element.length,
                      //   'Value:',
                      //   element.val()
                      // );

                      if (element.length > 0) {
                        var fieldValue = element.val();
                        var isFieldValid = true;
                        var errorMessage = '';

                        // Check if field is empty
                        if (!fieldValue || fieldValue === '') {
                          isFieldValid = false;
                          errorMessage = field.label + ' wajib diisi';
                        }
                        // Check field format based on field name
                        else {
                          // Nama field validation
                          if (field.name === 'nama_pegawai' || field.name === 'nama_jabatan_pegawai') {
                            // Check if contains numbers
                            if (/\d/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage = field.label + ' tidak boleh mengandung angka';
                            }
                            // Check if contains special characters (except allowed ones)
                            else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'.,\-\s]+$/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage =
                                field.label + ' hanya boleh huruf, spasi, titik, koma, apostrof, dan tanda minus';
                            }
                          }
                          // NI Pegawai validation
                          else if (field.name === 'ni_pegawai') {
                            if (!/^[0-9]+$/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage = field.label + ' hanya boleh berisi angka';
                            } else if (fieldValue.length < 10 || fieldValue.length > 18) {
                              isFieldValid = false;
                              errorMessage = field.label + ' harus antara 10 - 18 karakter';
                            }
                          }
                          // Phone number validation
                          else if (field.name === 'no_telp_pegawai') {
                            if (!/^[0-9+\-\s()]+$/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage = field.label + ' format tidak valid';
                            }
                          }
                          // Address validation
                          else if (field.name === 'alamat_pegawai' || field.name === 'alamat_domisili_pegawai') {
                            if (fieldValue.length < 10) {
                              isFieldValid = false;
                              errorMessage = field.label + ' minimal 10 karakter';
                            } else if (!/^[A-Za-z0-9À-ÖØ-öø-ÿ'.,()\/\-\s]+$/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage = field.label + ' hanya boleh huruf/angka dan tanda . , ( ) / -';
                            }
                          }
                          // Place of birth validation
                          else if (field.name === 'tempat_lahir_pegawai') {
                            if (fieldValue.length < 2) {
                              isFieldValid = false;
                              errorMessage = field.label + ' minimal 2 karakter';
                            } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'\.\-\s]+$/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage =
                                field.label + ' hanya boleh huruf, spasi, titik, apostrof, dan tanda minus';
                            }
                          }
                          // Date validation
                          else if (field.name === 'tanggal_lahir_pegawai') {
                            var dateValue = new Date(fieldValue);
                            var today = new Date();
                            if (isNaN(dateValue.getTime())) {
                              isFieldValid = false;
                              errorMessage = field.label + ' format tidak valid';
                            } else if (dateValue > today) {
                              isFieldValid = false;
                              errorMessage = field.label + ' tidak boleh di masa depan';
                            }
                          }
                        }

                        if (!isFieldValid) {
                          manualErrorCount++;
                          // console.log('Manual validation - Field', field.name, 'is invalid:', errorMessage);
                          element.addClass('is-invalid');

                          // Force redraw to ensure styles are applied
                          element[0].offsetHeight;

                          // Add error message
                          let msgElement = $(
                            '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
                          );
                          msgElement.text(errorMessage);
                          // console.log('Manual validation - Created error message for', field.name, ':', errorMessage);

                          // Place error message
                          let targetElement = element;
                          if (
                            element.parent().hasClass('form-floating') ||
                            element.parent().hasClass('position-relative')
                          ) {
                            targetElement = element.parent();
                          }
                          targetElement.after(msgElement);
                          // console.log('Manual validation - Placed error message for', field.name);

                          // Force visibility
                          msgElement.show();
                          msgElement.css('display', 'block');
                          // console.log('Manual validation - Forced visibility for error message of', field.name);

                          manualErrors.push('• ' + errorMessage);
                        }
                      }
                    });

                    // Check radio button
                    var jkChecked = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]:checked').length > 0;
                    // console.log('Manual validation - Radio button jk_pegawai checked:', jkChecked);

                    if (!jkChecked) {
                      manualErrorCount++;
                      // console.log('Manual validation - Radio button jk_pegawai not checked, marking as invalid');
                      var jkElements = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]');
                      // console.log('Manual validation - Found radio button elements:', jkElements.length);
                      jkElements.addClass('is-invalid');

                      // Force redraw to ensure styles are applied
                      jkElements[0].offsetHeight;

                      // Add error message for radio buttons
                      let msgElement = $(
                        '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
                      );
                      msgElement.text('Jenis Kelamin wajib dipilih');
                      // console.log('Manual validation - Created error message for radio button');

                      let targetElement = jkElements.closest('.d-flex') || jkElements.closest('.form-check');
                      if (targetElement.length === 0) {
                        targetElement = jkElements.parent();
                      }
                      // console.log('Manual validation - Target element for radio button:', targetElement);
                      targetElement.after(msgElement);
                      // console.log('Manual validation - Placed error message for radio button');

                      msgElement.show();
                      msgElement.css('display', 'block');
                      // console.log('Manual validation - Forced visibility for radio button error message');

                      manualErrors.push('• Jenis Kelamin wajib dipilih');
                    }

                    // Show detailed error message
                    showAlertOnce({
                      icon: 'error',
                      title: 'Data Tidak Valid!',
                      html: `<div style="text-align: left; max-width: 500px;">
                        <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
                          <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                            Terdapat ${manualErrorCount} kesalahan dalam data yang Anda masukkan
                          </p>
                          <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                            Silakan perbaiki field yang ditandai dengan warna merah di bawah ini:
                          </p>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                          <ul style="margin: 0; padding-left: 20px; color: #495057;">
                            ${manualErrors.map(msg => `<li>${msg}</li>`).join('')}
                          </ul>
                        </div>
                        <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                          <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                            <strong>💡 Tips:</strong> Field yang bermasalah akan ditandai dengan warna merah. Klik "OK" untuk melihat field yang perlu diperbaiki.
                          </p>
                        </div>
                      </div>`,
                      customClass: {
                        confirmButton: 'btn btn-danger',
                        popup: 'swal2-popup-custom',
                        container: 'swal2-container-custom'
                      },
                      allowOutsideClick: false,
                      allowEscapeKey: true,
                      focusConfirm: true
                    });

                    return; // Exit early since we handled it manually
                  }

                  var errorMessages = [];
                  var errorCount = 0;

                  for (const fieldName in invalidFields) {
                    errorCount++;
                    // console.log('Processing field:', fieldName, 'Messages:', invalidFields[fieldName]);
                    const element = $('#pegawaiForm_KHUSUS_INI').find(`[name="${fieldName}"]`);
                    // console.log('Found element for', fieldName, ':', element.length, element);

                    if (element.length > 0) {
                      // Add invalid class with animation
                      element.addClass('is-invalid');
                      // console.log('Added is-invalid class to', fieldName);

                      // Force redraw to ensure styles are applied
                      element[0].offsetHeight;

                      const messages = invalidFields[fieldName];
                      // console.log('Messages for', fieldName, ':', messages);

                      // Buat elemen pesan error jika belum ada
                      let msgElement = element
                        .closest('.mb-5, .col-md-6, .form-floating, .position-relative, .d-flex')
                        .find('.invalid-feedback');
                      // console.log('Existing error message element:', msgElement.length);

                      if (msgElement.length === 0) {
                        msgElement = $(
                          '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
                        );
                        // console.log('Created new error message element for', fieldName);

                        // Tempatkan pesan error setelah elemen atau wrappernya
                        let targetElement = element;
                        if (
                          element.parent().hasClass('form-floating') ||
                          element.parent().hasClass('position-relative')
                        ) {
                          targetElement = element.parent();
                        } else if (element.attr('type') === 'radio' || element.attr('type') === 'checkbox') {
                          targetElement = element.closest('.d-flex') || element;
                        }
                        // console.log('Target element for', fieldName, ':', targetElement);
                        targetElement.after(msgElement);
                        // console.log('Placed error message after target element for', fieldName);
                      }
                      msgElement.html(messages.join('<br/>')); // Tampilkan semua pesan error
                      // console.log('Set error message content for', fieldName, ':', messages.join('<br/>'));

                      // Force visibility
                      msgElement.show();
                      msgElement.css('display', 'block');
                      // console.log('Forced visibility for error message of', fieldName);

                      // Add to error messages list
                      errorMessages.push('' + messages[0]);
                      // console.log('Added to error messages list:', '' + messages[0]);
                    } else {
                      console.warn('Element not found for field:', fieldName);
                    }
                  }

                  // Show detailed error message
                  showAlertOnce({
                    icon: 'error',
                    title: 'Data Tidak Valid!',
                    html: `<div style="text-align: left; max-width: 500px;">
                      <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
                        <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                          Terdapat ${errorCount} kesalahan dalam data yang Anda masukkan
                        </p>
                        <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                          Silakan perbaiki field yang ditandai dengan warna merah di bawah ini:
                        </p>
                      </div>
                      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                        <ul style="margin: 0; padding-left: 20px; color: #495057;">
                          ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                        </ul>
                      </div>
                      <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                        <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                          <strong>💡 Tips:</strong> Field yang bermasalah akan ditandai dengan warna merah. Klik "OK" untuk melihat field yang perlu diperbaiki.
                        </p>
                      </div>
                    </div>`,
                    customClass: {
                      confirmButton: 'btn btn-danger',
                      popup: 'swal2-popup-custom',
                      container: 'swal2-container-custom'
                    },
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    focusConfirm: true
                  });

                  // Scroll ke error pertama
                  const errorField = $('#pegawaiForm_KHUSUS_INI').find('.is-invalid').first();
                  if (errorField.length) {
                    $('#offcanvasPegawai .offcanvas-body').animate(
                      {
                        scrollTop: errorField.offset().top - $('#offcanvasPegawai .offcanvas-body').offset().top - 20
                      },
                      300
                    );
                  }
                } catch (error) {
                  console.error('Error displaying validation messages:', error);

                  // Fallback to manual validation
                  // console.log('FormValidation failed, using manual validation fallback');

                  // Manual validation for common fields
                  var manualErrors = [];
                  var manualErrorCount = 0;

                  // Check required fields manually
                  var requiredFields = [
                    { name: 'ni_pegawai', label: 'Nomor Induk Pegawai' },
                    { name: 'nama_pegawai', label: 'Nama Lengkap' },
                    { name: 'nama_jabatan_pegawai', label: 'Nama Jabatan' },
                    { name: 'id_jabatan', label: 'Jabatan' },
                    { name: 'plt_pegawai', label: 'Status PLT' },
                    { name: 'no_telp_pegawai', label: 'Nomor Telepon' },
                    { name: 'tempat_lahir_pegawai', label: 'Tempat Lahir' },
                    { name: 'tanggal_lahir_pegawai', label: 'Tanggal Lahir' },
                    { name: 'alamat_pegawai', label: 'Alamat KTP' },
                    { name: 'alamat_domisili_pegawai', label: 'Alamat Domisili' },
                    { name: 'id_pangkat', label: 'Pangkat' },
                    { name: 'id_golongan', label: 'Golongan' },
                    { name: 'id_eselon', label: 'Eselon' },
                    { name: 'status_pegawai', label: 'Status Pegawai' }
                  ];

                  // Clear previous errors
                  $('#pegawaiForm_KHUSUS_INI .is-invalid').removeClass('is-invalid');
                  $('#pegawaiForm_KHUSUS_INI .invalid-feedback').remove();

                  // Check each required field
                  requiredFields.forEach(function (field) {
                    var element = $('#pegawaiForm_KHUSUS_INI').find('[name="' + field.name + '"]');
                    if (element.length > 0 && (!element.val() || element.val() === '')) {
                      manualErrorCount++;
                      element.addClass('is-invalid');

                      // Add error message
                      let msgElement = $(
                        '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
                      );
                      msgElement.text(field.label + ' wajib diisi');

                      // Place error message
                      let targetElement = element;
                      if (
                        element.parent().hasClass('form-floating') ||
                        element.parent().hasClass('position-relative')
                      ) {
                        targetElement = element.parent();
                      }
                      targetElement.after(msgElement);

                      // Force visibility
                      msgElement.show();
                      msgElement.css('display', 'block');

                      manualErrors.push('• ' + field.label + ' wajib diisi');
                    }
                  });

                  // Check radio button
                  var jkChecked = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]:checked').length > 0;
                  if (!jkChecked) {
                    manualErrorCount++;
                    var jkElements = $('#pegawaiForm_KHUSUS_INI').find('input[name="jk_pegawai"]');
                    jkElements.addClass('is-invalid');

                    // Add error message for radio buttons
                    let msgElement = $(
                      '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
                    );
                    msgElement.text('Jenis Kelamin wajib dipilih');

                    let targetElement = jkElements.closest('.d-flex') || jkElements.closest('.form-check');
                    if (targetElement.length === 0) {
                      targetElement = jkElements.parent();
                    }
                    targetElement.after(msgElement);

                    msgElement.show();
                    msgElement.css('display', 'block');

                    manualErrors.push('• Jenis Kelamin wajib dipilih');
                  }

                  // Show detailed error message
                  showAlertOnce({
                    icon: 'error',
                    title: 'Data Tidak Valid!',
                    html: `<div style="text-align: left; max-width: 500px;">
                      <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
                        <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                          Terdapat ${manualErrorCount} kesalahan dalam data yang Anda masukkan
                        </p>
                        <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                          Silakan perbaiki field yang ditandai dengan warna merah di bawah ini:
                        </p>
                      </div>
                      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                        <ul style="margin: 0; padding-left: 20px; color: #495057;">
                          ${manualErrors.map(msg => `<li>${msg}</li>`).join('')}
                        </ul>
                      </div>
                      <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                        <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                          <strong>💡 Tips:</strong> Field yang bermasalah akan ditandai dengan warna merah. Klik "OK" untuk melihat field yang perlu diperbaiki.
                        </p>
                      </div>
                    </div>`,
                    customClass: {
                      confirmButton: 'btn btn-danger',
                      popup: 'swal2-popup-custom',
                      container: 'swal2-container-custom'
                    },
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    focusConfirm: true
                  });
                }
              }
            })
            .catch(function (error) {
              console.error('FV validation error:', error);
              // Jika error, submit langsung
              submitFormAjax();
            });
        } catch (error) {
          console.error('Error during form validation:', error);
          // Jika error, submit langsung
          submitFormAjax();
        }
      });
  }, 1000); // Tunggu 1 detik untuk memastikan form sudah ada

  // --- Fungsi AJAX Terpisah (Tidak Berubah) ---
  function submitFormAjax() {
    // console.log('=== SUBMIT FORM AJAX DEBUG ===');
    // console.log('submitFormAjax called');
    if (isSubmittingPegawai) {
      console.warn('Submit is already in progress. Ignoring duplicate submit.');
      return;
    }
    isSubmittingPegawai = true;

    // Show loading screen and button loading
    var id = $('#pegawai_id').val();
    var loadingMessage = id ? 'Memperbarui data pegawai...' : 'Menyimpan data pegawai...';
    showLoadingScreen(loadingMessage);
    setButtonLoading(true);
    var formData = new FormData($('#pegawaiForm_KHUSUS_INI')[0]);
    var id = $('#pegawai_id').val();
    var url = id ? '/pegawai/' + id : '/pegawai';
    var method = id ? 'PUT' : 'POST';
    // console.log('URL:', url, 'ID:', id, 'Method:', method);

    // Debug form data
    // console.log('Form data entries:');
    for (var pair of formData.entries()) {
      // console.log(pair[0] + ': ' + pair[1]);
    }

    // Debug foto
    // var fotoFile = $('#foto_pegawai')[0].files[0];
    // console.log('Foto file:', fotoFile);
    // if (fotoFile) {
    //   console.log('Foto file name:', fotoFile.name);
    //   console.log('Foto file size:', fotoFile.size);
    //   console.log('Foto file type:', fotoFile.type);
    // } else {
    //   console.log('No foto file selected');
    // }
    if (id) {
      formData.append('_method', 'PUT');
      // Jangan hapus foto_pegawai dari FormData jika tidak ada file baru
      // Biarkan server yang menangani apakah foto perlu diupdate atau tidak
    }

    // Add CSRF token
    var csrfToken = $('meta[name="csrf-token"]').attr('content');
    // console.log('CSRF Token:', csrfToken);
    if (csrfToken) {
      formData.append('_token', csrfToken);
    } else {
      console.warn('CSRF token not found!');
      // Try to get from form if available
      var formToken = $('#pegawaiForm_KHUSUS_INI').find('input[name="_token"]').val();
      if (formToken) {
        formData.append('_token', formToken);
        // console.log('Using form CSRF token:', formToken);
      }
    }

    // console.log('Sending AJAX request to:', url);
    $.ajax({
      data: formData,
      url: url,
      type: 'POST',
      contentType: false,
      processData: false,
      success: function (data) {
        // console.log('AJAX success:', data);

        // Add delay before showing success alert for better UX
        setTimeout(function () {
          hideLoadingScreen();
          setButtonLoading(false);
          $('#offcanvasPegawai').offcanvas('hide');
          // Reload table with smooth loading indicator
          table.ajax.reload(null, false);

          // Show success alert with smooth animation after loading screen is fully hidden
          setTimeout(function () {
            showAlertOnce({
              icon: 'success',
              title: 'Berhasil!',
              text: data.success,
              showClass: {
                popup: 'swal2-show'
              },
              hideClass: {
                popup: 'swal2-hide'
              },
              customClass: {
                confirmButton: 'btn btn-success',
                popup: 'swal2-popup-custom'
              },
              timer: 3000,
              timerProgressBar: true
            });
          }, 800); // Wait for loading screen to fully disappear
        }, 200); // Small delay to ensure loading screen is visible

        isSubmittingPegawai = false;
      },
      error: function (xhr, status, error) {
        console.error('=== AJAX ERROR DEBUG ===');
        console.error('Status:', status);
        console.error('Error:', error);
        console.error('Response:', xhr.responseText);
        console.error('Status Code:', xhr.status);

        hideLoadingScreen();
        setButtonLoading(false);

        if (xhr.responseJSON && xhr.responseJSON.errors) {
          console.warn('Server validation errors:', xhr.responseJSON.errors);

          // Collect all error messages
          var errorMessages = [];
          var errorCount = 0;

          // Clear previous errors first
          $('#pegawaiForm_KHUSUS_INI .is-invalid').removeClass('is-invalid');
          $('#pegawaiForm_KHUSUS_INI .invalid-feedback').remove();

          // Tandai field invalid (manual)
          $.each(xhr.responseJSON.errors, function (key, value) {
            errorCount++;
            // console.log('Processing error for field:', key, 'Value:', value);

            const element = $('#pegawaiForm_KHUSUS_INI').find(`[name="${key}"]`);
            // console.log('Found element:', element.length, element);

            if (element.length > 0) {
              // Add invalid class with animation
              element.addClass('is-invalid');

              // Force redraw to ensure styles are applied
              element[0].offsetHeight;

              // Buat elemen pesan error yang lebih baik
              let msgElement = $(
                '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
              );
              msgElement.text(value[0]);

              // Tempatkan pesan error di tempat yang tepat
              let targetElement = element;
              if (element.parent().hasClass('form-floating')) {
                targetElement = element.parent();
              } else if (element.parent().hasClass('position-relative')) {
                targetElement = element.parent();
              } else if (element.attr('type') === 'radio' || element.attr('type') === 'checkbox') {
                targetElement = element.closest('.d-flex') || element;
              }

              // Hapus pesan error lama jika ada
              targetElement.find('.invalid-feedback').remove();
              targetElement.after(msgElement);

              // Force visibility
              msgElement.show();
              msgElement.css('display', 'block');

              // console.log('Added error message for field:', key);
              errorMessages.push('• ' + value[0]);
            } else {
              console.warn('Element not found for field:', key);
            }
          });

          // Show detailed error message with better formatting
          // console.log('Total errors:', errorCount, 'Error messages:', errorMessages);

          // Create detailed error message with field names
          var detailedErrors = [];
          $.each(xhr.responseJSON.errors, function (key, value) {
            var fieldName = getFieldDisplayName(key);
            detailedErrors.push(`<li><strong>${fieldName}:</strong> ${value[0]}</li>`);
          });

          showAlertOnce({
            icon: 'error',
            title: 'Data Tidak Valid!',
            html: `<div style="text-align: left; max-width: 500px;">
              <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
                <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                  Terdapat ${errorCount} kesalahan dalam data yang Anda masukkan
                </p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                  Silakan perbaiki field yang ditandai dengan warna merah di bawah ini:
                </p>
              </div>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                <ul style="margin: 0; padding-left: 20px; color: #495057;">
                  ${detailedErrors.join('')}
                </ul>
              </div>
              <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                  <strong>💡 Tips:</strong> Field yang bermasalah akan ditandai dengan warna merah. Klik "OK" untuk melihat field yang perlu diperbaiki.
                </p>
              </div>
            </div>`,
            customClass: {
              confirmButton: 'btn btn-danger',
              popup: 'swal2-popup-custom',
              container: 'swal2-container-custom'
            },
            allowOutsideClick: false,
            allowEscapeKey: true,
            focusConfirm: true
          });

          // Scroll to first error with better positioning
          const firstError = $('#pegawaiForm_KHUSUS_INI').find('.is-invalid').first();
          if (firstError.length) {
            // Wait for error message to be rendered
            setTimeout(function () {
              const offcanvasBody = $('#offcanvasPegawai .offcanvas-body');
              const errorOffset = firstError.offset().top - offcanvasBody.offset().top;
              offcanvasBody.animate(
                {
                  scrollTop: errorOffset - 50
                },
                500
              );
            }, 100);
          }
        } else {
          // Enhanced error handling with more detailed information
          var errorMessage = 'Maaf, terjadi kesalahan saat menyimpan data.';
          var errorDetails = '';
          var errorTitle = 'Terjadi Kesalahan!';

          if (xhr.status === 0) {
            errorMessage = 'Tidak dapat terhubung ke server.';
            errorDetails = 'Periksa koneksi internet Anda dan pastikan server sedang berjalan.';
            errorTitle = 'Koneksi Gagal!';
          } else if (xhr.status === 500) {
            errorMessage = 'Terjadi kesalahan di server.';
            errorDetails =
              'Server mengalami masalah internal. Silakan coba lagi dalam beberapa saat atau hubungi administrator.';
            errorTitle = 'Server Error!';
          } else if (xhr.status === 404) {
            errorMessage = 'Halaman tidak ditemukan.';
            errorDetails = 'URL yang diminta tidak dapat ditemukan. Silakan refresh halaman dan coba lagi.';
            errorTitle = 'Halaman Tidak Ditemukan!';
          } else if (xhr.status === 422) {
            errorMessage = 'Data yang dikirim tidak valid.';
            errorDetails = 'Server menolak data yang dikirim. Silakan periksa kembali isian form.';
            errorTitle = 'Data Tidak Valid!';
          } else if (xhr.status === 403) {
            errorMessage = 'Anda tidak memiliki izin untuk melakukan aksi ini.';
            errorDetails = 'Kontak administrator untuk mendapatkan akses yang diperlukan.';
            errorTitle = 'Akses Ditolak!';
          } else if (xhr.status === 401) {
            errorMessage = 'Sesi Anda telah berakhir.';
            errorDetails = 'Silakan login kembali untuk melanjutkan.';
            errorTitle = 'Sesi Berakhir!';
          } else if (xhr.status === 413) {
            errorMessage = 'File yang diupload terlalu besar.';
            errorDetails = 'Ukuran file melebihi batas maksimal yang diizinkan.';
            errorTitle = 'File Terlalu Besar!';
          } else if (xhr.status === 415) {
            errorMessage = 'Format file tidak didukung.';
            errorDetails = 'Pastikan file yang diupload dalam format yang benar (JPG, PNG, GIF).';
            errorTitle = 'Format File Tidak Didukung!';
          }

          // Try to get more detailed error information from response
          var serverError = '';
          try {
            if (xhr.responseJSON && xhr.responseJSON.message) {
              serverError = xhr.responseJSON.message;
            } else if (xhr.responseText) {
              // Try to parse response text for error details
              var responseText = xhr.responseText;
              if (responseText.includes('SQLSTATE') || responseText.includes('Exception')) {
                serverError = 'Terjadi kesalahan database. Silakan coba lagi.';
              } else if (responseText.includes('TokenMismatchException')) {
                serverError = 'Token keamanan tidak valid. Silakan refresh halaman.';
              }
            }
          } catch (e) {
            console.warn('Could not parse error response:', e);
          }

          showAlertOnce({
            icon: 'error',
            title: errorTitle,
            html: `<div style="text-align: left; max-width: 500px;">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                  ${errorMessage}
                </p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                  ${errorDetails}
                </p>
              </div>
              ${
                serverError
                  ? `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #dc3545;">
                  <p style="margin: 0; font-size: 0.9rem; color: #495057;">
                    <strong>Detail Error:</strong> ${serverError}
                  </p>
                </div>
              `
                  : ''
              }
              <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                  <strong>Kode Error:</strong> ${xhr.status} |
                  <strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #666;">
                  Jika masalah berlanjut, silakan hubungi administrator dengan informasi di atas.
                </p>
              </div>
            </div>`,
            customClass: {
              confirmButton: 'btn btn-danger',
              popup: 'swal2-popup-custom',
              container: 'swal2-container-custom'
            },
            allowOutsideClick: false,
            allowEscapeKey: true,
            focusConfirm: true
          });
        }
        isSubmittingPegawai = false;
      },
      complete: function () {
        // Ensure loading screen is hidden and flag is reset
        hideLoadingScreen();
        setButtonLoading(false);
        isSubmittingPegawai = false;
      }
    });
  }
  // --- Akhir Fungsi AJAX ---

  // Event handler alternatif untuk tombol submit (click event)
  setTimeout(function () {
    // console.log('Setting up submit button click handler...');
    $('body')
      .off('click', '#pegawaiForm_KHUSUS_INI button[type="submit"]')
      .on('click', '#pegawaiForm_KHUSUS_INI button[type="submit"]', function (e) {
        e.preventDefault();
        // console.log('=== SUBMIT BUTTON CLICKED ===');
        // console.log('Submit button clicked directly');
        // console.log('Form element:', $('#pegawaiForm_KHUSUS_INI')[0]);
        // console.log('Form validation status:', typeof fv, fv);

        // Prevent multiple clicks
        if (isSubmittingPegawai) {
          console.warn('Submit already in progress, ignoring click');
          return;
        }

        $('#pegawaiForm_KHUSUS_INI').trigger('submit');
      });
  }, 1000);

  // Event handler sederhana untuk tombol submit (fallback) - DISABLED untuk menghindari duplikasi
  // $(document)
  //   .off('click', 'button[type="submit"]')
  //   .on('click', 'button[type="submit"]', function (e) {
  //     // Fallback handler disabled to prevent duplicate submissions
  //   });

  // DELETE
  $('body')
    .off('click', '.delete-btn')
    .on('click', '.delete-btn', function () {
      // (Kode delete Anda sudah benar)
      var id = $(this).data('id');
      showAlertOnce({
        title: 'Apakah Anda Yakin?',
        text: 'Data yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        customClass: { confirmButton: 'btn btn-primary me-3', cancelButton: 'btn btn-label-secondary' },
        buttonsStyling: false
      }).then(function (result) {
        if (result.isConfirmed) {
          $.ajax({
            type: 'DELETE',
            url: '/pegawai/' + id,
            success: function (data) {
              // Reload table with smooth loading indicator
              table.ajax.reload(null, false);
              showAlertOnce({
                icon: 'success',
                title: 'Dihapus!',
                text: data.success,
                showClass: {
                  popup: 'swal2-show'
                },
                hideClass: {
                  popup: 'swal2-hide'
                },
                customClass: {
                  confirmButton: 'btn btn-success',
                  popup: 'swal2-popup-custom'
                },
                timer: 3000,
                timerProgressBar: true
              });
            },
            error: function (data) {
              showAlertOnce({
                icon: 'error',
                title: 'Gagal Menghapus!',
                html: `<div style="text-align: left; max-width: 500px;">
                  <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 15px;">
                    <p style="margin: 0; font-weight: 600; color: #dc3545; font-size: 1.1rem;">
                      Tidak dapat menghapus data pegawai
                    </p>
                    <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
                      Terjadi kesalahan saat menghapus data. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
                    </p>
                  </div>
                  <div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
                    <p style="margin: 0; font-size: 0.9rem; color: #1976d2;">
                      <strong>💡 Solusi:</strong> Coba refresh halaman atau hubungi administrator jika masalah berlanjut.
                    </p>
                  </div>
                </div>`,
                customClass: {
                  confirmButton: 'btn btn-danger',
                  popup: 'swal2-popup-custom',
                  container: 'swal2-container-custom'
                },
                allowOutsideClick: false,
                allowEscapeKey: true,
                focusConfirm: true
              });
            }
          });
        }
      });
    });
}); // Akhir $(document).ready
