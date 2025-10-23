# Konfigurasi reCAPTCHA

## Masalah reCAPTCHA tidak tampil

reCAPTCHA tidak tampil karena environment variable `RECAPTCHA_SITE_KEY` dan `RECAPTCHA_SECRET_KEY` belum dikonfigurasi.

## Langkah-langkah Setup:

### 1. Daftar di Google reCAPTCHA

- Kunjungi: https://www.google.com/recaptcha/admin
- Login dengan akun Google Anda
- Klik "Create" untuk membuat site baru

### 2. Konfigurasi Site

- **Label**: SI ACI Login (atau nama yang sesuai)
- **reCAPTCHA type**: pilih "reCAPTCHA v3"
- **Domains**: tambahkan domain Anda (localhost untuk development)
- **Accept the Terms**: centang
- Klik "Submit"

### 3. Dapatkan Kunci

Setelah site dibuat, Anda akan mendapatkan:

- **Site Key** (untuk frontend)
- **Secret Key** (untuk backend)

### 4. Tambahkan ke File .env

Tambahkan baris berikut ke file `.env`:

```env
# reCAPTCHA Configuration
RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 5. Restart Server

Setelah menambahkan environment variables, restart server Laravel Anda.

## Verifikasi

- Buka halaman login
- Buka Developer Tools (F12) → Console
- Jika reCAPTCHA berhasil dimuat, tidak ada error
- Jika ada error "reCAPTCHA Site Key tidak ditemukan", periksa konfigurasi .env

## Catatan

- Pastikan domain di konfigurasi reCAPTCHA sesuai dengan domain aplikasi Anda
- Untuk development, gunakan `localhost` atau `127.0.0.1`
- Untuk production, gunakan domain yang sebenarnya
