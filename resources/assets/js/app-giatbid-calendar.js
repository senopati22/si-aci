/**
 * App Calendar - Kegiatan Bidang (Giatbid)
 * * Menggabungkan UI dari app-calendar.js dengan logika
 * CRUD AJAX (FormValidation, SweetAlert, Fetch) dari app-pegawai-list.js
 */

'use strict';

let direction = 'ltr';

if (isRtl) {
  direction = 'rtl';
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Giatbid Calendar Script Loading...');
  
  // === 1. DEKLARASI ELEMEN ===
  const calendarEl = document.getElementById('calendar');
  const appCalendarSidebar = document.querySelector('.app-calendar-sidebar');
  const addEventSidebar = document.getElementById('addEventSidebar');
  const appOverlay = document.querySelector('.app-overlay');
  
  // Pastikan form siap untuk validasi - JANGAN trigger validasi di awal
  setTimeout(() => {
    const form = document.getElementById('giatbidForm');
    if (form) {
      form.reset();
    }
  }, 100);

  // Konfigurasi warna untuk setiap bidang
  const calendarsColor = {
    'Sekretariat': 'primary',
    'Bidang I': 'success',
    'Bidang II': 'danger',
    // 'Bidang III': 'warning',
    // 'Bidang IV': 'info'
  };

  const offcanvasTitle = document.getElementById('addEventSidebarLabel'); // Pastikan ID ini ada di HTML
  const btnToggleSidebar = document.querySelector('.btn-toggle-sidebar');
  const btnDeleteEvent = document.querySelector('.btn-delete-event');
  const btnCancel = document.querySelector('.btn-cancel');
  const selectAll = document.querySelector('.select-all');
  const filterInput = [].slice.call(document.querySelectorAll('.input-filter'));
  const inlineCalendarEl = document.querySelector('.inline-calendar');

  // Form & Tombol
  const giatbidForm = document.getElementById('giatbidForm'); // Pastikan ID form ini ada di HTML
  const submitBtn = document.getElementById('submitBtn'); // Pastikan ID tombol submit ini ada di HTML

  // Elemen Form (Flatpickr)
  const tglKegiatan = document.getElementById('tgl_kegiatan');
  const waktuKegiatan = document.getElementById('waktu_kegiatan');

  // Elemen Form (Select2)
  const pjAcara = $('#pj_acara_kegiatan');
  const pjSarpras = $('#pj_sarpras_kegiatan');
  const pjMc = $('#pj_mc_kegiatan');
  const pjKonsumsi = $('#pj_konsumsi_kegiatan');
  const pjDokumentasi = $('#pj_dokumentasi_kegiatan');

  // Variabel Global
  let calendar;
  let fv; // FormValidation instance
  let isSubmitting = false;
  let isAlertVisible = false;
  let currentEventId = null; // Untuk menyimpan ID saat edit
  const bsAddEventSidebar = new bootstrap.Offcanvas(addEventSidebar);
  
  // Modal Detail Kegiatan
  const detailKegiatanModal = new bootstrap.Modal(document.getElementById('detailKegiatanModal'));
  const editKegiatanBtn = document.getElementById('editKegiatanBtn');
  const hapusKegiatanBtn = document.getElementById('hapusKegiatanBtn');
  
  // Mobile Sidebar Toggle
  const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');

  // === 2. UTILITIES (AJAX, ALERT, LOADING) ===
  // (Diambil dari app-pegawai-list.js)

  // Setup AJAX CSRF
  $.ajaxSetup({
    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
  });

  function showAlertOnce(options) {
    if (isAlertVisible) return Promise.resolve();
    isAlertVisible = true;
    
    // Konfigurasi default untuk SweetAlert - HANYA tombol OK
    const defaultOptions = {
      showClass: { popup: 'swal2-show' },
      hideClass: { popup: 'swal2-hide' },
      showConfirmButton: true,
      showCancelButton: false,
      showDenyButton: false,
      showCloseButton: false,
      confirmButtonText: 'OK',
      confirmButtonColor: '#696cff',
      allowOutsideClick: false,
      allowEscapeKey: true,
      // PENTING: Pastikan tidak ada tombol lain
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-primary'
      }
    };
    
    // Merge dengan options yang dikirim, tapi pastikan tidak override ke false
    const finalOptions = { ...defaultOptions, ...options };
    
    // Paksa hanya tombol OK untuk pesan biasa
    if (!options.showCancelButton && !options.showDenyButton) {
      finalOptions.showConfirmButton = true;
      finalOptions.showCancelButton = false;
      finalOptions.showDenyButton = false;
      finalOptions.showCloseButton = false;
    }
    
    return Swal.fire(finalOptions).finally(() => (isAlertVisible = false));
  }

  function showLoadingScreen(message = 'Memproses data...') {
    if (isAlertVisible) return;
    isAlertVisible = true;
    Swal.fire({
      title: message,
      text: 'Mohon tunggu sebentar...',
      icon: 'info',
      showConfirmButton: false,
      showCancelButton: false,
      showDenyButton: false,
      showCloseButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  function hideLoadingScreen() {
    if (Swal.isVisible()) Swal.close();
    isAlertVisible = false;
  }

  function setButtonLoading(loading = true) {
    if (!submitBtn) return;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    if (loading) {
      submitBtn.disabled = true;
      btnText.classList.add('d-none');
      btnLoading.classList.remove('d-none');
    } else {
      submitBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  }

  // === 3. INISIALISASI PLUGIN (Flatpickr, Select2, FormValidation) ===

  // Init Flatpickr (Tanggal & Waktu)
  let tglPicker = null;
  if (tglKegiatan) {
    console.log('📅 Initializing tglPicker for element:', tglKegiatan);
    tglPicker = tglKegiatan.flatpickr({
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd F Y',
      placeholder: 'Pilih Tanggal',
      minDate: 'today', // Disable tanggal sebelum hari ini
      disable: [
        function(date) {
          // Disable semua tanggal sebelum hari ini
          return date < new Date().setHours(0,0,0,0);
        }
      ],
      onChange: function(selectedDates, dateStr, instance) {
        // Trigger validasi real-time saat tanggal berubah
        setTimeout(() => {
          const field = document.getElementById('tgl_kegiatan');
          if (field) {
            validateFlatpickrField(field, 'Tanggal Kegiatan');
          }
        }, 100);
      }
    });
    console.log('📅 tglPicker initialized:', tglPicker);
  } else {
    console.error('❌ tglKegiatan element not found');
  }

  function modifyToggler() {
    const fcSidebarToggleButton = document.querySelector('.fc-sidebarToggle-button');
    const fcPrevButton = document.querySelector('.fc-prev-button');
    const fcNextButton = document.querySelector('.fc-next-button');
    const fcHeaderToolbar = document.querySelector('.fc-header-toolbar');
    fcPrevButton.classList.add('btn', 'btn-sm', 'btn-icon', 'btn-outline-secondary', 'me-2');
    fcNextButton.classList.add('btn', 'btn-sm', 'btn-icon', 'btn-outline-secondary', 'me-4');
    fcHeaderToolbar.classList.add('row-gap-4', 'gap-2');
    fcSidebarToggleButton.classList.remove('fc-button-primary');
    fcSidebarToggleButton.classList.add('d-lg-none', 'd-inline-block', 'ps-0');
    while (fcSidebarToggleButton.firstChild) {
      fcSidebarToggleButton.firstChild.remove();
    }
    fcSidebarToggleButton.setAttribute('data-bs-toggle', 'sidebar');
    fcSidebarToggleButton.setAttribute('data-overlay', '');
    fcSidebarToggleButton.setAttribute('data-target', '#app-calendar-sidebar');
    fcSidebarToggleButton.insertAdjacentHTML('beforeend', '<i class="ri-menu-line ri-24px text-body"></i>');
  }

  const waktuPicker = waktuKegiatan.flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true,
    placeholder: 'Pilih Waktu',
    onChange: function(selectedDates, dateStr, instance) {
      // Trigger validasi real-time saat waktu berubah
      setTimeout(() => {
        const field = document.getElementById('waktu_kegiatan');
        if (field) {
          validateFlatpickrField(field, 'Waktu Kegiatan');
        }
      }, 100);
    }
  });

  // Init Select2 dengan konfigurasi yang lebih baik
  function initSelect2(selector, placeholder) {
    if (selector.length) {
      // Pastikan element sudah ada sebelum inisialisasi
      selector.wrap('<div class="position-relative"></div>').select2({
        placeholder: placeholder,
        dropdownParent: selector.parent(),
        allowClear: true,
        width: '100%',
        // Tambahkan konfigurasi untuk mencegah crash
        escapeMarkup: function (markup) {
          return markup; // Biarkan markup HTML
        },
        templateResult: function (data) {
          if (data.loading) {
            return data.text;
          }
          return data.text;
        },
        templateSelection: function (data) {
          return data.text;
        }
      });
      
      // Tambahkan event handler untuk mencegah crash
      selector.on('select2:open', function() {
        // Pastikan dropdown tidak overlap
        setTimeout(function() {
          $('.select2-dropdown').css('z-index', '9999');
        }, 10);
      });
      
      // Fix label overlapping dengan Select2
      selector.on('select2:select select2:clear', function() {
        const container = selector.parent();
        const label = container.find('label');
        
        if (selector.val() && selector.val() !== '') {
          container.addClass('has-value');
          label.addClass('floating');
        } else {
          container.removeClass('has-value');
          label.removeClass('floating');
        }
        
        // Trigger validasi real-time untuk Select2
        setTimeout(() => {
          const fieldName = selector.attr('name');
          let labelName = '';
          switch(fieldName) {
            case 'pj_acara_kegiatan': labelName = 'PJ Acara'; break;
            case 'pj_sarpras_kegiatan': labelName = 'PJ Sarpras'; break;
            case 'pj_mc_kegiatan': labelName = 'PJ MC'; break;
            case 'pj_konsumsi_kegiatan': labelName = 'PJ Konsumsi'; break;
            case 'pj_dokumentasi_kegiatan': labelName = 'PJ Dokumentasi'; break;
          }
          if (labelName) {
            validateSelect2Field(selector, labelName);
          }
        }, 100);
      });
      
      // Trigger initial check
      selector.trigger('change');
    }
  }
  
  // Inisialisasi Select2 dengan delay untuk memastikan DOM ready
  setTimeout(function() {
    initSelect2(pjAcara, 'Pilih PJ Acara');
    initSelect2(pjSarpras, 'Pilih PJ Sarpras');
    initSelect2(pjMc, 'Pilih PJ MC');
    initSelect2(pjKonsumsi, 'Pilih PJ Konsumsi');
    initSelect2(pjDokumentasi, 'Pilih PJ Dokumentasi');
  }, 100);

  // === VALIDASI REAL-TIME ===
  
  // Fungsi untuk menampilkan error message
  function showFieldError(field, message) {
    // Hapus error styling lama
    field.classList.remove('is-invalid');
    field.classList.add('is-invalid');
    
    // Hapus pesan error lama
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
      existingError.remove();
    }
    
    // Tambahkan pesan error baru
    const errorMsg = document.createElement('div');
    errorMsg.className = 'invalid-feedback d-block';
    errorMsg.style.cssText = 'display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);';
    errorMsg.textContent = message;
    field.parentNode.appendChild(errorMsg);
  }
  
  // Fungsi untuk menghapus error message
  function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
      existingError.remove();
    }
  }
  
  // Fungsi validasi untuk field text biasa dengan regex
  function validateTextField(field, fieldName, customRules = {}) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Validasi wajib diisi
    if (!value) {
      isValid = false;
      errorMessage = `${fieldName} wajib diisi.`;
    } else {
      // Validasi khusus berdasarkan field dengan regex
      switch(field.name) {
        case 'nama_kegiatan':
          // Regex: Hanya huruf, angka, spasi, dan karakter khusus yang diperbolehkan
          const namaRegex = /^[a-zA-Z0-9\s\-_.,()&]+$/;
          if (!namaRegex.test(value)) {
            isValid = false;
            errorMessage = 'Nama kegiatan hanya boleh mengandung huruf, angka, spasi, dan karakter khusus (-, _, ., ,, (, ), &).';
          } else if (value.length < 3) {
            isValid = false;
            errorMessage = 'Nama kegiatan minimal 3 karakter.';
          } else if (value.length > 100) {
            isValid = false;
            errorMessage = 'Nama kegiatan maksimal 100 karakter.';
          }
          break;
          
        case 'tempat_kegiatan':
          // Regex: Hanya huruf, angka, spasi, dan karakter khusus yang diperbolehkan
          const tempatRegex = /^[a-zA-Z0-9\s\-_.,()&]+$/;
          if (!tempatRegex.test(value)) {
            isValid = false;
            errorMessage = 'Tempat kegiatan hanya boleh mengandung huruf, angka, spasi, dan karakter khusus (-, _, ., ,, (, ), &).';
          } else if (value.length < 3) {
            isValid = false;
            errorMessage = 'Tempat kegiatan minimal 3 karakter.';
          } else if (value.length > 100) {
            isValid = false;
            errorMessage = 'Tempat kegiatan maksimal 100 karakter.';
          }
          break;
          
        case 'jumlah_peserta_kegiatan':
          // Regex: Hanya angka positif
          const jumlahRegex = /^[1-9][0-9]*$/;
          if (!jumlahRegex.test(value)) {
            isValid = false;
            errorMessage = 'Jumlah peserta harus berupa angka positif (tidak boleh dimulai dengan 0).';
          } else {
            const jumlah = parseInt(value);
            if (jumlah > 10000) {
              isValid = false;
              errorMessage = 'Jumlah peserta maksimal 10,000 orang.';
            }
          }
          break;
          
        case 'anggaran_kegiatan':
          // Untuk anggaran, kita akan validasi setelah format
          const cleanValue = value.replace(/[^\d]/g, '');
          const anggaranRegex = /^[1-9][0-9]*$/;
          if (!anggaranRegex.test(cleanValue)) {
            isValid = false;
            errorMessage = 'Anggaran harus berupa angka positif (tidak boleh dimulai dengan 0).';
          } else {
            const anggaran = parseInt(cleanValue);
            if (anggaran > 10000000000) { // 10 miliar
              isValid = false;
              errorMessage = 'Anggaran maksimal Rp 10,000,000,000.';
            }
          }
          break;
      }
    }
    
    // Validasi custom rules
    if (isValid && customRules) {
      if (customRules.minLength && value.length < customRules.minLength) {
        isValid = false;
        errorMessage = customRules.minLengthMessage || `${fieldName} minimal ${customRules.minLength} karakter.`;
      }
      if (customRules.maxLength && value.length > customRules.maxLength) {
        isValid = false;
        errorMessage = customRules.maxLengthMessage || `${fieldName} maksimal ${customRules.maxLength} karakter.`;
      }
      if (customRules.pattern && !customRules.pattern.test(value)) {
        isValid = false;
        errorMessage = customRules.patternMessage || `${fieldName} format tidak valid.`;
      }
    }
    
    if (isValid) {
      clearFieldError(field);
    } else {
      showFieldError(field, errorMessage);
    }
    
    return isValid;
  }
  
  // Fungsi validasi untuk select dropdown
  function validateSelectField(field, fieldName) {
    const value = field.value;
    let isValid = true;
    let errorMessage = '';
    
    if (!value || value === '') {
      isValid = false;
      errorMessage = `${fieldName} wajib dipilih.`;
    }
    
    if (isValid) {
      clearFieldError(field);
    } else {
      showFieldError(field, errorMessage);
    }
    
    return isValid;
  }
  
  // Fungsi validasi untuk Select2 fields
  function validateSelect2Field(selector, fieldName) {
    const value = selector.val();
    let isValid = true;
    let errorMessage = '';
    
    if (!value || value === '' || value === null) {
      isValid = false;
      errorMessage = `${fieldName} wajib dipilih.`;
    }
    
    const field = selector[0];
    if (isValid) {
      clearFieldError(field);
    } else {
      showFieldError(field, errorMessage);
    }
    
    return isValid;
  }
  
  // Fungsi validasi untuk Flatpickr fields
  function validateFlatpickrField(field, fieldName) {
    const value = field.value;
    let isValid = true;
    let errorMessage = '';
    
    if (!value || value === '') {
      isValid = false;
      errorMessage = `${fieldName} wajib diisi.`;
    } else {
      // Validasi khusus untuk tanggal
      if (fieldName.includes('Tanggal')) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          isValid = false;
          errorMessage = 'Tanggal tidak boleh sebelum hari ini.';
        }
      }
    }
    
    if (isValid) {
      clearFieldError(field);
    } else {
      showFieldError(field, errorMessage);
    }
    
    return isValid;
  }
  
  // Fungsi untuk memformat input anggaran dengan prefix Rp dan pemisah ribuan
  function formatAnggaran(input) {
    let value = input.value.replace(/[^\d]/g, '');
    if (value) {
      const formatted = 'Rp ' + parseInt(value).toLocaleString('id-ID');
      input.value = formatted;
    } else {
      input.value = '';
    }
  }
  
  // Fungsi untuk mendapatkan nilai angka murni dari input anggaran
  function getAnggaranValue(input) {
    return input.value.replace(/[^\d]/g, '');
  }
  
  // Fungsi untuk memformat anggaran saat menampilkan data (untuk edit mode)
  function displayAnggaranValue(value) {
    if (value && value !== '') {
      const numericValue = value.toString().replace(/[^\d]/g, '');
      if (numericValue) {
        return 'Rp ' + parseInt(numericValue).toLocaleString('id-ID');
      }
    }
    return '';
  }
  
  // Fungsi untuk mengkonversi tanggal ke format bahasa Indonesia
  function formatTanggalIndonesia(tanggalString) {
    if (!tanggalString || tanggalString === '-') {
      return '-';
    }
    
    try {
      // Array nama bulan dalam bahasa Indonesia
      const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      // Array nama hari dalam bahasa Indonesia
      const namaHari = [
        'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
      ];
      
      // Parse tanggal dari string (format YYYY-MM-DD)
      const tanggal = new Date(tanggalString);
      
      // Pastikan tanggal valid
      if (isNaN(tanggal.getTime())) {
        return tanggalString; // Return original jika tidak valid
      }
      
      const hari = tanggal.getDate();
      const bulan = namaBulan[tanggal.getMonth()];
      const tahun = tanggal.getFullYear();
      const namaHariIni = namaHari[tanggal.getDay()];
      
      return `${namaHariIni}, ${hari} ${bulan} ${tahun}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return tanggalString; // Return original jika error
    }
  }
  
  // Fungsi untuk mengkonversi waktu ke format bahasa Indonesia
  function formatWaktuIndonesia(waktuString) {
    if (!waktuString || waktuString === '-') {
      return '-';
    }
    
    try {
      // Format waktu dari HH:MM ke format yang lebih mudah dibaca
      const [jam, menit] = waktuString.split(':');
      const jamInt = parseInt(jam);
      const menitInt = parseInt(menit);
      
      // Format dengan leading zero jika perlu
      const jamFormatted = jamInt.toString().padStart(2, '0');
      const menitFormatted = menitInt.toString().padStart(2, '0');
      
      return `${jamFormatted}:${menitFormatted} WIB`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return waktuString; // Return original jika error
    }
  }
  
  // Fungsi untuk memvalidasi semua field sekaligus
  function validateAllFields() {
    if (!giatbidForm) return true;
    
    let allValid = true;
    
    // Validasi untuk input text biasa
    const textFields = [
      { name: 'nama_kegiatan', label: 'Nama Kegiatan' },
      { name: 'tempat_kegiatan', label: 'Tempat Kegiatan' },
      { name: 'jumlah_peserta_kegiatan', label: 'Jumlah Peserta' },
      { name: 'anggaran_kegiatan', label: 'Anggaran' }
    ];
    
    textFields.forEach(fieldConfig => {
      const field = giatbidForm.querySelector(`[name="${fieldConfig.name}"]`);
      if (field) {
        const isValid = validateTextField(field, fieldConfig.label);
        if (!isValid) allValid = false;
      }
    });
    
    // Validasi untuk select dropdown
    const selectFields = [
      { name: 'bidang_kegiatan', label: 'Bidang' },
      { name: 'status_apbd_kegiatan', label: 'Status APBD' }
    ];
    
    selectFields.forEach(fieldConfig => {
      const field = giatbidForm.querySelector(`[name="${fieldConfig.name}"]`);
      if (field) {
        const isValid = validateSelectField(field, fieldConfig.label);
        if (!isValid) allValid = false;
      }
    });
    
    // Validasi untuk Select2 fields
    const select2Fields = [
      { selector: pjAcara, label: 'PJ Acara' },
      { selector: pjSarpras, label: 'PJ Sarpras' },
      { selector: pjMc, label: 'PJ MC' },
      { selector: pjKonsumsi, label: 'PJ Konsumsi' },
      { selector: pjDokumentasi, label: 'PJ Dokumentasi' }
    ];
    
    select2Fields.forEach(fieldConfig => {
      if (fieldConfig.selector && fieldConfig.selector.length) {
        const isValid = validateSelect2Field(fieldConfig.selector, fieldConfig.label);
        if (!isValid) allValid = false;
      }
    });
    
    // Validasi untuk Flatpickr fields
    const flatpickrFields = [
      { name: 'tgl_kegiatan', label: 'Tanggal Kegiatan' },
      { name: 'waktu_kegiatan', label: 'Waktu Kegiatan' }
    ];
    
    flatpickrFields.forEach(fieldConfig => {
      const field = giatbidForm.querySelector(`[name="${fieldConfig.name}"]`);
      if (field) {
        const isValid = validateFlatpickrField(field, fieldConfig.label);
        if (!isValid) allValid = false;
      }
    });
    
    return allValid;
  }
  
  // Setup validasi real-time untuk semua field
  function setupRealtimeValidation() {
    if (!giatbidForm) return;
    
    console.log('🔍 Setting up real-time validation...');
    
    // Validasi untuk input text biasa
    const textFields = [
      { name: 'nama_kegiatan', label: 'Nama Kegiatan' },
      { name: 'tempat_kegiatan', label: 'Tempat Kegiatan' },
      { name: 'jumlah_peserta_kegiatan', label: 'Jumlah Peserta' },
      { name: 'anggaran_kegiatan', label: 'Anggaran' }
    ];
    
    textFields.forEach(fieldConfig => {
      const field = giatbidForm.querySelector(`[name="${fieldConfig.name}"]`);
      if (field) {
        // Event listener khusus untuk anggaran
        if (fieldConfig.name === 'anggaran_kegiatan') {
          // Event listener untuk keypress - hanya izinkan angka
          field.addEventListener('keypress', function(e) {
            // Izinkan: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Izinkan: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
              return;
            }
            // Pastikan hanya angka yang diizinkan
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
              e.preventDefault();
            }
          });
          
          // Event listener untuk input - format dengan Rp dan pemisah ribuan
          field.addEventListener('input', function() {
            formatAnggaran(field);
            validateTextField(field, fieldConfig.label);
          });
          
          // Event listener untuk blur - pastikan format tetap benar
          field.addEventListener('blur', function() {
            formatAnggaran(field);
            validateTextField(field, fieldConfig.label);
          });
          
          // Event listener untuk paste - bersihkan dan format ulang
          field.addEventListener('paste', function(e) {
            setTimeout(() => {
              formatAnggaran(field);
              validateTextField(field, fieldConfig.label);
            }, 10);
          });
        } else if (fieldConfig.name === 'jumlah_peserta_kegiatan') {
          // Event listener khusus untuk jumlah peserta - hanya izinkan angka
          field.addEventListener('keypress', function(e) {
            // Izinkan: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Izinkan: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
              return;
            }
            // Pastikan hanya angka yang diizinkan
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
              e.preventDefault();
            }
          });
          
          field.addEventListener('input', function() {
            validateTextField(field, fieldConfig.label);
          });
          
          field.addEventListener('blur', function() {
            validateTextField(field, fieldConfig.label);
          });
        } else if (fieldConfig.name === 'nama_kegiatan' || fieldConfig.name === 'tempat_kegiatan') {
          // Event listener untuk nama dan tempat - izinkan huruf, angka, spasi, dan karakter khusus
          field.addEventListener('input', function() {
            validateTextField(field, fieldConfig.label);
          });
          
          field.addEventListener('blur', function() {
            validateTextField(field, fieldConfig.label);
          });
          
          // Event listener untuk paste - bersihkan karakter yang tidak diizinkan
          field.addEventListener('paste', function(e) {
            setTimeout(() => {
              let value = field.value;
              // Hapus karakter yang tidak diizinkan kecuali yang ada di regex
              value = value.replace(/[^a-zA-Z0-9\s\-_.,()&]/g, '');
              field.value = value;
              validateTextField(field, fieldConfig.label);
            }, 10);
          });
        } else {
          // Event listener untuk field text biasa lainnya
          field.addEventListener('input', function() {
            validateTextField(field, fieldConfig.label);
          });
          
          field.addEventListener('blur', function() {
            validateTextField(field, fieldConfig.label);
          });
        }
        
        // Validasi awal jika field sudah ada nilai
        if (field.value) {
          validateTextField(field, fieldConfig.label);
        }
      }
    });
    
    // Validasi untuk select dropdown
    const selectFields = [
      { name: 'bidang_kegiatan', label: 'Bidang' },
      { name: 'status_apbd_kegiatan', label: 'Status APBD' }
    ];
    
    selectFields.forEach(fieldConfig => {
      const field = giatbidForm.querySelector(`[name="${fieldConfig.name}"]`);
      if (field) {
        field.addEventListener('change', function() {
          validateSelectField(field, fieldConfig.label);
        });
        
        // Validasi awal jika field sudah ada nilai
        if (field.value) {
          validateSelectField(field, fieldConfig.label);
        }
      }
    });
    
    // Validasi untuk Select2 fields
    const select2Fields = [
      { selector: pjAcara, label: 'PJ Acara' },
      { selector: pjSarpras, label: 'PJ Sarpras' },
      { selector: pjMc, label: 'PJ MC' },
      { selector: pjKonsumsi, label: 'PJ Konsumsi' },
      { selector: pjDokumentasi, label: 'PJ Dokumentasi' }
    ];
    
    select2Fields.forEach(fieldConfig => {
      if (fieldConfig.selector && fieldConfig.selector.length) {
        fieldConfig.selector.on('change', function() {
          validateSelect2Field(fieldConfig.selector, fieldConfig.label);
        });
        
        // Validasi awal jika field sudah ada nilai
        if (fieldConfig.selector.val()) {
          validateSelect2Field(fieldConfig.selector, fieldConfig.label);
        }
      }
    });
    
    // Validasi untuk Flatpickr fields
    const flatpickrFields = [
      { name: 'tgl_kegiatan', label: 'Tanggal Kegiatan' },
      { name: 'waktu_kegiatan', label: 'Waktu Kegiatan' }
    ];
    
    flatpickrFields.forEach(fieldConfig => {
      const field = giatbidForm.querySelector(`[name="${fieldConfig.name}"]`);
      if (field) {
        field.addEventListener('change', function() {
          validateFlatpickrField(field, fieldConfig.label);
        });
        
        // Validasi awal jika field sudah ada nilai
        if (field.value) {
          validateFlatpickrField(field, fieldConfig.label);
        }
      }
    });
    
    console.log('✅ Real-time validation setup completed');
  }
  
  // Validasi manual seperti di pegawai - Hanya jika form ada
  if (giatbidForm) {
    console.log('✅ Form validation ready (manual approach)');
    // Setup validasi real-time
    setTimeout(setupRealtimeValidation, 200); // Delay untuk memastikan semua plugin sudah loaded
  }

  // === 4. FUNGSI INTI KALENDER ===


  // Fungsi untuk menampilkan detail kegiatan
  function showDetailKegiatan(kegiatanId) {
    console.log('🔍 Loading detail for kegiatan ID:', kegiatanId);
    
    // Pastikan ID valid
    if (!kegiatanId || kegiatanId === 'null' || kegiatanId === null) {
      console.error('❌ Invalid kegiatan ID:', kegiatanId);
      showAlertOnce({
        icon: 'error',
        title: 'Gagal Memuat!',
        text: 'ID kegiatan tidak valid.',
        showCancelButton: false,
        showDenyButton: false,
        showCloseButton: false
      });
      return;
    }
    
    showLoadingScreen('Memuat detail kegiatan...');
    
    $.get(`/giatbid/${kegiatanId}/edit`)
      .done(function (data) {
        console.log('✅ Detail data received:', data);
        
        // Isi data ke modal detail dengan format bahasa Indonesia
        document.getElementById('detailNamaKegiatan').textContent = data.nama_kegiatan || '-';
        document.getElementById('detailTanggal').textContent = formatTanggalIndonesia(data.tgl_kegiatan);
        document.getElementById('detailWaktu').textContent = formatWaktuIndonesia(data.waktu_kegiatan);
        document.getElementById('detailTempat').textContent = data.tempat_kegiatan || '-';
        document.getElementById('detailBidang').textContent = data.bidang_kegiatan || '-';
        document.getElementById('detailJumlahPeserta').textContent = data.jumlah_peserta_kegiatan || '-';
        document.getElementById('detailStatusApbd').textContent = data.status_apbd_kegiatan || '-';
        document.getElementById('detailAnggaran').textContent = data.anggaran_kegiatan ? 'Rp ' + parseInt(data.anggaran_kegiatan).toLocaleString('id-ID') : '-';
        
        // Isi data penanggung jawab
        document.getElementById('detailPjAcara').textContent = data.pj_acara_nama || '-';
        document.getElementById('detailPjSarpras').textContent = data.pj_sarpras_nama || '-';
        document.getElementById('detailPjMc').textContent = data.pj_mc_nama || '-';
        document.getElementById('detailPjKonsumsi').textContent = data.pj_konsumsi_nama || '-';
        document.getElementById('detailPjDokumentasi').textContent = data.pj_dokumentasi_nama || '-';
        
        hideLoadingScreen();
        detailKegiatanModal.show();
      })
      .fail(function (xhr, status, error) {
        hideLoadingScreen();
        console.error('❌ Error loading detail:', {
          xhr: xhr,
          status: status,
          error: error,
          responseText: xhr.responseText
        });
        
        let errorMessage = 'Data kegiatan tidak dapat ditemukan.';
        if (xhr.responseJSON?.error) {
          errorMessage = xhr.responseJSON.error;
        } else if (xhr.responseJSON?.message) {
          errorMessage = xhr.responseJSON.message;
        }
        
        showAlertOnce({
          icon: 'error',
          title: 'Gagal Memuat!',
          text: errorMessage,
          showCancelButton: false,
          showDenyButton: false,
          showCloseButton: false
        });
      });
  }

  // Fungsi untuk reset form (mode Add)
  function resetFormForAdd() {
    isSubmitting = false;
    setButtonLoading(false);
    currentEventId = null; // Reset ID untuk mode Add
    sessionStorage.removeItem('currentEventId'); // Hapus dari sessionStorage juga

    if (giatbidForm) {
      giatbidForm.reset(); // Reset form HTML
      
      // Hapus semua styling error secara manual (termasuk dari validasi real-time)
      giatbidForm.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
      });
      giatbidForm.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
      });

      // Reset plugin secara manual
      if (tglPicker) tglPicker.clear();
      if (waktuPicker) waktuPicker.clear();
      $('#giatbidForm .select2').val(null).trigger('change');

      // Ganti judul dan tombol kembali ke mode "Add"
      if (offcanvasTitle) offcanvasTitle.innerHTML = 'Tambah Kegiatan';
      if (submitBtn) submitBtn.innerHTML = '<span class="btn-text">Simpan</span><span class="btn-loading d-none">Menyimpan...</span>';

      // Sembunyikan tombol delete
      if (btnDeleteEvent) btnDeleteEvent.classList.add('d-none');
      
      console.log('✅ Form reset for Add mode - all validation errors cleared');
    }
  }

  // Fungsi untuk reset form (mode Edit) - tidak reset currentEventId
  function resetFormForEdit() {
    isSubmitting = false;
    setButtonLoading(false);
    // JANGAN reset currentEventId untuk mode Edit

    if (giatbidForm) {
      giatbidForm.reset(); // Reset form HTML
      
      // Hapus semua styling error secara manual (termasuk dari validasi real-time)
      giatbidForm.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
      });
      giatbidForm.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
      });

      // Reset plugin secara manual
      if (tglPicker) tglPicker.clear();
      if (waktuPicker) waktuPicker.clear();
      $('#giatbidForm .select2').val(null).trigger('change');

      // Ganti judul dan tombol untuk mode "Edit"
      if (offcanvasTitle) offcanvasTitle.innerHTML = 'Edit Kegiatan';
      if (submitBtn) submitBtn.innerHTML = '<span class="btn-text">Update</span><span class="btn-loading d-none">Mengupdate...</span>';

      // Tampilkan tombol delete
      if (btnDeleteEvent) btnDeleteEvent.classList.remove('d-none');
      
      console.log('✅ Form reset for Edit mode - all validation errors cleared');
    }
  }

  // Fungsi untuk mengambil filter bidang yang dicentang
  function getSelectedBidang() {
    let selected = [];
    filterInput.forEach(item => {
      if (item.checked) selected.push(item.getAttribute('data-value'));
    });
    // Jika 'Select All' dicentang, kembalikan 'all' untuk bypass filter
    if (selectAll.checked || selected.length === filterInput.length) {
      return ['all'];
    }
    return selected;
  }

  // Init FullCalendar - Hanya jika element ada
  if (calendarEl) {
    
    // Tunggu FullCalendar dimuat
    const initCalendar = () => {
      if (typeof Calendar !== 'undefined') {
        try {
          calendar = new Calendar(calendarEl, {
    initialView: 'dayGridMonth',

    // ** PENGGANTIAN KUNCI 1: Mengambil event via AJAX dari Controller **
    events: function (fetchInfo, successCallback, failureCallback) {
      $.ajax({
        url: '/giatbid/events', // Rute yang kita buat di GiatbidList.php
        type: 'GET',
        success: function (data) {
          console.log('📅 Events data received from server:', data);
          
          // Debug: Log setiap event ID
          data.forEach((event, index) => {
            console.log(`📅 Event ${index}:`, {
              id: event.id,
              title: event.title,
              start: event.start,
              waktu_kegiatan: event.waktu_kegiatan
            });
          });
          
          // Pastikan waktu event tidak dikonversi timezone
          const processedData = data.map(event => {
            if (event.start && event.waktu_kegiatan) {
              // Jika event memiliki waktu_kegiatan, gunakan waktu tersebut
              const [tanggal, waktu] = event.start.split('T');
              if (tanggal && waktu) {
                // Gabungkan tanggal dengan waktu dari database
                event.start = `${tanggal}T${event.waktu_kegiatan}:00`;
                console.log(`📅 Processed event ${event.id}:`, {
                  original: event.start,
                  waktu_kegiatan: event.waktu_kegiatan,
                  processed: event.start
                });
              }
            }
            
            // Pastikan event memiliki extendedProps untuk waktu_kegiatan
            if (!event.extendedProps) {
              event.extendedProps = {};
            }
            event.extendedProps.waktu_kegiatan = event.waktu_kegiatan;
            
            // Tambahkan title dengan waktu untuk debugging
            if (event.waktu_kegiatan) {
              event.title = `${event.title} (${event.waktu_kegiatan})`;
            }
            
            return event;
          });
          
          // Filter data di sisi klien berdasarkan checkbox
          const selectedBidang = getSelectedBidang();

          if (selectedBidang.includes('all')) {
            successCallback(processedData); // Tampilkan semua jika 'all'
          } else {
            const filteredEvents = processedData.filter(event => selectedBidang.includes(event.extendedProps.calendar));
            successCallback(filteredEvents);
          }
        },
        error: function (xhr) {
          console.error('Error fetching events:', xhr);
          failureCallback(xhr);
          showAlertOnce({
            icon: 'error',
            title: 'Gagal Memuat Kegiatan!',
            text: 'Tidak dapat mengambil data kegiatan dari server.',
            showCancelButton: false,
            showDenyButton: false,
            showCloseButton: false
          });
        }
      });
    },

    plugins: [
      dayGridPlugin,
      interactionPlugin,
      listPlugin,
      timegridPlugin
    ],
    editable: false, // Jangan biarkan user drag-and-drop, edit via form saja
    dragScroll: true,
    dayMaxEvents: 2,
    eventResizableFromStart: true,
    // customButtons: {
    //   sidebarToggle: {
    //     text: '',
    //     click: function() {
    //       const sidebar = document.getElementById('app-calendar-sidebar');
    //       const overlay = document.querySelector('.app-overlay');
    //       if (sidebar) {
    //         sidebar.classList.toggle('show');
    //         if (overlay) {
    //           overlay.classList.toggle('show');
    //         }
    //       }
    //     }
    //   }
    // },
    customButtons: {
      sidebarToggle: {
        text: 'Sidebar'
      }
    },
    headerToolbar: {
      start: 'sidebarToggle, prev,next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    direction: direction,
    initialDate: new Date(),
    navLinks: true,
    
    // Konfigurasi bahasa Indonesia
    locale: 'id',
    
    // Konfigurasi timezone untuk menampilkan waktu sesuai database
    timeZone: 'Asia/Jakarta', // Set timezone ke WIB
    displayEventTime: true, // Tampilkan waktu event
    displayEventEnd: true, // Tampilkan waktu akhir event
    
    // Konfigurasi format waktu
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    
    // Konfigurasi event time format
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    
    // Pastikan waktu tidak dikonversi otomatis
    ignoreTimezone: false,
    
    // Konfigurasi untuk memastikan waktu ditampilkan sesuai database
    eventDisplay: 'block',
    eventDidMount: function(info) {
      // Debug: Log waktu event yang ditampilkan
      console.log('📅 Event mounted:', {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        startStr: info.event.startStr,
        waktu_kegiatan: info.event.extendedProps.waktu_kegiatan
      });
      
      // Pastikan waktu yang ditampilkan sesuai dengan database
      if (info.event.extendedProps.waktu_kegiatan) {
        const waktuElement = info.el.querySelector('.fc-event-time');
        if (waktuElement) {
          waktuElement.textContent = info.event.extendedProps.waktu_kegiatan;
          console.log('📅 Updated event time display:', info.event.extendedProps.waktu_kegiatan);
        }
      }
    },
    
    // Tambahkan eventClassNames untuk warna berdasarkan kategori
    eventClassNames: function ({ event: calendarEvent }) {
      const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar];
      // Background Color
      return ['fc-event-' + colorName];
    },

    // --- EVENT HANDLER KALENDER ---

    // ** PENGGANTIAN KUNCI 2: Klik pada tanggal kosong (CREATE) **
    dateClick: function (info) {
      console.log('📅 Date clicked:', info.date);
      console.log('📅 tglPicker available:', !!tglPicker);
      
      resetFormForAdd(); // Gunakan reset untuk mode Add
      offcanvasTitle.innerHTML = 'Tambah Kegiatan';

      // Isi tanggal yang diklik ke form
      if (tglPicker) {
        console.log('📅 Setting date to:', info.date);
        try {
          // Fix timezone issue - gunakan local date tanpa timezone conversion
          const year = info.date.getFullYear();
          const month = String(info.date.getMonth() + 1).padStart(2, '0');
          const day = String(info.date.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          console.log('📅 Original date:', info.date);
          console.log('📅 Formatted date string (local):', dateStr);
          
          // Set date dengan format string
          tglPicker.setDate(dateStr, false); // false = tidak trigger onChange
          console.log('📅 Date set successfully');
          
          // Pastikan input value juga ter-set
          const tglInput = document.getElementById('tgl_kegiatan');
          if (tglInput) {
            tglInput.value = dateStr;
            console.log('📅 Input value also set to:', dateStr);
          }
        } catch (error) {
          console.error('❌ Error setting date in tglPicker:', error);
          // Fallback: set value langsung ke input
          const tglInput = document.getElementById('tgl_kegiatan');
          if (tglInput) {
            const year = info.date.getFullYear();
            const month = String(info.date.getMonth() + 1).padStart(2, '0');
            const day = String(info.date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            tglInput.value = dateStr;
            console.log('📅 Fallback: Set input value to:', dateStr);
          }
        }
      } else {
        console.error('❌ tglPicker not available');
        // Fallback: set value langsung ke input
        const tglInput = document.getElementById('tgl_kegiatan');
        if (tglInput) {
          const year = info.date.getFullYear();
          const month = String(info.date.getMonth() + 1).padStart(2, '0');
          const day = String(info.date.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          tglInput.value = dateStr;
          console.log('📅 Fallback: Set input value to:', dateStr);
        }
      }

      bsAddEventSidebar.show();
    },

    // ** PENGGANTIAN KUNCI 3: Klik pada event yang ada (DETAIL) **
    eventClick: function (info) {
      console.log('🎯 Event clicked:', info.event);
      console.log('🎯 Event ID:', info.event.id);
      console.log('🎯 Event title:', info.event.title);
      
      // Pastikan ID event valid
      if (!info.event.id || info.event.id === 'null' || info.event.id === null) {
        console.error('❌ Invalid event ID:', info.event.id);
        showAlertOnce({
          icon: 'error',
          title: 'Error!',
          text: 'ID event tidak valid.',
          showCancelButton: false,
          showDenyButton: false,
          showCloseButton: false
        });
        return;
      }
      
      currentEventId = info.event.id; // Simpan ID event
      console.log('✅ currentEventId set to:', currentEventId);
      
      // Simpan juga di sessionStorage sebagai backup
      sessionStorage.setItem('currentEventId', currentEventId);
      console.log('💾 Saved to sessionStorage:', sessionStorage.getItem('currentEventId'));

      // Tampilkan modal detail
      showDetailKegiatan(currentEventId);
    },
    datesSet: function () {
      modifyToggler();
    },
    viewDidMount: function () {
      modifyToggler();
    }
    });

      // Render kalender
      calendar.render();
      modifyToggler();
      console.log('✅ FullCalendar rendered successfully!');
    } catch (error) {
      console.error('❌ Error initializing FullCalendar:', error);
          calendarEl.innerHTML = '<div class="alert alert-danger">Error initializing calendar: ' + error.message + '</div>';
        }
      } else {
        console.log('⏳ FullCalendar not ready, retrying...');
        setTimeout(initCalendar, 500);
    }
    };
    
    // Mulai inisialisasi
    initCalendar();
  } else {
      console.error('❌ Calendar element not found!');
  }

  // === 5. EVENT HANDLER FORM (CRUD AJAX) ===
  // (Logika dari app-pegawai-list.js)

  // Tombol Submit (Create / Update) - Hanya jika form ada
  if (giatbidForm) {
    giatbidForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      // Validasi manual seperti di pegawai
      let isValid = true;
      const requiredFields = [
        'nama_kegiatan', 'tgl_kegiatan', 'tempat_kegiatan', 'waktu_kegiatan',
        'bidang_kegiatan', 'jumlah_peserta_kegiatan', 'pj_acara_kegiatan',
        'pj_sarpras_kegiatan', 'pj_mc_kegiatan', 'pj_konsumsi_kegiatan',
        'pj_dokumentasi_kegiatan', 'anggaran_kegiatan', 'status_apbd_kegiatan'
      ];

      // Hapus error styling lama
      giatbidForm.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
      });
      giatbidForm.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
      });

      // Validasi setiap field
      requiredFields.forEach(fieldName => {
        const field = giatbidForm.querySelector(`[name="${fieldName}"]`);
        if (field && (!field.value || field.value.trim() === '')) {
          isValid = false;
          field.classList.add('is-invalid');
          
          // Tambahkan pesan error
          const errorMsg = document.createElement('div');
          errorMsg.className = 'invalid-feedback d-block';
          errorMsg.style.cssText = 'display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);';
          
          let message = '';
          switch(fieldName) {
            case 'nama_kegiatan': message = 'Nama Kegiatan wajib diisi.'; break;
            case 'tgl_kegiatan': message = 'Tanggal Kegiatan wajib diisi.'; break;
            case 'tempat_kegiatan': message = 'Tempat Kegiatan wajib diisi.'; break;
            case 'waktu_kegiatan': message = 'Waktu Kegiatan wajib diisi.'; break;
            case 'bidang_kegiatan': message = 'Bidang wajib dipilih.'; break;
            case 'jumlah_peserta_kegiatan': message = 'Jumlah Peserta wajib diisi.'; break;
            case 'pj_acara_kegiatan': message = 'PJ Acara wajib dipilih.'; break;
            case 'pj_sarpras_kegiatan': message = 'PJ Sarpras wajib dipilih.'; break;
            case 'pj_mc_kegiatan': message = 'PJ MC wajib dipilih.'; break;
            case 'pj_konsumsi_kegiatan': message = 'PJ Konsumsi wajib dipilih.'; break;
            case 'pj_dokumentasi_kegiatan': message = 'PJ Dokumentasi wajib dipilih.'; break;
            case 'anggaran_kegiatan': message = 'Anggaran wajib diisi.'; break;
            case 'status_apbd_kegiatan': message = 'Status APBD wajib dipilih.'; break;
            default: message = 'Field ini wajib diisi.'; break;
          }
          
          errorMsg.textContent = message;
          field.parentNode.appendChild(errorMsg);
        }
      });

      if (isValid) {
        submitFormAjax();
      } else {
        showAlertOnce({ 
          icon: 'error', 
          title: 'Data Tidak Valid', 
          text: 'Silakan periksa kembali isian form Anda.',
          showCancelButton: false,
          showDenyButton: false,
          showCloseButton: false
        });
      }
    });
  }

  // Fungsi inti AJAX (dipanggil jika validasi lolos)
  function submitFormAjax() {
    isSubmitting = true;
    setButtonLoading(true);

    // Cek apakah ini CREATE atau UPDATE
    const id = $('#id_kegiatan').val(); // Asumsikan ada hidden input <input type="hidden" id="id_kegiatan">
    const loadingMessage = id ? 'Memperbarui data...' : 'Menyimpan data...';
    showLoadingScreen(loadingMessage);

    const formData = new FormData(giatbidForm);
    
    // Pastikan anggaran yang dikirim hanya berupa angka murni
    const anggaranField = document.getElementById('anggaran_kegiatan');
    if (anggaranField) {
      const anggaranValue = getAnggaranValue(anggaranField);
      formData.set('anggaran_kegiatan', anggaranValue);
    }
    
    const url = id ? `/giatbid/${id}` : '/giatbid';
    const method = id ? 'PUT' : 'POST';

    if (id) {
      formData.append('_method', 'PUT'); // Spoofing method untuk update
    }

    $.ajax({
      data: formData,
      url: url,
      type: 'POST', // Selalu POST, _method akan urus PUT
      contentType: false,
      processData: false,
      success: function (data) {
        hideLoadingScreen();
        setButtonLoading(false);
        isSubmitting = false;
        bsAddEventSidebar.hide();

        calendar.refetchEvents(); // <-- PENTING: Muat ulang event di kalender

        showAlertOnce({
          icon: 'success',
          title: 'Berhasil!',
          text: data.success,
          timer: 2000,
          showConfirmButton: false,
          showCancelButton: false,
          showDenyButton: false,
          showCloseButton: false
        });
      },
      error: function (xhr) {
        hideLoadingScreen();
        setButtonLoading(false);
        isSubmitting = false;

        if (xhr.status === 422 && xhr.responseJSON.errors) {
          // Tampilkan error validasi seperti di pegawai
          const errors = xhr.responseJSON.errors;
          let errorCount = 0;
          let errorMessages = [];
          
          // Hapus error styling lama
          giatbidForm.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
          });
          giatbidForm.querySelectorAll('.invalid-feedback').forEach(el => {
            el.remove();
          });
          
          // Tandai field yang error (manual seperti di pegawai)
          $.each(errors, function (key, value) {
            errorCount++;
            const element = $(`[name="${key}"]`);
            
            if (element.length > 0) {
              // Add invalid class
              element.addClass('is-invalid');
              
              // Buat elemen pesan error yang lebih baik
              let msgElement = $(
                '<div class="invalid-feedback d-block" style="display: block !important; color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; background: #fff5f5; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border-left: 4px solid #dc3545; border: 1px solid #fecaca; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);"></div>'
              );
              msgElement.text(value[0]);
              
              // Tempatkan pesan error
              let targetElement = element;
              if (element.parent().hasClass('form-floating')) {
                targetElement = element.parent();
              } else if (element.parent().hasClass('position-relative')) {
                targetElement = element.parent();
              }
              
              // Hapus pesan error lama jika ada
              targetElement.find('.invalid-feedback').remove();
              targetElement.after(msgElement);
              
              // Force visibility
              msgElement.show();
              msgElement.css('display', 'block');
              
              errorMessages.push('• ' + value[0]);
            }
          });
          
          // Show detailed error message
          let errorHtml = '<div class="text-start">';
          errorHtml += '<p class="mb-2"><strong>Terjadi kesalahan validasi:</strong></p>';
          errorHtml += '<ul class="mb-0" style="padding-left: 20px;">';
          errorMessages.forEach(msg => {
            errorHtml += `<li>${msg}</li>`;
          });
          errorHtml += '</ul></div>';

          showAlertOnce({
            icon: 'error',
            title: 'Gagal Menyimpan!',
            html: errorHtml,
            showCancelButton: false,
            showDenyButton: false,
            showCloseButton: false
          });
        } else {
          // Error server lainnya
          showAlertOnce({
            icon: 'error',
            title: 'Gagal!',
            text: xhr.responseJSON?.message || 'Terjadi kesalahan server.',
            showCancelButton: false,
            showDenyButton: false,
            showCloseButton: false
          });
        }
      }
    });
  }

  // Tombol Delete - Hanya jika tombol ada
  if (btnDeleteEvent) {
    btnDeleteEvent.addEventListener('click', function () {
    if (!currentEventId) return;

    // Gunakan konfirmasi SweetAlert dengan konfigurasi yang tepat
    Swal.fire({
      title: 'Apakah Anda Yakin?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      showDenyButton: false,
      showCloseButton: false,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      allowOutsideClick: false,
      allowEscapeKey: true
    }).then(function (result) {
      if (result.isConfirmed) {
        showLoadingScreen('Menghapus data...');

        $.ajax({
          type: 'DELETE',
          url: `/giatbid/${currentEventId}`,
          success: function (data) {
            hideLoadingScreen();
            bsAddEventSidebar.hide();

            calendar.refetchEvents(); // <-- PENTING: Muat ulang event

            showAlertOnce({
              icon: 'success',
              title: 'Dihapus!',
              text: data.success,
              timer: 2000,
              showConfirmButton: false,
              showCancelButton: false,
              showDenyButton: false,
              showCloseButton: false
            });
          },
          error: function (xhr) {
            hideLoadingScreen();
            showAlertOnce({
              icon: 'error',
              title: 'Gagal Menghapus!',
            text: xhr.responseJSON?.error || 'Terjadi kesalahan.',
            showCancelButton: false,
            showDenyButton: false,
            showCloseButton: false
            });
          }
        });
      }
    });
    });
  }

  // Tombol Batal di Offcanvas - Hanya jika tombol ada
  if (btnCancel) {
    btnCancel.addEventListener('click', () => bsAddEventSidebar.hide());
  }

  // Reset form saat offcanvas dibuka dan ditutup
  if (addEventSidebar) {
    addEventSidebar.addEventListener('show.bs.offcanvas', function () {
      // Jangan reset di sini, biarkan form dalam state yang sudah ada
      console.log('📝 Offcanvas opened, currentEventId:', currentEventId);
    });
    
    addEventSidebar.addEventListener('hidden.bs.offcanvas', function () {
      // Reset hanya jika tidak dalam mode edit
      if (!currentEventId) {
        resetFormForAdd();
      }
    });
  }

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', function () {
      resetFormForAdd(); // Gunakan reset untuk mode Add
    });
  }

  // Mobile Sidebar Toggle - Perbaikan untuk mobile
  if (mobileSidebarToggle) {
    const appCalendarSidebar = document.getElementById('app-calendar-sidebar');
    const appOverlay = document.querySelector('.app-overlay');
    
    console.log('📱 Mobile sidebar toggle found:', mobileSidebarToggle);
    console.log('📱 App calendar sidebar found:', appCalendarSidebar);
    console.log('📱 App overlay found:', appOverlay);
    
    // Fungsi untuk show/hide sidebar
    function toggleSidebar(show) {
      if (appCalendarSidebar) {
        if (show) {
          appCalendarSidebar.classList.add('show');
          if (appOverlay) {
            appOverlay.classList.add('show');
          }
          // Prevent body scroll when sidebar is open
          document.body.style.overflow = 'hidden';
        } else {
          appCalendarSidebar.classList.remove('show');
          if (appOverlay) {
            appOverlay.classList.remove('show');
          }
          // Restore body scroll
          document.body.style.overflow = '';
        }
        console.log('📱 Sidebar toggled, classes:', appCalendarSidebar.className);
      }
    }
    
    mobileSidebarToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('📱 Mobile sidebar toggle clicked');
      
      // Toggle sidebar
      const isOpen = appCalendarSidebar.classList.contains('show');
      toggleSidebar(!isOpen);
    });
    
    // Hide sidebar when clicking overlay
    if (appOverlay) {
      appOverlay.addEventListener('click', function () {
        console.log('📱 Overlay clicked, hiding sidebar');
        toggleSidebar(false);
      });
    }
    
    // Hide sidebar when clicking outside on mobile
    document.addEventListener('click', function (e) {
      if (window.innerWidth < 992 && appCalendarSidebar) {
        if (!appCalendarSidebar.contains(e.target) && 
            !mobileSidebarToggle.contains(e.target) && 
            appOverlay && !appOverlay.contains(e.target)) {
          console.log('📱 Clicked outside, hiding sidebar');
          toggleSidebar(false);
        }
      }
    });
    
    // Hide sidebar on window resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992) {
        console.log('📱 Resized to desktop, hiding sidebar');
        toggleSidebar(false);
      }
    });
    
    // Hide sidebar when pressing escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && appCalendarSidebar.classList.contains('show')) {
        console.log('📱 Escape key pressed, hiding sidebar');
        toggleSidebar(false);
      }
    });
  } else {
    console.log('❌ Mobile sidebar toggle not found');
  }

  // Event handler untuk modal detail kegiatan
  if (editKegiatanBtn) {
    editKegiatanBtn.addEventListener('click', function () {
      // Coba ambil ID dari sessionStorage jika currentEventId null
      if (!currentEventId || currentEventId === 'null' || currentEventId === null) {
        const storedId = sessionStorage.getItem('currentEventId');
        console.log('🔄 Trying to get ID from sessionStorage:', storedId);
        if (storedId && storedId !== 'null' && storedId !== null) {
          currentEventId = storedId;
          console.log('✅ Retrieved currentEventId from sessionStorage:', currentEventId);
        }
      }
      
      // Pastikan currentEventId valid sebelum melanjutkan
      if (!currentEventId || currentEventId === 'null' || currentEventId === null) {
        console.error('❌ Invalid currentEventId for edit:', currentEventId);
        showAlertOnce({
          icon: 'error',
          title: 'Gagal Membuka Edit!',
          text: 'ID kegiatan tidak valid untuk edit.',
          showCancelButton: false,
          showDenyButton: false,
          showCloseButton: false
        });
        return;
      }
      
      detailKegiatanModal.hide();
      
      // Buka form edit
      resetFormForEdit(); // Gunakan reset untuk mode Edit
      offcanvasTitle.innerHTML = 'Edit Kegiatan';
      
      // Ganti teks tombol submit
      submitBtn.innerHTML = '<span class="btn-text">Update</span><span class="btn-loading d-none">Mengupdate...</span>';
      
      // Tampilkan tombol delete
      btnDeleteEvent.classList.remove('d-none');
      
      // Ambil data lengkap dari server
      console.log('🔍 Loading edit data for ID:', currentEventId);
      showLoadingScreen('Memuat data kegiatan...');
      
      $.get(`/giatbid/${currentEventId}/edit`)
        .done(function (data) {
          console.log('✅ Edit data received:', data);
          
          // Isi form dengan data
          $('#id_kegiatan').val(data.id_kegiatan);
          $('#nama_kegiatan').val(data.nama_kegiatan).trigger('input');
          
          // Set tanggal dengan error handling
          try {
            tglPicker.setDate(data.tgl_kegiatan, false);
            // Trigger validasi setelah set date
            setTimeout(() => {
              const field = document.getElementById('tgl_kegiatan');
              if (field) {
                validateFlatpickrField(field, 'Tanggal Kegiatan');
              }
            }, 100);
          } catch (error) {
            console.error('❌ Error setting date:', error);
            $('#tgl_kegiatan').val(data.tgl_kegiatan).trigger('change');
          }
          
          // Set waktu dengan error handling
          try {
            waktuPicker.setDate(data.waktu_kegiatan, false);
            // Trigger validasi setelah set time
            setTimeout(() => {
              const field = document.getElementById('waktu_kegiatan');
              if (field) {
                validateFlatpickrField(field, 'Waktu Kegiatan');
              }
            }, 100);
          } catch (error) {
            console.error('❌ Error setting time:', error);
            $('#waktu_kegiatan').val(data.waktu_kegiatan).trigger('change');
          }
          
          $('#tempat_kegiatan').val(data.tempat_kegiatan).trigger('input');
          $('#bidang_kegiatan').val(data.bidang_kegiatan).trigger('change');
          $('#jumlah_peserta_kegiatan').val(data.jumlah_peserta_kegiatan).trigger('input');
          $('#status_apbd_kegiatan').val(data.status_apbd_kegiatan).trigger('change');
          $('#anggaran_kegiatan').val(displayAnggaranValue(data.anggaran_kegiatan)).trigger('input');

          // Isi Select2 dengan error handling
          try {
            pjAcara.val(data.pj_acara_kegiatan).trigger('change');
            pjSarpras.val(data.pj_sarpras_kegiatan).trigger('change');
            pjMc.val(data.pj_mc_kegiatan).trigger('change');
            pjKonsumsi.val(data.pj_konsumsi_kegiatan).trigger('change');
            pjDokumentasi.val(data.pj_dokumentasi_kegiatan).trigger('change');
            
            // Trigger validasi untuk Select2 setelah set values
            setTimeout(() => {
              validateSelect2Field(pjAcara, 'PJ Acara');
              validateSelect2Field(pjSarpras, 'PJ Sarpras');
              validateSelect2Field(pjMc, 'PJ MC');
              validateSelect2Field(pjKonsumsi, 'PJ Konsumsi');
              validateSelect2Field(pjDokumentasi, 'PJ Dokumentasi');
            }, 150);
          } catch (error) {
            console.error('❌ Error setting Select2 values:', error);
          }

          hideLoadingScreen();
          
          // Validasi ulang semua field setelah data diisi
          setTimeout(() => {
            validateAllFields();
          }, 300);
          
          bsAddEventSidebar.show();
        })
        .fail(function (xhr, status, error) {
          hideLoadingScreen();
          console.error('❌ Error loading edit data:', {
            xhr: xhr,
            status: status,
            error: error,
            responseText: xhr.responseText
          });
          
          let errorMessage = 'Data kegiatan tidak dapat ditemukan.';
          if (xhr.responseJSON?.error) {
            errorMessage = xhr.responseJSON.error;
          } else if (xhr.responseJSON?.message) {
            errorMessage = xhr.responseJSON.message;
          }
          
          showAlertOnce({
            icon: 'error',
            title: 'Gagal Memuat!',
            text: errorMessage,
            showCancelButton: false,
            showDenyButton: false,
            showCloseButton: false
          });
        });
    });
  }

  if (hapusKegiatanBtn) {
    hapusKegiatanBtn.addEventListener('click', function () {
      // Coba ambil ID dari sessionStorage jika currentEventId null
      if (!currentEventId || currentEventId === 'null' || currentEventId === null) {
        const storedId = sessionStorage.getItem('currentEventId');
        console.log('🔄 Trying to get ID from sessionStorage for delete:', storedId);
        if (storedId && storedId !== 'null' && storedId !== null) {
          currentEventId = storedId;
          console.log('✅ Retrieved currentEventId from sessionStorage for delete:', currentEventId);
        }
      }
      
      detailKegiatanModal.hide();
      
      // Konfirmasi hapus
      Swal.fire({
        title: 'Apakah Anda Yakin?',
        text: 'Data yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        showDenyButton: false,
        showCloseButton: false,
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        allowOutsideClick: false,
        allowEscapeKey: true
      }).then(function (result) {
        if (result.isConfirmed) {
          showLoadingScreen('Menghapus data...');

          $.ajax({
            type: 'DELETE',
            url: `/giatbid/${currentEventId}`,
            success: function (data) {
              hideLoadingScreen();
              
              calendar.refetchEvents(); // Muat ulang event

              showAlertOnce({
                icon: 'success',
                title: 'Dihapus!',
                text: data.success,
                timer: 2000,
                showConfirmButton: false,
                showCancelButton: false,
                showDenyButton: false,
                showCloseButton: false
              });
            },
            error: function (xhr) {
              hideLoadingScreen();
              showAlertOnce({
                icon: 'error',
                title: 'Gagal Menghapus!',
                text: xhr.responseJSON?.error || 'Terjadi kesalahan.',
                showCancelButton: false,
                showDenyButton: false,
                showCloseButton: false
              });
            }
          });
        }
      });
    });
  }

  // === 6. EVENT HANDLER SIDEBAR KALENDER ===
  // (Diambil dari app-calendar.js)

  // Filter Checkbox
  if (selectAll) {
    selectAll.addEventListener('click', e => {
      filterInput.forEach(c => (c.checked = e.currentTarget.checked));
      calendar.refetchEvents(); // Muat ulang event dengan filter baru
    });
  }

  if (filterInput) {
    filterInput.forEach(item => {
      item.addEventListener('click', () => {
        if (document.querySelectorAll('.input-filter:checked').length < filterInput.length) {
          selectAll.checked = false;
        } else {
          selectAll.checked = true;
        }
        calendar.refetchEvents(); // Muat ulang event dengan filter baru
      });
    });
  }

  // Inline Calendar (Flatpickr di sidebar)
  if (inlineCalendarEl) {
    const inlineCalInstance = inlineCalendarEl.flatpickr({
      monthSelectorType: 'static',
      inline: true,
      minDate: 'today', // Disable tanggal sebelum hari ini
      disable: [
        function(date) {
          // Disable semua tanggal sebelum hari ini
          return date < new Date().setHours(0,0,0,0);
        }
      ]
    });
    inlineCalInstance.config.onChange.push(function (date) {
      calendar.gotoDate(date[0]);
      modifyToggler();
      // Sembunyikan sidebar saat tanggal dipilih (opsional)
      appCalendarSidebar.classList.remove('show');
      appOverlay.classList.remove('show');
    });
  }
});
