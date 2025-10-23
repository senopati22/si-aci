@extends('layouts/layoutMaster')

@section('title', 'Data Master Jabatan')

{{-- Vendor CSS-nya sama persis dengan Pegawai --}}
@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.scss',
  'resources/assets/vendor/libs/select2/select2.scss',
  'resources/assets/vendor/libs/@form-validation/form-validation.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss'
  // Flatpickr tidak diperlukan untuk form ini
])
@endsection

{{-- Vendor JS-nya sama persis dengan Pegawai --}}
@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/jquery/jquery.js',
  'resources/assets/vendor/libs/moment/moment.js',
  'resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
  'resources/assets/vendor/libs/select2/select2.js',
  'resources/assets/vendor/libs/@form-validation/popular.js',
  'resources/assets/vendor/libs/@form-validation/bootstrap5.js',
  'resources/assets/vendor/libs/@form-validation/auto-focus.js',
  'resources/assets/vendor/libs/cleavejs/cleave.js',
  'resources/assets/vendor/libs/cleavejs/cleave-phone.js',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js'
  // Flatpickr tidak diperlukan
])
@endsection

{{-- Kita akan buat file JS baru khusus untuk Jabatan --}}
@section('page-script')
@vite('resources/assets/js/app-jabatan-list.js')
@endsection

@section('content')

<div class="card">
  <div class="card-header border-bottom">
    <h5 class="card-title mb-0">Daftar Jabatan</h5>
  </div>
  <div class="card-datatable table-responsive">
    {{-- Ganti class ke datatables-jabatan --}}
    <table class="datatables-jabatan table">
      <thead>
        <tr>
          <th></th>
          <th>No</th>
          <th>Nama Jabatan</th>
          <th>Aksi</th>
        </tr>
      </thead>
    </table>
  </div>

  {{-- Offcanvas untuk Tambah/Edit Jabatan --}}
  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasJabatan" aria-labelledby="offcanvasJabatanLabel">
    <div class="offcanvas-header border-bottom">
      <h5 id="offcanvasJabatanLabel" class="offcanvas-title">Tambah Jabatan</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0 h-100">

      {{-- Ganti form id ke jabatanForm --}}
      <form class="add-new-user pt-0" id="jabatanForm" method="POST" action="{{ route('jabatan.store') }}">
        @csrf
        {{-- Hidden input untuk menyimpan ID saat edit --}}
        <input type="hidden" id="jabatan_id" name="id_jabatan">

        {{-- Field Nama Jabatan --}}
        <div class="mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control" id="nama_jabatan" placeholder="Masukkan Nama Jabatan" name="nama_jabatan" />
            <label for="nama_jabatan">Nama Jabatan</label>
          </div>
        </div>

        {{-- Tombol Aksi --}}
        <button type="submit" class="btn btn-primary me-sm-3 me-1" id="submitBtn">
          <span class="btn-text">Simpan</span>
          <span class="btn-loading d-none">
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Menyimpan...
          </span>
        </button>
        <button type="reset" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas">Batal</button>
      </form>
    </div>
  </div>
</div>
@endsection
