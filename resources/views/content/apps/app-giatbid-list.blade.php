@extends('layouts/layoutMaster')

@section('title', 'Kegiatan Bidang')

@section('vendor-style')
  @vite([
    'resources/assets/vendor/libs/fullcalendar/fullcalendar.scss',
    'resources/assets/vendor/libs/flatpickr/flatpickr.scss',
    'resources/assets/vendor/libs/select2/select2.scss',
    'resources/assets/vendor/libs/quill/editor.scss',
    'resources/assets/vendor/libs/@form-validation/form-validation.scss',
    'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss',
    'resources/assets/vendor/libs/flatpickr/flatpickr.scss'
  ])
@endsection

@section('page-style')
  @vite([
    'resources/assets/vendor/scss/pages/app-calendar.scss',
    'resources/css/app.css'
  ])
@endsection

@section('vendor-script')
  @vite([
    'resources/assets/vendor/libs/jquery/jquery.js',
    'resources/assets/vendor/libs/moment/moment.js',
    'resources/assets/vendor/libs/fullcalendar/fullcalendar.js',
    'resources/assets/vendor/libs/flatpickr/flatpickr.js',
    'resources/assets/vendor/libs/select2/select2.js',
    'resources/assets/vendor/libs/sweetalert2/sweetalert2.js',
    'resources/assets/vendor/libs/@form-validation/popular.js',
    'resources/assets/vendor/libs/@form-validation/bootstrap5.js',
    'resources/assets/vendor/libs/@form-validation/auto-focus.js'
  ])
@endsection

@section('page-script')
  @vite([
    'resources/assets/js/app-giatbid-calendar.js'
  ])
@endsection

@section('content')
<div class="card app-calendar-wrapper">
  <div class="row g-0">
    <!-- Calendar Sidebar -->
    <div class="col app-calendar-sidebar border-end" id="app-calendar-sidebar">
      <div class="p-5 my-sm-0 mb-4 border-bottom">
        <button class="btn btn-primary btn-toggle-sidebar w-100" data-bs-toggle="offcanvas" data-bs-target="#addEventSidebar" aria-controls="addEventSidebar">
          <i class="ri-add-line ri-16px me-1_5"></i>
          <span class="align-middle">Tambah Kegiatan Bidang</span>
        </button>
      </div>
      <div class="px-4">
        <!-- inline calendar (flatpicker) -->
        <div class="inline-calendar"></div>

        <hr class="mb-5 mx-n4 mt-3">
        <!-- Filter -->
        <div class="mb-4 ms-1">
          <h5>Filter Kegiatan</h5>
        </div>

        <div class="form-check form-check-secondary mb-5 ms-3">
          <input class="form-check-input select-all" type="checkbox" id="selectAll" data-value="all" checked>
          <label class="form-check-label" for="selectAll">Lihat Semua</label>
        </div>

        <div class="app-calendar-events-filter text-heading">
          <div class="form-check form-check-primary mb-5 ms-3">
            <input class="form-check-input input-filter" type="checkbox" id="select-sekretariat" data-value="Sekretariat" checked>
            <label class="form-check-label" for="select-sekretariat">Sekretariat</label>
          </div>
          <div class="form-check form-check-success mb-5 ms-3">
            <input class="form-check-input input-filter" type="checkbox" id="select-bidang1" data-value="Bidang I" checked>
            <label class="form-check-label" for="select-bidang1">Bidang I</label>
          </div>
          <div class="form-check form-check-danger mb-5 ms-3">
            <input class="form-check-input input-filter" type="checkbox" id="select-bidang2" data-value="Bidang II" checked>
            <label class="form-check-label" for="select-bidang2">Bidang II</label>
          </div>
        </div>
      </div>
    </div>
    <!-- /Calendar Sidebar -->

    <!-- Calendar & Modal -->
    <div class="col app-calendar-content">
      <div class="card shadow-none border-0 ">
        <div class="card-body pb-0">
          <!-- FullCalendar -->
          <div id="calendar"></div>
        </div>
      </div>
      <div class="app-overlay"></div>
      <!-- FullCalendar Offcanvas -->
      <div class="offcanvas offcanvas-end event-sidebar" tabindex="-1" id="addEventSidebar" aria-labelledby="addEventSidebarLabel">
        <div class="offcanvas-header border-bottom">
          <h5 class="offcanvas-title" id="addEventSidebarLabel">Tambah Kegiatan</h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          {{-- Ganti form template dengan form Giatbid --}}
          <form class="event-form pt-0" id="giatbidForm" onsubmit="return false">
            @csrf
            {{-- Hidden input untuk menyimpan ID saat edit --}}
            <input type="hidden" id="id_kegiatan" name="id_kegiatan">

            <div class="form-floating form-floating-outline mb-5">
              <input type="text" class="form-control" id="nama_kegiatan" name="nama_kegiatan" placeholder="Nama Kegiatan" />
              <label for="nama_kegiatan">Nama Kegiatan</label>
            </div>

            <div class="row">
              <div class="col-md-6 mb-5">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" id="tgl_kegiatan" name="tgl_kegiatan" placeholder="YYYY-MM-DD" />
                  <label for="tgl_kegiatan">Tanggal</label>
                </div>
              </div>
              <div class="col-md-6 mb-5">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" id="waktu_kegiatan" name="waktu_kegiatan" placeholder="HH:MM" />
                  <label for="waktu_kegiatan">Waktu (24 Jam)</label>
                </div>
              </div>
            </div>

            <div class="form-floating form-floating-outline mb-5">
              <input type="text" class="form-control" id="tempat_kegiatan" name="tempat_kegiatan" placeholder="Tempat Pelaksanaan" />
              <label for="tempat_kegiatan">Tempat</label>
            </div>

            <div class="form-floating form-floating-outline mb-5">
              <select class="form-select" id="bidang_kegiatan" name="bidang_kegiatan">
                <option value="">Pilih Bidang</option>
                <option value="Sekretariat">Sekretariat</option>
                <option value="Bidang I">Bidang I</option>
                <option value="Bidang II">Bidang II</option>
                <!-- <option value="Bidang III">Bidang III</option>
                <option value="Bidang IV">Bidang IV</option> -->
              </select>
              <label for="bidang_kegiatan">Bidang Penyelenggara</label>
            </div>

            <div class="row">
              <div class="col-md-6 mb-5">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" id="jumlah_peserta_kegiatan" name="jumlah_peserta_kegiatan" placeholder="0" />
                  <label for="jumlah_peserta_kegiatan">Jml Peserta</label>
                </div>
              </div>
              <div class="col-md-6 mb-5">
                <div class="form-floating form-floating-outline">
                  <select class="form-select" id="status_apbd_kegiatan" name="status_apbd_kegiatan">
                    <option value="APBD">APBD</option>
                    <option value="Non-APBD">Non-APBD</option>
                  </select>
                  <label for="status_apbd_kegiatan">Status Anggaran</label>
                </div>
              </div>
            </div>

            <div class="form-floating form-floating-outline mb-5">
              <input type="text" class="form-control" id="anggaran_kegiatan" name="anggaran_kegiatan" placeholder="0" />
              <label for="anggaran_kegiatan">Jumlah Anggaran (Rp)</label>
            </div>

            <hr>
            <h6 class="mb-4">Penanggung Jawab</h6>

            <div class="form-floating form-floating-outline mb-5 select2-primary">
              <select class="select2 form-select" id="pj_acara_kegiatan" name="pj_acara_kegiatan">
                <option value="">Pilih PJ Acara</option>
                @foreach ($pegawais as $pegawai)
                  <option value="{{ $pegawai->id_pegawai }}">{{ $pegawai->nama_pegawai }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-floating form-floating-outline mb-5 select2-primary">
              <select class="select2 form-select" id="pj_sarpras_kegiatan" name="pj_sarpras_kegiatan">
                <option value="">Pilih PJ Sarpras</option>
                @foreach ($pegawais as $pegawai)
                  <option value="{{ $pegawai->id_pegawai }}">{{ $pegawai->nama_pegawai }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-floating form-floating-outline mb-5 select2-primary">
              <select class="select2 form-select" id="pj_mc_kegiatan" name="pj_mc_kegiatan">
                <option value="">Pilih PJ MC</option>
                @foreach ($pegawais as $pegawai)
                  <option value="{{ $pegawai->id_pegawai }}">{{ $pegawai->nama_pegawai }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-floating form-floating-outline mb-5 select2-primary">
              <select class="select2 form-select" id="pj_konsumsi_kegiatan" name="pj_konsumsi_kegiatan">
                <option value="">Pilih PJ Konsumsi</option>
                @foreach ($pegawais as $pegawai)
                  <option value="{{ $pegawai->id_pegawai }}">{{ $pegawai->nama_pegawai }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-floating form-floating-outline mb-5 select2-primary">
              <select class="select2 form-select" id="pj_dokumentasi_kegiatan" name="pj_dokumentasi_kegiatan">
                <option value="">Pilih PJ Dokumentasi</option>
                @foreach ($pegawais as $pegawai)
                  <option value="{{ $pegawai->id_pegawai }}">{{ $pegawai->nama_pegawai }}</option>
                @endforeach
              </select>
            </div>

            <div class="mb-5 d-flex justify-content-sm-between justify-content-start my-6 gap-2">
              <div class="d-flex">
                <button type="submit" class="btn btn-primary btn-add-event me-4" id="submitBtn">
                  <span class="btn-text">Simpan</span>
                  <span class="btn-loading d-none">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Menyimpan...
                  </span>
                </button>
                <button type="reset" class="btn btn-outline-secondary btn-cancel me-sm-0 me-1" data-bs-dismiss="offcanvas">Batal</button>
              </div>
              <button class="btn btn-outline-danger btn-delete-event d-none">Hapus</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- /Calendar & Modal -->

    <!-- Modal Detail Kegiatan -->
    <div class="modal fade" id="detailKegiatanModal" tabindex="-1" aria-labelledby="detailKegiatanModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="detailKegiatanModalLabel">-</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <hr>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Nama Kegiatan</label>
                <p class="form-control-plaintext" id="detailNamaKegiatan">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Tanggal</label>
                <p class="form-control-plaintext" id="detailTanggal">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Waktu</label>
                <p class="form-control-plaintext" id="detailWaktu">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Tempat</label>
                <p class="form-control-plaintext" id="detailTempat">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Bidang</label>
                <p class="form-control-plaintext" id="detailBidang">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Jumlah Peserta</label>
                <p class="form-control-plaintext" id="detailJumlahPeserta">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Status APBD</label>
                <p class="form-control-plaintext" id="detailStatusApbd">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Anggaran</label>
                <p class="form-control-plaintext" id="detailAnggaran">-</p>
              </div>
            </div>

            <hr>
            <h6 class="mb-3">Penanggung Jawab</h6>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">PJ Acara</label>
                <p class="form-control-plaintext" id="detailPjAcara">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">PJ Sarpras</label>
                <p class="form-control-plaintext" id="detailPjSarpras">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">PJ MC</label>
                <p class="form-control-plaintext" id="detailPjMc">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">PJ Konsumsi</label>
                <p class="form-control-plaintext" id="detailPjKonsumsi">-</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">PJ Dokumentasi</label>
                <p class="form-control-plaintext" id="detailPjDokumentasi">-</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-primary" id="editKegiatanBtn">
              <i class="ri-edit-line me-1"></i>Edit
            </button>
            <button type="button" class="btn btn-outline-danger" id="hapusKegiatanBtn">
              <i class="ri-delete-bin-line me-1"></i>Hapus
            </button>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
