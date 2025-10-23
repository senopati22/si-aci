@php
$configData = Helper::appClasses();
$customizerHidden = 'customizer-hide';
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Login')

@section('vendor-style')
@vite(['resources/assets/vendor/libs/@form-validation/form-validation.scss'])
@endsection

@section('recaptcha')
{{-- Ini akan mengisi slot di commonMaster.blade.php --}}
@php
$recaptchaSiteKey = config('services.recaptcha.site_key');
@endphp
@if($recaptchaSiteKey)
<script>
console.log('reCAPTCHA Site Key loaded:', '{{ $recaptchaSiteKey }}');
</script>
<script src="https://www.google.com/recaptcha/api.js?render={{ $recaptchaSiteKey }}"></script>
@else
<script>
console.warn('reCAPTCHA Site Key tidak ditemukan. Pastikan RECAPTCHA_SITE_KEY sudah diatur di file .env');
console.log('Config value:', '{{ config('services.recaptcha.site_key') }}');
</script>
@endif
@endsection

@section('page-style')
@vite(['resources/assets/vendor/scss/pages/page-auth.scss'])
@endsection

@section('vendor-script')
@vite(['resources/assets/vendor/libs/@form-validation/popular.js', 'resources/assets/vendor/libs/@form-validation/bootstrap5.js', 'resources/assets/vendor/libs/@form-validation/auto-focus.js'])
@endsection

@section('page-script')
@vite(['resources/assets/js/pages-auth.js'])
@endsection

@section('content')
<div class="position-relative">
  <div class="authentication-wrapper authentication-basic container-p-y p-4 p-sm-0">
    <div class="authentication-inner py-6">
      <div class="card p-md-7 p-1">
        <div class="app-brand justify-content-center mt-5">
          <a href="{{url('/login')}}" class="app-brand-link gap-2">
            <span class="app-brand-logo demo">
              <img src="{{ asset('images/garuda-'.$configData['style'].'.svg') }}" alt="Ikon Garuda" style="width: 40px;">
            </span>
          </a>
        </div>
        <div class="card-body mt-1">
          <h4 class="mb-1 text-center">Selamat Datang di SI ACI! 👋</h4>
          <p class="mb-5 text-center">Silakan masuk ke akun Anda</p>

          <form id="formAuthentication" class="mb-5" method="POST" action="{{ route('login.process') }}" data-sitekey="{{ config('services.recaptcha.site_key') }}">
            @csrf
            <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response">
            <div class="form-floating form-floating-outline mb-5">
              <input type="text" class="form-control" id="username" name="username" placeholder="Masukkan username Anda" autofocus>
              <label for="username">Username</label>
            </div>
            <div class="mb-5">
              <div class="form-password-toggle">
                <div class="input-group input-group-merge">
                  <div class="form-floating form-floating-outline">
                    <input type="password" id="password" class="form-control" name="password" placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" aria-describedby="password" />
                    <label for="password">Password</label>
                  </div>
                  <span class="input-group-text cursor-pointer"><i class="ri-eye-off-line"></i></span>
                </div>
              </div>
            </div>
            <div class="mb-5 d-flex justify-content-between mt-5">
              <div class="form-check mt-2">
                <input class="form-check-input" type="checkbox" id="remember-me" name="remember-me">
                <label class="form-check-label" for="remember-me">Ingat Saya</label>
              </div>
            </div>
            <div class="mb-5">
              <button class="btn btn-danger d-grid w-100" type="submit">Login</button>
            </div>
          </form>
        </div>
      </div>
      <img alt="mask" src="{{asset('assets/img/illustrations/auth-basic-login-light.png') }}" class="authentication-image d-none d-lg-block" />
    </div>
  </div>
</div>
@endsection
