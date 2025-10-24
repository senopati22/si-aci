<?php
// app/Http/Controllers/apps/GiatbidList.php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pegawai;
use App\Models\Giatbid; // Gunakan model Giatbid
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GiatbidList extends Controller
{
    /**
     * Menampilkan halaman kalender Kegiatan Bidang.
     */
    public function index()
    {
        // Ambil data pegawai untuk dropdown form
        $pegawais = Pegawai::where('status_pegawai', 'Aktif')
                           ->orderBy('nama_pegawai')
                           ->get(['id_pegawai', 'nama_pegawai']);

        // Arahkan ke view kalender, bukan list pegawai
        return view('content.apps.app-giatbid-list', compact('pegawais'));
    }

    /**
     * Menyediakan data untuk FullCalendar
     * (Pengganti fungsi 'data()' di PegawaiList.php)
     */
    public function events(Request $request)
    {
        // Ambil data kegiatan dari database
        $giatbids = Giatbid::all();

        $events = [];
        foreach ($giatbids as $giat) {
            // Gabungkan tanggal dan waktu menjadi satu timestamp ISO8601
            // FullCalendar membutuhkan format 'YYYY-MM-DDTHH:MM:SS'
            $startDateTime = Carbon::parse($giat->tgl_kegiatan . ' ' . $giat->waktu_kegiatan)
                                ->toIso8601String();

            $events[] = [
                'id' => $giat->id_kegiatan,
                'title' => $giat->nama_kegiatan,
                'start' => $startDateTime,
                // 'end' => $startDateTime, // Anda bisa tambahkan 'tgl_selesai' jika ada
                'allDay' => false, // Asumsikan tidak ada yang all-day
                'extendedProps' => [
                    // Ini digunakan untuk filter checkbox di sidebar
                    'calendar' => $giat->bidang_kegiatan ?? 'Lainnya'
                ]
            ];
        }

        return response()->json($events);
    }


    /**
     * Menyimpan data baru ke database.
     * (Logika dari PegawaiList.php)
     */
    public function store(Request $request)
    {
        // Validasi data baru
        $validator = Validator::make($request->all(), [
            'nama_kegiatan' => 'required|string|max:100|unique:kegiatan_bidang,nama_kegiatan|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
            'tgl_kegiatan' => 'required|date',
            'tempat_kegiatan' => 'required|string|max:255|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
            'waktu_kegiatan' => 'required|date_format:H:i',
            'bidang_kegiatan' => 'required|string|max:100',
            'jumlah_peserta_kegiatan' => 'required|integer|min:0',
            'pj_acara_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_sarpras_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_mc_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_konsumsi_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_dokumentasi_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'anggaran_kegiatan' => 'required|numeric|min:0',
            'status_apbd_kegiatan' => 'required|string|max:50',
        ], [
            'nama_kegiatan.unique' => 'Nama Kegiatan ini sudah terdaftar.',
            'tgl_kegiatan.required' => 'Tanggal Kegiatan wajib diisi.',
            'waktu_kegiatan.date_format' => 'Format Waktu harus HH:MM (contoh: 09:00).',
            'pj_acara_kegiatan.required' => 'PJ Acara wajib dipilih.',
            // ... (tambahkan pesan error kustom lainnya)
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Simpan data
            Giatbid::create($request->all());
            return response()->json(['success' => 'Data kegiatan berhasil ditambahkan.']);

        } catch (\Throwable $e) {
            Log::error('Gagal menyimpan kegiatan', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data.'], 500);
        }
    }

    /**
     * Mengambil data untuk form edit.
     * (Logika dari PegawaiList.php)
     */
    public function edit(Giatbid $giatbid)
    {
        // Kembalikan data giatbid sebagai JSON
        return response()->json($giatbid);
    }

    /**
     * Memperbarui data di database.
     * (Logika dari PegawaiList.php)
     */
    public function update(Request $request, Giatbid $giatbid)
    {
        // Validasi data update
        $validator = Validator::make($request->all(), [
            'nama_kegiatan' => [
                'required',
                'string',
                'max:100',
                // Perbaiki validasi unique untuk update
                'unique:kegiatan_bidang,nama_kegiatan,' . $giatbid->id_kegiatan . ',id_kegiatan',
                'regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/'
            ],
            'tgl_kegiatan' => 'required|date',
            'tempat_kegiatan' => 'required|string|max:255|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
            'waktu_kegiatan' => 'required|date_format:H:i',
            'bidang_kegiatan' => 'required|string|max:100',
            'jumlah_peserta_kegiatan' => 'required|integer|min:0',
            'pj_acara_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_sarpras_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_mc_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_konsumsi_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'pj_dokumentasi_kegiatan' => 'required|integer|exists:pegawai,id_pegawai',
            'anggaran_kegiatan' => 'required|numeric|min:0',
            'status_apbd_kegiatan' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Update data
            $giatbid->update($request->all());
            return response()->json(['success' => 'Data kegiatan berhasil diperbarui.']);

        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui kegiatan', [
                'error' => $e->getMessage(),
                'id' => $giatbid->id_kegiatan
            ]);
            return response()->json(['message' => 'Terjadi kesalahan saat memperbarui data.'], 500);
        }
    }

    /**
     * Menghapus data dari database.
     * (Logika dari PegawaiList.php)
     */
    public function destroy(Giatbid $giatbid)
    {
        try {
            $giatbid->delete();
            return response()->json(['success' => 'Data kegiatan berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Gagal menghapus kegiatan', ['error' => $e->getMessage(), 'id' => $giatbid->id_kegiatan]);
            return response()->json(['error' => 'Terjadi kesalahan saat menghapus data.'], 500);
        }
    }
}
