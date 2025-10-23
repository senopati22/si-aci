<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Crypt; // <-- Tambahkan ini

class RedirectIfLocked
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $throttleKey = 'lockout|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            // 1. Enkripsi sisa detiknya
            $encryptedSeconds = Crypt::encrypt($seconds);

            // 2. Gunakan nama parameter yang benar ('encryptedSeconds')
            return redirect()->route('login.locked', ['encryptedSeconds' => $encryptedSeconds]);
        }

        return $next($request);
    }
}
