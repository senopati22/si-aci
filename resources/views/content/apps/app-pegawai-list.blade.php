@extends('layouts/layoutMaster')

@section('title', 'Data Kepegawaian')

@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.scss',
  'resources/assets/vendor/libs/select2/select2.scss',
  'resources/assets/vendor/libs/@form-validation/form-validation.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss',
  'resources/assets/vendor/libs/flatpickr/flatpickr.scss'
])
@endsection

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
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js',
  'resources/assets/vendor/libs/flatpickr/flatpickr.js'
])
@endsection

@section('page-script')
@vite('resources/assets/js/app-pegawai-list.js')
@endsection

@section('content')
<!-- <div class="row g-6 mb-6">
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Session</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-2">21,459</h4>
              <p class="text-success mb-1">(+29%)</p>
            </div>
            <small class="mb-0">Total Users</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-primary rounded-3">
              <div class="ri-group-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Paid Users</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-1">4,567</h4>
              <p class="text-success mb-1">(+18%)</p>
            </div>
            <small class="mb-0">Last week analytics</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-danger rounded-3">
              <div class="ri-user-add-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Active Users</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-1">19,860</h4>
              <p class="text-danger mb-1">(-14%)</p>
            </div>
            <small class="mb-0">Last week analytics</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-success rounded-3">
              <div class="ri-user-follow-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Pending Users</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-1">237</h4>
              <p class="text-success mb-1">(+42%)</p>
            </div>
            <small class="mb-0">Last week analytics</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-warning rounded-3">
              <div class="ri-user-search-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> -->

<!-- Users List Table -->
<div class="card">
  <div class="card-header border-bottom">
    <h5 class="card-title mb-0">Daftar Pegawai</h5>
  </div>
  <div class="card-datatable table-responsive">
    <table class="datatables-pegawai table">
      <thead>
        <tr>
          <th></th>
          <th>No</th>
          <th>Foto</th>
          <th>Nama</th>
          <th>Jabatan</th>
          <th>Pangkat</th>
          <th>Gol/Eselon</th>
          <th>Status</th>
          <th>#</th>
        </tr>
      </thead>
    </table>
  </div>

  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasPegawai" aria-labelledby="offcanvasPegawaiLabel">
    <div class="offcanvas-header border-bottom">
      <h5 id="offcanvasPegawaiLabel" class="offcanvas-title">Tambah Pegawai</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0 h-100">
    <form class="add-new-user pt-0" id="pegawaiForm_KHUSUS_INI" method="POST" action="{{ route('pegawai.store') }}">
      @csrf
      {{-- Hidden input untuk menyimpan ID saat edit --}}
      <input type="hidden" id="pegawai_id" name="id_pegawai">

      {{-- Foto Pegawai --}}
      <div class="mb-5">
        <label for="foto_pegawai" class="form-label">Foto Pegawai</label>
        <input class="form-control" type="file" id="foto_pegawai" name="foto_pegawai">
      </div>

      {{-- NI & Nama Pegawai --}}
      <div class="row">
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control" id="ni_pegawai" placeholder="Masukkan NI Pegawai" label="NI Pegawai" name="ni_pegawai" />
            <label for="ni_pegawai">NI Pegawai</label>
          </div>
        </div>
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" id="nama_pegawai" class="form-control" placeholder="Masukkan Nama Lengkap" name="nama_pegawai" />
            <label for="nama_pegawai">Nama Lengkap</label>
          </div>
        </div>
      </div>

      {{-- Jabatan --}}
      <div class="row">
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <select id="id_jabatan" name="id_jabatan" class="select2 form-select">
              <option value="">Pilih Jabatan</option>
              @foreach ($jabatans as $jabatan)
                <option value="{{ $jabatan->id_jabatan }}">{{ $jabatan->nama_jabatan }}</option>
              @endforeach
            </select>
          </div>
        </div>
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" id="nama_jabatan_pegawai" class="form-control" placeholder="Masukkan Nama Jabatan" name="nama_jabatan_pegawai" />
            <label for="nama_jabatan">Nama Jabatan</label>
          </div>
        </div>
      </div>

      {{-- PLT & No Telp --}}
      <div class="row">
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <select id="plt_pegawai" name="plt_pegawai" class="form-select">
              <option value="0">Tidak</option>
              <option value="1">Ya</option>
            </select>
            <label for="plt_pegawai">Status PLT</label>
          </div>
        </div>
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" id="no_telp_pegawai" class="form-control" placeholder="Masukkan Nomor Telepon" name="no_telp_pegawai" />
            <label for="no_telp_pegawai">Nomor Telepon</label>
          </div>
        </div>
      </div>

      {{-- Alamat --}}
      <div class="row">
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <textarea class="form-control" id="alamat_pegawai" name="alamat_pegawai" rows="3" placeholder="Alamat sesuai KTP"></textarea>
            <label for="alamat_pegawai">Alamat KTP</label>
          </div>
        </div>
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <textarea class="form-control" id="alamat_domisili_pegawai" name="alamat_domisili_pegawai" rows="3" placeholder="Alamat tempat tinggal sekarang"></textarea>
            <label for="alamat_domisili_pegawai">Alamat Domisili</label>
          </div>
        </div>
      </div>

      {{-- Pangkat, Golongan, Eselon --}}
      <div class="row">
        <div class="col-md-4 mb-5">
          <div class="form-floating form-floating-outline">
            <select id="id_pangkat" name="id_pangkat" class="select2 form-select">
              <option value="">Pilih Pangkat</option>
              @foreach ($pangkats as $pangkat)
                <option value="{{ $pangkat->id_pangkat }}">{{ $pangkat->nama_pangkat }}</option>
              @endforeach
            </select>
          </div>
        </div>
        <div class="col-md-4 mb-5">
          <div class="form-floating form-floating-outline">
            <select id="id_golongan" name="id_golongan" class="select2 form-select">
              <option value="">Pilih Golongan</option>
              @foreach ($golongans as $golongan)
                <option value="{{ $golongan->id_golongan }}">{{ $golongan->nama_golongan }}</option>
              @endforeach
            </select>
          </div>
        </div>
        <div class="col-md-4 mb-5">
          <div class="form-floating form-floating-outline">
            <select id="id_eselon" name="id_eselon" class="select2 form-select">
              <option value="">Pilih Eselon</option>
              @foreach ($eselons as $eselon)
                <option value="{{ $eselon->id_eselon }}">{{ $eselon->nama_eselon }}</option>
              @endforeach
            </select>
          </div>
        </div>
      </div>

      {{-- Tempat Lahir & Tanggal Lahir --}}
      <div class="row">
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" id="tempat_lahir_pegawai" class="form-control" placeholder="Masukkan Tempat Lahir" name="tempat_lahir_pegawai" />
            <label for="tempat_lahir_pegawai">Tempat Lahir</label>
          </div>
        </div>
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" id="tanggal_lahir_pegawai" class="form-control flatpickr-basic" placeholder="Pilih Tanggal Lahir" name="tanggal_lahir_pegawai" />
            <label for="tanggal_lahir_pegawai">Tanggal Lahir</label>
          </div>
        </div>
      </div>

      {{-- Jenis Kelamin --}}
      <div class="mb-5">
        <label class="form-label">Jenis Kelamin</label>
        <div class="d-flex">
          <div class="form-check me-3">
            <input class="form-check-input" type="radio" id="jk_laki" name="jk_pegawai" value="L" />
            <label class="form-check-label" for="jk_laki">Laki-laki</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="jk_perempuan" name="jk_pegawai" value="P" />
            <label class="form-check-label" for="jk_perempuan">Perempuan</label>
          </div>
        </div>
      </div>

      {{-- Status Pegawai --}}
      <div class="form-floating form-floating-outline mb-5">
        <select id="status_pegawai" name="status_pegawai" class="form-select">
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
        <label for="status_pegawai">Status Pegawai</label>
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
