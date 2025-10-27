/**
 * Halaman Daftar user (Versi Final FIX - Hapus Plugin Bootstrap5 FV)
 */

'use strict';

$(document).ready(function () {
  // Guard & Utilities to avoid duplicate submits/alerts
  var isSubmittinguser = false;
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
      username: 'Username',
      password: 'Password',
      id_user: 'user',
      id_role: 'Role',
      active: 'Status'
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
      'Memuat data user...' +
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
  // console.log('Form element exists:', $('#userForm').length);
  // console.log('Submit button exists:', $('#userForm button[type="submit"]').length);
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
    initSelect2('#id_user', 'Pilih user');
  }, 100);
  // --- AKHIR SELECT2 ---

  // --- VARIABEL GLOBAL UNTUK FV ---
  let fv;

  // --- FUNGSI INISIALISASI FV ---
  function initFormValidation() {
    setTimeout(function () {
      const userForm = document.getElementById('userForm');
      if (!userForm) {
        console.error('Form #userForm tidak ditemukan!');
        return;
      }

      try {
        fv = FormValidation.formValidation(userForm, {
          fields: {
            username: {
              validators: {
                notEmpty: { message: 'Username wajib diisi.' },
                stringLength: { min: 3, max: 255, message: 'Username harus antara 3 - 255 karakter.' },
                regexp: {
                  regexp: /^[A-Za-z0-9_.-]+$/,
                  message: 'Username hanya boleh berisi huruf, angka, titik, garis bawah, atau strip.'
                }
              }
            },

            password: {
              validators: {
                notEmpty: { message: 'Password wajib diisi.' },
                stringLength: { min: 8, message: 'Password minimal 8 karakter.' },
                regexp: {
                  regexp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/,
                  message: 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol spesial.'
                }
              }
            },

            id_pegawai: {
              validators: {
                integer: { message: 'ID Pegawai harus berupa angka.' }
              }
            },

            id_role: {
              validators: {
                notEmpty: { message: 'Role wajib dipilih.' },
                integer: { message: 'ID Role harus berupa angka.' }
              }
            },

            active: {
              validators: {
                notEmpty: { message: 'Status aktif wajib dipilih.' },
                between: {
                  min: 0,
                  max: 1,
                  message: 'Status aktif hanya boleh 0 (nonaktif) atau 1 (aktif).'
                }
              }
            }
          },
          plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            submitButton: new FormValidation.plugins.SubmitButton(),
            autoFocus: new FormValidation.plugins.AutoFocus()
          }
        });
      } catch (error) {
        console.error('FormValidation initialization failed:', error);
        fv = null;
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Validasi!',
          text: 'Terjadi kesalahan saat memuat sistem validasi. Silakan refresh halaman dan coba lagi.',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#d33'
        });
      }
    }, 500);
  }

  // Panggil inisialisasi setelah DOM siap
  initFormValidation();

  // --- REAL-TIME VALIDATION ---
  function initRealTimeValidation() {
    // Add real-time validation for all form fields
    $('#userForm').on('input change blur', 'input, select', function () {
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
          'username',
          'password',
          'id_user',
          'id_role',
          'active'
        ];

        if (requiredFields.includes(fieldName)) {
          isValid = false;
          errorMessage = getFieldDisplayName(fieldName) + ' wajib diisi';
        }
      }
      // Check field format based on field name
      else {
        // Username field validation
        if (fieldName === 'username') {
          // Check if contains numbers
          if (/\d/.test(fieldValue)) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' tidak boleh mengandung angka';
          }
          // Check if contains special characters (except allowed ones)
          else if (!/^[a-z.-]+$/.test(fieldValue)) {
            isValid = false;
            errorMessage =
              getFieldDisplayName(fieldName) + ' hanya boleh huruf kecil, titik, dan tanda minus';
          }
        }

        // Password validation
        else if (fieldName === 'password') {
          // Regex: minimal 8 karakter, ada huruf besar, kecil, angka, dan simbol
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

          if (fieldValue.trim() === '') {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' wajib diisi';
          } else if (fieldValue.length < 8) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) + ' minimal 8 karakter';
          } else if (!passwordRegex.test(fieldValue)) {
            isValid = false;
            errorMessage = getFieldDisplayName(fieldName) +
              ' harus mengandung huruf besar, huruf kecil, angka, dan simbol spesial';
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
    $('#userForm').on('change', 'input[name="active"]', function () {
      var jkElements = $('#userForm').find('input[name="active"]');
      var activeChecked = $('#userForm').find('input[name="active"]:checked').length > 0;

      if (activeChecked) {
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

        // console.log('Real-time validation - Radio button active is valid');
      }
    });
  }

  // Initialize real-time validation
  initRealTimeValidation();

  // Clear all error messages when form opens
  $('#userForm').on('show.bs.offcanvas', function () {
    // console.log('Form opened, clearing all error messages');

    // Clear all error states
    $('#userForm').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');

    // Remove all error messages with animation
    var allErrorMessages = $('#userForm').find('.invalid-feedback');
    allErrorMessages.addClass('removing');
    setTimeout(function () {
      allErrorMessages.remove();
    }, 300);
  });
  // --- AKHIR REAL-TIME VALIDATION ---
  // --- AKHIR VALIDASI ---

  var table = $('.datatables-user').DataTable({
    // (Konfigurasi DataTable Anda ... tetap sama)
    processing: true,
    serverSide: true,
    ajax: '/user/data',
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
      $('.dataTables_wrapper').on('change', 'select[name="datatables-user_length"]', function () {
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
      processing: 'Memuat data user...',
      loadingRecords: 'Memuat data user...',
      empty: 'Tidak ada data user',
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
      { data: 'username', name: 'username' },
      { data: 'nama_pegawai_user', name: 'nama_pegawai_user' },
      { data: 'active', name: 'active' },
      { data: 'failed_attempts', name: 'failed_attempts' },
      { data: 'last_attempt', name: 'last_attempt' },
      { data: 'action', name: 'action' }
    ],
    columnDefs: [
      { className: 'control', orderable: false, searchable: false, targets: 0 },
      { orderable: false, searchable: false, targets: [1, 2, 8] },
      { responsivePriority: 1, targets: 3 },
      { responsivePriority: 2, targets: 8 },
      {
        targets: 3, // Kolom username
        render: function (data, type, full, meta) {
          var $username = full['username'];
          var $row_output =
            '<div class="d-flex flex-column">' +
            '<span class="text-truncate text-heading fw-medium">' +
            ($username || '') +
            '</span>' +
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
          return '<span>' + (data || '-') + '</span>';
        }
      },
      {
        targets: 7,
        render: function (data, type, full, meta) {
          return '<span>' + (data || '-') + '</span>';
        }
      }
    ],
    order: [[2, 'asc']],
    dom: '<"row mx-4"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"row mx-4"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
    language: { search: '', searchPlaceholder: 'Cari user...' },
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
        '<button type="button" class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#offcanvasuser">' +
        '<i class="ri-add-line me-sm-1"></i> <span class="d-none d-sm-inline-block">Tambah user</span>' +
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
            return 'Detail dari ' + data['nama_pegawai_user'];
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
  $('body').on('click', '.btn-primary[data-bs-target="#offcanvasuser"]', function () {
    // Reset flags
    isSubmittinguser = false;
    isAlertVisible = false;
    setButtonLoading(false);

    $('#userForm').trigger('reset');
    // Hanya reset jika fv berhasil diinisialisasi
    if (typeof fv !== 'undefined' && fv !== null) {
      try {
        fv.resetForm(true);
      } catch (e) {
        console.warn('Error resetting form validation:', e);
      }
    }
    // Hapus class is-invalid secara manual
    $('#userForm').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
    $('#userForm').find('.invalid-feedback, .valid-feedback').remove(); // Hapus pesan error lama
    $('#user_id').val('');
    $('#offcanvasuserLabel').html('Tambah user');
    // Reset Select2 secara manual
    $('#id_pegawai').val(null).trigger('change');
    $('input[name="active"]').prop('checked', false);
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
              ID user tidak ditemukan
            </p>
            <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.95rem;">
              Tidak dapat menemukan ID user yang diminta. Silakan refresh halaman dan coba lagi.
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
    isSubmittinguser = false;
    isAlertVisible = false;
    setButtonLoading(false);

    // Reset form terlebih dahulu
    $('#userForm').trigger('reset');

    // Hanya reset jika fv berhasil diinisialisasi
    if (typeof fv !== 'undefined' && fv !== null) {
      try {
        fv.resetForm(true);
      } catch (e) {
        console.warn('Error resetting form validation:', e);
      }
    }

    // Hapus class is-invalid secara manual
    $('#userForm').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
    $('#userForm').find('.invalid-feedback, .valid-feedback').remove(); // Hapus pesan error lama

    $.get('/user/' + id + '/edit', function (data) {
      // console.log('Edit data received:', data);
      $('#offcanvasuserLabel').html('Edit user');
      // Isi form seperti biasa
      $('#user_id').val(data.id_user);
      $('#username').val(data.username);
      $('#password').val(data.password);
      if (data.active) {
        $('input[name="active"][value="' + data.active + '"]').prop('checked', true);
      }
      $('#id_pegawai').val(data.id_pegawai).trigger('change');
      $('#id_role').val(data.id_role).trigger('change');
      $('#offcanvasuser').offcanvas('show');
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
              Terjadi masalah saat mengambil data user dari server. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
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
    $('#userForm')
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
        $('#userForm').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        $('#userForm').find('.invalid-feedback, .valid-feedback').remove();

        // Jika fv tidak terdefinisi atau null (karena error init), submit saja
        if (typeof fv === 'undefined' || fv === null) {
          console.warn('FormValidation (fv) is not defined or null! Submitting form directly.');
          // console.log('Proceeding with manual validation...');
          // Validasi manual sederhana dengan pesan yang lebih jelas
          var isValid = true;
          var errorMessages = [];
          var requiredFields = [
            { name: 'username', label: 'Username' },
            { name: 'password', label: 'Password' },
            { name: 'id_pegawai', label: 'Pegawai' },
            { name: 'id_role', label: 'Role' }
          ];

          requiredFields.forEach(function (field) {
            var element = $('#userForm').find('[name="' + field.name + '"]');
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

          // Cek radio button active
          var activeChecked = $('#userForm').find('input[name="active"]:checked').length > 0;
          // console.log('Manual validation - Radio button active checked:', activeChecked);

          if (!activeChecked) {
            isValid = false;
            // console.log('Manual validation - Radio button active not checked, marking as invalid');
            var jkElements = $('#userForm').find('input[name="active"]');
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
            const firstError = $('#userForm').find('.is-invalid').first();
            if (firstError.length) {
              $('#offcanvasuser .offcanvas-body').animate(
                {
                  scrollTop: firstError.offset().top - $('#offcanvasuser .offcanvas-body').offset().top - 20
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
                      { name: 'username', label: 'Username' },
                      { name: 'password', label: 'Password' },
                      { name: 'id_pegawai', label: 'Pegawai' },
                      { name: 'id_role', label: 'Role' }
                    ];

                    // Clear previous errors
                    $('#userForm .is-invalid').removeClass('is-invalid');
                    $('#userForm .invalid-feedback').remove();

                    // Check each required field
                    requiredFields.forEach(function (field) {
                      var element = $('#userForm').find('[name="' + field.name + '"]');
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
                          if (field.name === 'username') {
                            // Check if contains numbers
                            if (/\d/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage = field.label + ' tidak boleh mengandung angka';
                            }
                            // Check if contains special characters (except allowed ones)
                            else if (!/^[a-z.-]+$/.test(fieldValue)) {
                              isFieldValid = false;
                              errorMessage =
                                field.label + ' hanya boleh huruf kecil, titik, dan tanda minus';
                            } else if (fieldValue.length < 6 || fieldValue.length > 20) {
                              isFieldValid = false;
                              errorMessage = field.label + ' harus antara 6 - 20 karakter';
                            }
                          }
                          // NI user validation
                          else if (fieldName === 'password') {
                            // Regex: minimal 8 karakter, ada huruf besar, kecil, angka, dan simbol
                            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

                            if (fieldValue.trim() === '') {
                              isValid = false;
                              errorMessage = getFieldDisplayName(fieldName) + ' wajib diisi';
                            } else if (fieldValue.length < 8) {
                              isValid = false;
                              errorMessage = getFieldDisplayName(fieldName) + ' minimal 8 karakter';
                            } else if (!passwordRegex.test(fieldValue)) {
                              isValid = false;
                              errorMessage = getFieldDisplayName(fieldName) +
                                ' harus mengandung huruf besar, huruf kecil, angka, dan simbol spesial';
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
                    var activeChecked = $('#userForm').find('input[name="active"]:checked').length > 0;
                    // console.log('Manual validation - Radio button active checked:', activeChecked);

                    if (!activeChecked) {
                      manualErrorCount++;
                      // console.log('Manual validation - Radio button active not checked, marking as invalid');
                      var jkElements = $('#userForm').find('input[name="active"]');
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
                    const element = $('#userForm').find(`[name="${fieldName}"]`);
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
                  const errorField = $('#userForm').find('.is-invalid').first();
                  if (errorField.length) {
                    $('#offcanvasuser .offcanvas-body').animate(
                      {
                        scrollTop: errorField.offset().top - $('#offcanvasuser .offcanvas-body').offset().top - 20
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
                    { name: 'username', label: 'Username' },
                    { name: 'password', label: 'Password' },
                    { name: 'id_pegawai', label: 'Pegawai' },
                    { name: 'id_role', label: 'Role' }
                  ];

                  // Clear previous errors
                  $('#userForm .is-invalid').removeClass('is-invalid');
                  $('#userForm .invalid-feedback').remove();

                  // Check each required field
                  requiredFields.forEach(function (field) {
                    var element = $('#userForm').find('[name="' + field.name + '"]');
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
                  var activeChecked = $('#userForm').find('input[name="active"]:checked').length > 0;
                  if (!activeChecked) {
                    manualErrorCount++;
                    var jkElements = $('#userForm').find('input[name="active"]');
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
    if (isSubmittinguser) {
      console.warn('Submit is already in progress. Ignoring duplicate submit.');
      return;
    }
    isSubmittinguser = true;

    // Show loading screen and button loading
    var id = $('#user_id').val();
    var loadingMessage = id ? 'Memperbarui data user...' : 'Menyimpan data user...';
    showLoadingScreen(loadingMessage);
    setButtonLoading(true);
    var formData = new FormData($('#userForm')[0]);
    var id = $('#user_id').val();
    var url = id ? '/user/' + id : '/user';
    var method = id ? 'PUT' : 'POST';
    // console.log('URL:', url, 'ID:', id, 'Method:', method);

    // Debug form data
    // console.log('Form data entries:');
    for (var pair of formData.entries()) {
      // console.log(pair[0] + ': ' + pair[1]);
    }

    // Debug foto
    // var fotoFile = $('#foto_user')[0].files[0];
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
      // Jangan hapus foto_user dari FormData jika tidak ada file baru
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
      var formToken = $('#userForm').find('input[name="_token"]').val();
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
          $('#offcanvasuser').offcanvas('hide');
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

        isSubmittinguser = false;
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
          $('#userForm .is-invalid').removeClass('is-invalid');
          $('#userForm .invalid-feedback').remove();

          // Tandai field invalid (manual)
          $.each(xhr.responseJSON.errors, function (key, value) {
            errorCount++;
            // console.log('Processing error for field:', key, 'Value:', value);

            const element = $('#userForm').find(`[name="${key}"]`);
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
          const firstError = $('#userForm').find('.is-invalid').first();
          if (firstError.length) {
            // Wait for error message to be rendered
            setTimeout(function () {
              const offcanvasBody = $('#offcanvasuser .offcanvas-body');
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
        isSubmittinguser = false;
      },
      complete: function () {
        // Ensure loading screen is hidden and flag is reset
        hideLoadingScreen();
        setButtonLoading(false);
        isSubmittinguser = false;
      }
    });
  }
  // --- Akhir Fungsi AJAX ---

  // Event handler alternatif untuk tombol submit (click event)
  setTimeout(function () {
    // console.log('Setting up submit button click handler...');
    $('body')
      .off('click', '#userForm button[type="submit"]')
      .on('click', '#userForm button[type="submit"]', function (e) {
        e.preventDefault();
        // console.log('=== SUBMIT BUTTON CLICKED ===');
        // console.log('Submit button clicked directly');
        // console.log('Form element:', $('#userForm')[0]);
        // console.log('Form validation status:', typeof fv, fv);

        // Prevent multiple clicks
        if (isSubmittinguser) {
          console.warn('Submit already in progress, ignoring click');
          return;
        }

        $('#userForm').trigger('submit');
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
            url: '/user/' + id,
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
                      Tidak dapat menghapus data user
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
