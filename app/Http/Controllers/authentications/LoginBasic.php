<?php

namespace App\Http\Controllers\authentications;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
use App\Models\User;
use ReCaptcha\ReCaptcha;
use RuntimeException;

class LoginBasic extends Controller
{
  protected $maxAttempts = 5;
  protected $decayMinutes = 10;

  public function index()
  {
      $pageConfigs = ['myLayout' => 'blank'];
      return view('content.authentications.auth-login-basic', ['pageConfigs' => $pageConfigs]);
  }

  public function login(Request $request)
  {
    try {
      $request->validate([
          'username' => 'required|string',
          'password' => 'required|string',
          'g-recaptcha-response' => 'required'
      ]);

      $throttleKey = Str::lower($request->input($this->username())) . '|' . $request->ip();
      $ipThrottleKey = 'lockout|' . $request->ip();

      if (RateLimiter::tooManyAttempts($ipThrottleKey, $this->maxAttempts)) {
          $seconds = RateLimiter::availableIn($ipThrottleKey);
          $encryptedSeconds = Crypt::encrypt($seconds);
          return response()->json(['redirect_url' => route('login.locked', ['encryptedSeconds' => $encryptedSeconds])], 429);
      }

      $recaptcha = new ReCaptcha(config('services.recaptcha.secret_key'));
      $response = $recaptcha->verify($request->input('g-recaptcha-response'), $request->ip());

      if (!$response->isSuccess()) {
            RateLimiter::hit($throttleKey, $this->decayMinutes * 60);
            RateLimiter::hit($ipThrottleKey, $this->decayMinutes * 60);
            return response()->json(['message' => 'Verifikasi reCAPTCHA gagal.'], 422);
      }

      $user = User::where($this->username(), $request->input($this->username()))->first();

      if (!$user || !Hash::check($request->password, $user->password)) {
          RateLimiter::hit($throttleKey, $this->decayMinutes * 60);
          RateLimiter::hit($ipThrottleKey, $this->decayMinutes * 60);

          // Setelah gagal, langsung cek apakah percobaan sudah habis
          if (RateLimiter::tooManyAttempts($ipThrottleKey, $this->maxAttempts)) {
              $seconds = RateLimiter::availableIn($ipThrottleKey);
              $encryptedSeconds = Crypt::encrypt($seconds);
              // Jika sudah habis, langsung kirim perintah redirect
              return response()->json(['redirect_url' => route('login.locked', ['encryptedSeconds' => $encryptedSeconds])], 429);
          }

          // Jika percobaan belum habis, kirim sisa percobaan
          $attemptsLeft = RateLimiter::retriesLeft($ipThrottleKey, $this->maxAttempts);
          return response()->json([
              'message' => 'Username atau Password salah.',
              'retries_left' => $attemptsLeft
          ], 422);
      }

      if ($user->active != 1) {
          return response()->json(['message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.'], 403);
      }

      RateLimiter::clear($throttleKey);
      RateLimiter::clear($ipThrottleKey);

      Auth::login($user, $request->filled('remember'));

      return response()->json(['message' => 'Login berhasil!', 'redirect' => '/dashboard'], 200);
    } catch (RuntimeException $e) {
      // Tangkap error spesifik "This password does not use the Bcrypt algorithm."
      // Kirim respons JSON agar bisa ditampilkan oleh SweetAlert
      return response()->json([
        'message' => 'Format password di database tidak valid. Harap hubungi administrator.'
      ], 500); // Kirim status 500
    }

  }

  public function username()
  {
      return 'username';
  }
}
