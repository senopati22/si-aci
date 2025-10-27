@extends('layouts/layoutMaster')

@section('title', 'Data Keuseran')

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
@vite('resources/assets/js/app-user-list.js')
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
    <h5 class="card-title mb-0">Daftar User</h5>
  </div>
  <div class="card-datatable table-responsive">
    <table class="datatables-user table">
      <thead>
        <tr>
          <th></th>
          <th>No</th>
          <th>Username</th>
          <th>Nama Pegawai</th>
          <th>Status</th>
          <th>Failed Attempts</th>
          <th>Last Attempt</th>
          <th>#</th>
        </tr>
      </thead>
    </table>
  </div>

  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasUser" aria-labelledby="offcanvasUserLabel">
    <div class="offcanvas-header border-bottom">
      <h5 id="offcanvasUserLabel" class="offcanvas-title">Tambah User</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0 h-100">
    <form class="add-new-user pt-0" id="userForm" method="POST" action="{{ route('user.store') }}">
      @csrf
      {{-- Hidden input untuk menyimpan ID saat edit --}}
      <input type="hidden" id="user_id" name="id_user">

      {{-- Username & Password --}}
      <div class="row">
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control" id="username" placeholder="Masukkan username" label="Usename" name="username" />
            <label for="username">Username</label>
          </div>
        </div>
        <div class="col-md-6 mb-5">
          <div class="form-floating form-floating-outline">
            <input type="text" id="password" class="form-control" placeholder="Masukkan Password" name="password" />
            <label for="password">Password</label>
          </div>
        </div>
      </div>

      {{-- Jenis Kelamin --}}
      <div class="mb-5">
        <label class="form-label">Status</label>
        <div class="d-flex">
          <div class="form-check me-3">
            <input class="form-check-input" type="radio" id="act_active" name="active" value="1" />
            <label class="form-check-label" for="act_active">Aktif</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="act_nonactive" name="active" value="0" />
            <label class="form-check-label" for="act_nonactive">Tidak Aktif</label>
          </div>
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
