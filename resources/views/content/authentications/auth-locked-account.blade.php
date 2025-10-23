@php
$configData = Helper::appClasses();
$customizerHidden = 'customizer-hide';

$lockoutTime = $seconds ?? 120;
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Locked Account')

@section('page-style')
<!-- Page -->
@vite('resources/assets/vendor/scss/pages/page-auth.scss')
@endsection

@section('content')
<div class="position-relative">
  <div class="authentication-wrapper authentication-basic container-p-y p-4 p-sm-0">
    <div class="authentication-inner py-6">

      <div class="card p-md-7 p-1">
        <!-- Logo -->
        <div class="app-brand justify-content-center mt-5">
          <a href="#" class="app-brand-link gap-2">
            <span class="app-brand-logo demo">@include('_partials.macros',["width"=>25,"withbg"=>'var(--bs-primary)'])</span>
            <span class="app-brand-text demo text-heading fw-semibold">{{config('variables.templateName')}}</span>
          </a>
        </div>
        <!-- /Logo -->

        <!-- Verify Email -->
        <div class="card-body mt-1">
          <h4 class="mb-1 text-center">Anda Terkunci Sementara 🔒</h4>
          <p class="text-start mb-0 text-center">
            <span class="h6">Terlalu banyak percobaan login yang gagal.</span> Silakan coba lagi setelah hitung mundur selesai.
          </p>

          {{-- Elemen untuk menampilkan timer --}}
          <div id="countdown-timer" class="d-flex justify-content-center align-items-center flex-column">
            <h5 class="mb-1">Silakan coba lagi dalam:</h5>
            <p class="h1 mb-4 text-danger" id="timer-display"></p>
          </div>

          {{-- Pesan dan Tombol yang muncul setelah timer selesai --}}
          <div id="retry-section" class="d-none">
            <p class="h5 mb-4">Anda sudah bisa mencoba login kembali.</p>
            <a class="btn btn-danger w-100" href="{{ route('login') }}">
              Kembali ke Halaman Login
            </a>
          </div>
        </div>
      </div>
      <img alt="mask" src="{{asset('assets/img/illustrations/auth-basic-login-'.$configData['style'].'.png') }}" class="authentication-image d-none d-lg-block" data-app-light-img="illustrations/auth-basic-login-light.png" data-app-dark-img="illustrations/auth-basic-login-dark.png" />
      <!-- /Verify Email -->
    </div>
  </div>
</div>
@endsection

{{-- 👇 SECTION JAVASCRIPT YANG HILANG --}}
@section('page-script')
<script>
document.addEventListener('DOMContentLoaded', function() {
  const timerDisplay = document.getElementById('timer-display');
  const countdownTimerSection = document.getElementById('countdown-timer');
  const retrySection = document.getElementById('retry-section');
  let timeLeft = {{ $lockoutTime }};

  const countdown = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdown);
      countdownTimerSection.classList.add('d-none');
      retrySection.classList.remove('d-none');
    } else {
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      timerDisplay.textContent = `${minutes}:${seconds}`;
      timeLeft--;
    }
  }, 1000);
});
</script>
@endsection
