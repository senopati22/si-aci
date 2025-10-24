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
  // === 1. DEKLARASI ELEMEN ===
  const calendarEl = document.getElementById('calendar');
  const appCalendarSidebar = document.querySelector('.app-calendar-sidebar');
  const addEventSidebar = document.getElementById('addEventSidebar');
  const appOverlay = document.querySelector('.app-overlay');

  // (Anda bisa sesuaikan warna ini di view)
  const calendarsColor = {
    Sekretariat: 'primary',
    KIP: 'success',
    IKP: 'danger',
    Santik: 'warning',
    Aptika: 'info'
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

  // === 2. UTILITIES (AJAX, ALERT, LOADING) ===
  // (Diambil dari app-pegawai-list.js)

  // Setup AJAX CSRF
  $.ajaxSetup({
    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
  });

  function showAlertOnce(options) {
    if (isAlertVisible) return Promise.resolve();
    isAlertVisible = true;
    options.showClass = { popup: 'swal2-show' };
    options.hideClass = { popup: 'swal2-hide' };
    return Swal.fire(options).finally(() => (isAlertVisible = false));
  }

  function showLoadingScreen(message = 'Memproses data...') {
    if (isAlertVisible) return;
    isAlertVisible = true;
    Swal.fire({
      title: message,
      text: 'Mohon tunggu sebentar...',
      // Gunakan ikon loader bawaan SweetAlert
      iconHtml: '<div class="swal2-loader"></div>',
      showConfirmButton: false,
      showCancelButton: false,
      showDenyButton: false,
      showCloseButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: { icon: 'swal2-icon-show' } // Memaksa ikon untuk tampil
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
  const tglPicker = tglKegiatan.flatpickr({
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'd F Y',
    placeholder: 'Pilih Tanggal'
  });

  const waktuPicker = waktuKegiatan.flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true,
    placeholder: 'Pilih Waktu'
  });

  // Init Select2
  function initSelect2(selector, placeholder) {
    if (selector.length) {
      selector.wrap('<div class="position-relative"></div>').select2({
        placeholder: placeholder,
        dropdownParent: selector.parent(),
        allowClear: true
      });
    }
  }
  initSelect2(pjAcara, 'Pilih PJ Acara');
  initSelect2(pjSarpras, 'Pilih PJ Sarpras');
  initSelect2(pjMc, 'Pilih PJ MC');
  initSelect2(pjKonsumsi, 'Pilih PJ Konsumsi');
  initSelect2(pjDokumentasi, 'Pilih PJ Dokumentasi');

  // Init FormValidation (FV)
  fv = FormValidation.formValidation(giatbidForm, {
    fields: {
      // Sesuaikan dengan validasi di controller Anda
      nama_kegiatan: { validators: { notEmpty: { message: 'Nama Kegiatan wajib diisi.' } } },
      tgl_kegiatan: { validators: { notEmpty: { message: 'Tanggal Kegiatan wajib diisi.' } } },
      tempat_kegiatan: { validators: { notEmpty: { message: 'Tempat Kegiatan wajib diisi.' } } },
      waktu_kegiatan: { validators: { notEmpty: { message: 'Waktu Kegiatan wajib diisi.' } } },
      bidang_kegiatan: { validators: { notEmpty: { message: 'Bidang wajib dipilih.' } } },
      jumlah_peserta_kegiatan: { validators: { notEmpty: { message: 'Jumlah Peserta wajib diisi.' } } },
      pj_acara_kegiatan: { validators: { notEmpty: { message: 'PJ Acara wajib dipilih.' } } },
      pj_sarpras_kegiatan: { validators: { notEmpty: { message: 'PJ Sarpras wajib dipilih.' } } },
      pj_mc_kegiatan: { validators: { notEmpty: { message: 'PJ MC wajib dipilih.' } } },
      pj_konsumsi_kegiatan: { validators: { notEmpty: { message: 'PJ Konsumsi wajib dipilih.' } } },
      pj_dokumentasi_kegiatan: { validators: { notEmpty: { message: 'PJ Dokumentasi wajib dipilih.' } } },
      anggaran_kegiatan: { validators: { notEmpty: { message: 'Anggaran wajib diisi.' } } },
      status_apbd_kegiatan: { validators: { notEmpty: { message: 'Status APBD wajib dipilih.' } } }
    },
    plugins: {
      trigger: new FormValidation.plugins.Trigger(),
      bootstrap5: new FormValidation.plugins.Bootstrap5({
        eleValidClass: '',
        rowSelector: '.mb-5' // Sesuaikan dengan wrapper field Anda
      }),
      autoFocus: new FormValidation.plugins.AutoFocus()
      // JANGAN GUNAKAN SubmitButton, kita handle manual
    }
  });

  // === 4. FUNGSI INTI KALENDER ===

  // Fungsi untuk reset form
  function resetForm() {
    isSubmitting = false;
    setButtonLoading(false);
    currentEventId = null;

    giatbidForm.reset(); // Reset form HTML
    if (fv) fv.resetForm(true); // Reset validasi FV

    // Reset plugin secara manual
    tglPicker.clear();
    waktuPicker.clear();
    $('#giatbidForm .select2').val(null).trigger('change');

    // Ganti judul dan tombol kembali ke mode "Add"
    offcanvasTitle.innerHTML = 'Tambah Kegiatan';
    submitBtn.innerHTML = '<span class="btn-text">Simpan</span><span class="btn-loading d-none">Menyimpan...</span>'; // Sesuaikan teks

    // Sembunyikan tombol delete
    btnDeleteEvent.classList.add('d-none');
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

  // Init FullCalendar
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',

    // ** PENGGANTIAN KUNCI 1: Mengambil event via AJAX dari Controller **
    events: function (fetchInfo, successCallback, failureCallback) {
      $.ajax({
        url: '/giatbid/events', // Rute yang kita buat di GiatbidList.php
        type: 'GET',
        success: function (data) {
          // Filter data di sisi klien berdasarkan checkbox
          const selectedBidang = getSelectedBidang();

          if (selectedBidang.includes('all')) {
            successCallback(data); // Tampilkan semua jika 'all'
          } else {
            const filteredEvents = data.filter(event => selectedBidang.includes(event.extendedProps.calendar));
            successCallback(filteredEvents);
          }
        },
        error: function (xhr) {
          console.error('Error fetching events:', xhr);
          failureCallback(xhr);
          showAlertOnce({
            icon: 'error',
            title: 'Gagal Memuat Kegiatan!',
            text: 'Tidak dapat mengambil data kegiatan dari server.'
          });
        }
      });
    },

    plugins: [
      FullCalendar.dayGridPlugin,
      FullCalendar.interactionPlugin,
      FullCalendar.listPlugin,
      FullCalendar.timeGridPlugin
    ],
    editable: false, // Jangan biarkan user drag-and-drop, edit via form saja
    dragScroll: true,
    dayMaxEvents: 2,
    navLinks: true,
    headerToolbar: {
      start: 'sidebarToggle, prev,next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    direction: direction,
    initialDate: new Date(),

    // --- EVENT HANDLER KALENDER ---

    // ** PENGGANTIAN KUNCI 2: Klik pada tanggal kosong (CREATE) **
    dateClick: function (info) {
      resetForm();
      offcanvasTitle.innerHTML = 'Tambah Kegiatan';
      currentEventId = null;

      // Isi tanggal yang diklik
      tglPicker.setDate(info.date);

      bsAddEventSidebar.show();
    },

    // ** PENGGANTIAN KUNCI 3: Klik pada event yang ada (EDIT) **
    eventClick: function (info) {
      resetForm();
      offcanvasTitle.innerHTML = 'Edit Kegiatan';
      currentEventId = info.event.id; // Simpan ID event

      // Ganti teks tombol submit
      submitBtn.innerHTML = '<span class="btn-text">Update</span><span class="btn-loading d-none">Mengupdate...</span>';

      // Tampilkan tombol delete
      btnDeleteEvent.classList.remove('d-none');

      // Ambil data lengkap dari server menggunakan pola dari app-pegawai-list.js
      showLoadingScreen('Memuat data kegiatan...');
      $.get(`/giatbid/${currentEventId}/edit`, function (data) {
        // Isi form dengan data
        $('#id_kegiatan').val(data.id_kegiatan); // Simpan ID di hidden input
        $('#nama_kegiatan').val(data.nama_kegiatan);
        tglPicker.setDate(data.tgl_kegiatan, true);
        waktuPicker.setDate(data.waktu_kegiatan, true);
        $('#tempat_kegiatan').val(data.tempat_kegiatan);
        $('#bidang_kegiatan').val(data.bidang_kegiatan);
        $('#jumlah_peserta_kegiatan').val(data.jumlah_peserta_kegiatan);
        $('#status_apbd_kegiatan').val(data.status_apbd_kegiatan);
        $('#anggaran_kegiatan').val(data.anggaran_kegiatan);

        // Isi Select2
        pjAcara.val(data.pj_acara_kegiatan).trigger('change');
        pjSarpras.val(data.pj_sarpras_kegiatan).trigger('change');
        pjMc.val(data.pj_mc_kegiatan).trigger('change');
        pjKonsumsi.val(data.pj_konsumsi_kegiatan).trigger('change');
        pjDokumentasi.val(data.pj_dokumentasi_kegiatan).trigger('change');

        hideLoadingScreen();
        bsAddEventSidebar.show();
      }).fail(function () {
        hideLoadingScreen();
        showAlertOnce({
          icon: 'error',
          title: 'Gagal Memuat!',
          text: 'Data kegiatan tidak dapat ditemukan.'
        });
      });
    }
  });

  // Render kalender
  calendar.render();

  // === 5. EVENT HANDLER FORM (CRUD AJAX) ===
  // (Logika dari app-pegawai-list.js)

  // Tombol Submit (Create / Update)
  giatbidForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isSubmitting) return;

    if (fv) {
      fv.validate().then(function (status) {
        if (status === 'Valid') {
          submitFormAjax();
        } else {
          showAlertOnce({ icon: 'error', title: 'Data Tidak Valid', text: 'Silakan periksa kembali isian form Anda.' });
        }
      });
    }
  });

  // Fungsi inti AJAX (dipanggil jika validasi lolos)
  function submitFormAjax() {
    isSubmitting = true;
    setButtonLoading(true);

    // Cek apakah ini CREATE atau UPDATE
    const id = $('#id_kegiatan').val(); // Asumsikan ada hidden input <input type="hidden" id="id_kegiatan">
    const loadingMessage = id ? 'Memperbarui data...' : 'Menyimpan data...';
    showLoadingScreen(loadingMessage);

    const formData = new FormData(giatbidForm);
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
          showConfirmButton: false
        });
      },
      error: function (xhr) {
        hideLoadingScreen();
        setButtonLoading(false);
        isSubmitting = false;

        if (xhr.status === 422 && xhr.responseJSON.errors) {
          // Tampilkan error validasi
          const errors = xhr.responseJSON.errors;
          let errorHtml = '<ul class="text-start" style="padding-left: 20px;">';
          $.each(errors, function (key, value) {
            errorHtml += `<li>${value[0]}</li>`;
            // Tandai field yang error
            $(`[name="${key}"]`).addClass('is-invalid');
          });
          errorHtml += '</ul>';

          showAlertOnce({
            icon: 'error',
            title: 'Gagal Menyimpan!',
            html: errorHtml
          });
        } else {
          // Error server lainnya
          showAlertOnce({
            icon: 'error',
            title: 'Gagal!',
            text: xhr.responseJSON?.message || 'Terjadi kesalahan server.'
          });
        }
      }
    });
  }

  // Tombol Delete
  btnDeleteEvent.addEventListener('click', function () {
    if (!currentEventId) return;

    // Gunakan konfirmasi SweetAlert dari app-pegawai-list.js
    showAlertOnce({
      title: 'Apakah Anda Yakin?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
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
              showConfirmButton: false
            });
          },
          error: function (xhr) {
            hideLoadingScreen();
            showAlertOnce({
              icon: 'error',
              title: 'Gagal Menghapus!',
              text: xhr.responseJSON?.error || 'Terjadi kesalahan.'
            });
          }
        });
      }
    });
  });

  // Tombol Batal di Offcanvas
  btnCancel.addEventListener('click', () => bsAddEventSidebar.hide());

  // Reset form saat offcanvas ditutup
  addEventSidebar.addEventListener('hidden.bs.offcanvas', function () {
    resetForm();
  });

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', function () {
      resetForm(); // Panggil fungsi reset
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
      inline: true
    });
    inlineCalInstance.config.onChange.push(function (date) {
      calendar.gotoDate(date[0]);
      // Sembunyikan sidebar saat tanggal dipilih (opsional)
      appCalendarSidebar.classList.remove('show');
      appOverlay.classList.remove('show');
    });
  }
});
