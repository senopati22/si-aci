<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pegawai;
use App\Models\Jabatan;
use App\Models\Pangkat;
use App\Models\Golongan;
use App\Models\Eselon;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PegawaiList extends Controller
{
  public function index()
  {
    $jabatans = Jabatan::orderBy('nama_jabatan')->get();
    $pangkats = Pangkat::orderBy('nama_pangkat')->get();
    $golongans = Golongan::orderBy('nama_golongan')->get();
    $eselons = Eselon::orderBy('nama_eselon')->get();

    // --- KIRIM DATA KE VIEW ---
    return view('content.apps.app-pegawai-list', compact(
        'jabatans',
        'pangkats',
        'golongans',
        'eselons'
    ));
  }

  /**
   * Menampilkan daftar data pegawai.
   */
  // public function index()
  // {
  //   // Ambil semua data pegawai dengan pagination
  //   $pegawais = Pegawai::paginate(10); // Angka 10 berarti 10 data per halaman
  //   return view('content.apps.app-pegawai-list', compact('pegawais'));
  // }

  /**
   * Menyediakan data untuk DataTables
   */
  public function data()
  {
    $pegawai = Pegawai::select([
        'pegawai.*',
        // Tambahkan alias 'as' agar DataTables tidak bingung
        'jabatan.nama_jabatan as nama_jabatan_pegawai',
        'pangkat.nama_pangkat as nama_pangkat',
        'golongan.nama_golongan as nama_golongan',
        'eselon.nama_eselon as nama_eselon'
    ])
    ->leftJoin('jabatan', 'pegawai.id_jabatan', '=', 'jabatan.id_jabatan')
    ->leftJoin('pangkat', 'pegawai.id_pangkat', '=', 'pangkat.id_pangkat')
    ->leftJoin('golongan', 'pegawai.id_golongan', '=', 'golongan.id_golongan')
    ->leftJoin('eselon', 'pegawai.id_eselon', '=', 'eselon.id_eselon');

    return DataTables::of($pegawai)
        ->addIndexColumn()
        ->addColumn('action', function ($row) {
            $editBtn = '<a href="javascript:void(0)" data-id="' . $row->id_pegawai . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect edit-btn" data-bs-toggle="tooltip" title="Edit"><i class="ri-edit-box-line ri-20px"></i></a>';
            $deleteBtn = '<a href="javascript:void(0)" data-id="' . $row->id_pegawai . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-btn" data-bs-toggle="tooltip" title="Hapus"><i class="ri-delete-bin-7-line ri-20px"></i></a>';
            return '<div class="d-flex align-items-center">' . $editBtn . $deleteBtn . '</div>';
        })
        ->filterColumn('nama_pangkat', function($query, $keyword) {
            $query->where('pangkat.nama_pangkat', 'like', "%{$keyword}%");
        })
        ->filterColumn('nama_golongan', function($query, $keyword) {
            $query->where('golongan.nama_golongan', 'like', "%{$keyword}%");
        })
        ->filterColumn('nama_jabatan_pegawai', function($query, $keyword) {
            $query->where('jabatan.nama_jabatan', 'like', "%{$keyword}%");
        })
        ->rawColumns(['action'])
        ->make(true);
  }

  /**
   * Menyimpan data baru ke database.
  */
  public function store(Request $request)
  {
    // --- VALIDASI SISI SERVER ---
    $validator = Validator::make($request->all(), [
      'ni_pegawai' => 'required|string|min:10|max:18|unique:pegawai,ni_pegawai|regex:/^[0-9]+$/',
      'nama_pegawai' => 'required|string|min:3|max:255|regex:/^[A-Za-zÀ-ÖØ-öø-ÿ\'.,\-\s]+$/',
      'nama_jabatan_pegawai' => 'required|string|min:1|max:50|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
      'id_jabatan' => 'required|exists:jabatan,id_jabatan',
      'plt_pegawai' => 'required|in:0,1',
      'no_telp_pegawai' => 'required|string|max:100|regex:/^[0-9+\-\s()]+$/',
      'tempat_lahir_pegawai' => 'required|string|min:2|max:100|regex:/^[A-Za-zÀ-ÖØ-öø-ÿ\'\.\-\s]+$/',
      'tanggal_lahir_pegawai' => 'required|date|before:today',
      'jk_pegawai' => 'required|in:L,P',
      'alamat_pegawai' => 'required|string|min:10|max:255|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
      'alamat_domisili_pegawai' => 'required|string|min:10|max:255|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
      'id_pangkat' => 'required|exists:pangkat,id_pangkat',
      'id_golongan' => 'required|exists:golongan,id_golongan',
      'id_eselon' => 'required|exists:eselon,id_eselon',
      'foto_pegawai' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB
      'status_pegawai' => 'required|in:Aktif,Nonaktif'
    ], [
      'ni_pegawai.required' => 'Nomor Induk Pegawai wajib diisi.',
      'ni_pegawai.min' => 'Nomor Induk Pegawai minimal 10 karakter.',
      'ni_pegawai.max' => 'Nomor Induk Pegawai maksimal 18 karakter.',
      'ni_pegawai.unique' => 'Nomor Induk Pegawai sudah terdaftar.',
      'ni_pegawai.regex' => 'Nomor Induk Pegawai hanya boleh berisi angka.',
      'nama_pegawai.required' => 'Nama Lengkap wajib diisi.',
      'nama_pegawai.min' => 'Nama Lengkap minimal 3 karakter.',
      'nama_pegawai.max' => 'Nama Lengkap maksimal 255 karakter.',
      'nama_pegawai.regex' => 'Nama hanya boleh huruf, spasi, titik, koma, apostrof, dan tanda minus.',
      'nama_jabatan_pegawai.required' => 'Nama Jabatan wajib diisi.',
      'nama_jabatan_pegawai.min' => 'Nama Jabatan minimal 1 karakter.',
      'nama_jabatan_pegawai.max' => 'Nama Jabatan maksimal 50 karakter.',
      'nama_jabatan_pegawai.regex' => 'Nama jabatan hanya boleh huruf/angka dan tanda . , ( ) / -',
      'id_jabatan.required' => 'Jabatan wajib dipilih.',
      'id_jabatan.exists' => 'Jabatan yang dipilih tidak valid.',
      'plt_pegawai.required' => 'Status PLT wajib dipilih.',
      'plt_pegawai.in' => 'Status PLT tidak valid.',
      'no_telp_pegawai.required' => 'Nomor Telepon wajib diisi.',
      'no_telp_pegawai.max' => 'Nomor Telepon maksimal 100 karakter.',
      'no_telp_pegawai.regex' => 'Format Nomor Telepon tidak valid.',
      'tempat_lahir_pegawai.required' => 'Tempat Lahir wajib diisi.',
      'tempat_lahir_pegawai.min' => 'Tempat Lahir minimal 2 karakter.',
      'tempat_lahir_pegawai.max' => 'Tempat Lahir maksimal 100 karakter.',
      'tempat_lahir_pegawai.regex' => 'Tempat lahir hanya boleh huruf, spasi, titik, apostrof, dan tanda minus.',
      'tanggal_lahir_pegawai.required' => 'Tanggal Lahir wajib diisi.',
      'tanggal_lahir_pegawai.date' => 'Format Tanggal Lahir tidak valid.',
      'tanggal_lahir_pegawai.before' => 'Tanggal Lahir harus sebelum hari ini.',
      'jk_pegawai.required' => 'Jenis Kelamin wajib dipilih.',
      'jk_pegawai.in' => 'Jenis Kelamin tidak valid.',
      'alamat_pegawai.required' => 'Alamat KTP wajib diisi.',
      'alamat_pegawai.min' => 'Alamat KTP minimal 10 karakter.',
      'alamat_pegawai.max' => 'Alamat KTP maksimal 255 karakter.',
      'alamat_pegawai.regex' => 'Alamat hanya boleh huruf/angka dan tanda . , ( ) / -',
      'alamat_domisili_pegawai.required' => 'Alamat Domisili wajib diisi.',
      'alamat_domisili_pegawai.min' => 'Alamat Domisili minimal 10 karakter.',
      'alamat_domisili_pegawai.max' => 'Alamat Domisili maksimal 255 karakter.',
      'alamat_domisili_pegawai.regex' => 'Alamat hanya boleh huruf/angka dan tanda . , ( ) / -',
      'id_pangkat.required' => 'Pangkat wajib dipilih.',
      'id_pangkat.exists' => 'Pangkat yang dipilih tidak valid.',
      'id_golongan.required' => 'Golongan wajib dipilih.',
      'id_golongan.exists' => 'Golongan yang dipilih tidak valid.',
      'id_eselon.required' => 'Eselon wajib dipilih.',
      'id_eselon.exists' => 'Eselon yang dipilih tidak valid.',
      'foto_pegawai.image' => 'File harus berupa gambar.',
      'foto_pegawai.mimes' => 'Format gambar harus jpeg, png, jpg, atau gif.',
      'foto_pegawai.max' => 'Ukuran gambar maksimal 2MB.',
      'status_pegawai.required' => 'Status Pegawai wajib dipilih.',
      'status_pegawai.in' => 'Status Pegawai tidak valid.'
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $data = $request->except('foto_pegawai');
    // nama_jabatan_pegawai adalah kolom asli di tabel pegawai, jadi tidak perlu di-unset

    if ($request->hasFile('foto_pegawai')) {
        $file = $request->file('foto_pegawai');
        Log::info('Foto file received:', [
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType()
        ]);
        $path = $file->store('public/pegawai_fotos');
        $data['foto_pegawai'] = $path; // Simpan path relatif, bukan URL lengkap
        Log::info('Foto stored at:', ['path' => $path]);
    } else {
        Log::info('No foto file in request');
    }

    try {
      Log::info('Creating pegawai with data:', $data);
      Pegawai::create($data);
      Log::info('Pegawai created successfully');
      return response()->json(['success' => 'Data pegawai berhasil ditambahkan.']);
    } catch (\Throwable $e) {
      Log::error('Gagal menyimpan pegawai', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'data' => $data,
        'file' => $e->getFile(),
        'line' => $e->getLine()
      ]);
      return response()->json([
        'message' => 'Terjadi kesalahan saat menyimpan data pegawai: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Mengambil data untuk form edit.
   */
  public function edit(Pegawai $pegawai)
  {
      return response()->json($pegawai);
  }

  /**
   * Memperbarui data di database.
   */
  public function update(Request $request, Pegawai $pegawai)
  {
    $validator = Validator::make($request->all(), [
      'ni_pegawai' => 'required|string|min:10|max:18|unique:pegawai,ni_pegawai,' . $pegawai->id_pegawai . ',id_pegawai|regex:/^[0-9]+$/',
      'nama_pegawai' => 'required|string|min:3|max:255|regex:/^[A-Za-zÀ-ÖØ-öø-ÿ\'.,\-\s]+$/',
      'nama_jabatan_pegawai' => 'required|string|min:1|max:50|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
      'id_jabatan' => 'required|exists:jabatan,id_jabatan',
      'plt_pegawai' => 'required|in:0,1',
      'no_telp_pegawai' => 'required|string|max:100|regex:/^[0-9+\-\s()]+$/',
      'tempat_lahir_pegawai' => 'required|string|min:2|max:100|regex:/^[A-Za-zÀ-ÖØ-öø-ÿ\'\.\-\s]+$/',
      'tanggal_lahir_pegawai' => 'required|date|before:today',
      'jk_pegawai' => 'required|in:L,P',
      'alamat_pegawai' => 'required|string|min:10|max:255|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
      'alamat_domisili_pegawai' => 'required|string|min:10|max:255|regex:/^[A-Za-z0-9À-ÖØ-öø-ÿ\'.,()\/\-\s]+$/',
      'id_pangkat' => 'required|exists:pangkat,id_pangkat',
      'id_golongan' => 'required|exists:golongan,id_golongan',
      'id_eselon' => 'required|exists:eselon,id_eselon',
      'foto_pegawai' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
      'status_pegawai' => 'required|in:Aktif,Nonaktif',
    ], [
      'ni_pegawai.required' => 'Nomor Induk Pegawai wajib diisi.',
      'ni_pegawai.min' => 'Nomor Induk Pegawai minimal 10 karakter.',
      'ni_pegawai.max' => 'Nomor Induk Pegawai maksimal 18 karakter.',
      'ni_pegawai.unique' => 'Nomor Induk Pegawai sudah terdaftar.',
      'ni_pegawai.regex' => 'Nomor Induk Pegawai hanya boleh berisi angka.',
      'nama_pegawai.required' => 'Nama Lengkap wajib diisi.',
      'nama_pegawai.min' => 'Nama Lengkap minimal 3 karakter.',
      'nama_pegawai.max' => 'Nama Lengkap maksimal 255 karakter.',
      'nama_pegawai.regex' => 'Nama hanya boleh huruf, spasi, titik, koma, apostrof, dan tanda minus.',
      'nama_jabatan_pegawai.required' => 'Nama Jabatan wajib diisi.',
      'nama_jabatan_pegawai.min' => 'Nama Jabatan minimal 1 karakter.',
      'nama_jabatan_pegawai.max' => 'Nama Jabatan maksimal 50 karakter.',
      'nama_jabatan_pegawai.regex' => 'Nama jabatan hanya boleh huruf/angka dan tanda . , ( ) / -',
      'id_jabatan.required' => 'Jabatan wajib dipilih.',
      'id_jabatan.exists' => 'Jabatan yang dipilih tidak valid.',
      'plt_pegawai.required' => 'Status PLT wajib dipilih.',
      'plt_pegawai.in' => 'Status PLT tidak valid.',
      'no_telp_pegawai.required' => 'Nomor Telepon wajib diisi.',
      'no_telp_pegawai.max' => 'Nomor Telepon maksimal 100 karakter.',
      'no_telp_pegawai.regex' => 'Format Nomor Telepon tidak valid.',
      'tempat_lahir_pegawai.required' => 'Tempat Lahir wajib diisi.',
      'tempat_lahir_pegawai.min' => 'Tempat Lahir minimal 2 karakter.',
      'tempat_lahir_pegawai.max' => 'Tempat Lahir maksimal 100 karakter.',
      'tempat_lahir_pegawai.regex' => 'Tempat lahir hanya boleh huruf, spasi, titik, apostrof, dan tanda minus.',
      'tanggal_lahir_pegawai.required' => 'Tanggal Lahir wajib diisi.',
      'tanggal_lahir_pegawai.date' => 'Format Tanggal Lahir tidak valid.',
      'tanggal_lahir_pegawai.before' => 'Tanggal Lahir harus sebelum hari ini.',
      'jk_pegawai.required' => 'Jenis Kelamin wajib dipilih.',
      'jk_pegawai.in' => 'Jenis Kelamin tidak valid.',
      'alamat_pegawai.required' => 'Alamat KTP wajib diisi.',
      'alamat_pegawai.min' => 'Alamat KTP minimal 10 karakter.',
      'alamat_pegawai.max' => 'Alamat KTP maksimal 255 karakter.',
      'alamat_pegawai.regex' => 'Alamat hanya boleh huruf/angka dan tanda . , ( ) / -',
      'alamat_domisili_pegawai.required' => 'Alamat Domisili wajib diisi.',
      'alamat_domisili_pegawai.min' => 'Alamat Domisili minimal 10 karakter.',
      'alamat_domisili_pegawai.max' => 'Alamat Domisili maksimal 255 karakter.',
      'alamat_domisili_pegawai.regex' => 'Alamat hanya boleh huruf/angka dan tanda . , ( ) / -',
      'id_pangkat.required' => 'Pangkat wajib dipilih.',
      'id_pangkat.exists' => 'Pangkat yang dipilih tidak valid.',
      'id_golongan.required' => 'Golongan wajib dipilih.',
      'id_golongan.exists' => 'Golongan yang dipilih tidak valid.',
      'id_eselon.required' => 'Eselon wajib dipilih.',
      'id_eselon.exists' => 'Eselon yang dipilih tidak valid.',
      'foto_pegawai.image' => 'File harus berupa gambar.',
      'foto_pegawai.mimes' => 'Format gambar harus jpeg, png, jpg, atau gif.',
      'foto_pegawai.max' => 'Ukuran gambar maksimal 2MB.',
      'status_pegawai.required' => 'Status Pegawai wajib dipilih.',
      'status_pegawai.in' => 'Status Pegawai tidak valid.'
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $data = $request->except('foto_pegawai');
    // nama_jabatan_pegawai adalah kolom asli di tabel pegawai, jadi tidak perlu di-unset

    if ($request->hasFile('foto_pegawai')) {
        $file = $request->file('foto_pegawai');
        Log::info('Update - Foto file received:', [
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType()
        ]);
        // (Opsional: Hapus file lama jika ada)
        if ($pegawai->foto_pegawai) {
            Storage::delete($pegawai->foto_pegawai);
        }
        $path = $file->store('public/pegawai_fotos');
        $data['foto_pegawai'] = $path; // Simpan path relatif, bukan URL lengkap
        Log::info('Update - Foto stored at:', ['path' => $path]);
    } else {
        Log::info('Update - No foto file in request');
    }

    try {
      Log::info('Updating pegawai with data:', $data);
      $pegawai->update($data);
      Log::info('Pegawai updated successfully');
      return response()->json(['success' => 'Data pegawai berhasil diperbarui.']);
    } catch (\Throwable $e) {
      Log::error('Gagal memperbarui pegawai', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'data' => $data,
        'id' => $pegawai->id_pegawai,
        'file' => $e->getFile(),
        'line' => $e->getLine()
      ]);
      return response()->json([
        'message' => 'Terjadi kesalahan saat memperbarui data pegawai: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Menghapus data dari database.
   */
  public function destroy(Pegawai $pegawai)
  {
    try {
      $pegawai->delete();
      return response()->json(['success' => 'Data pegawai berhasil dihapus.']);
    } catch (\Exception $e) {
      return response()->json(['error' => 'Terjadi kesalahan saat menghapus data.'], 500);
    }
  }
}
