<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class Userlist extends Controller
{
  public function index()
  {
    $pegawais = Pegawai::where('status_pegawai', 'Aktif')
                        ->orderBy('nama_pegawai')
                        ->get(['id_pegawai', 'nama_pegawai']);

    return view('content.apps.app-user-list', compact('pegawais'));
  }

  public function data()
  {
    $pegawai = User::select([
        'user.*',
        // Tambahkan alias 'as' agar DataTables tidak bingung
        'pegawai.nama_pegawai as nama_pegawai'
    ])
    ->leftJoin('pegawai', 'user.id_pegawai', '=', 'pegawai.id_pegawai');

    return DataTables::of($pegawai)
        ->addIndexColumn()
        ->addColumn('action', function ($row) {
            $editBtn = '<a href="javascript:void(0)" data-id="' . $row->id_user . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect edit-btn" data-bs-toggle="tooltip" title="Edit"><i class="ri-edit-box-line ri-20px"></i></a>';
            $deleteBtn = '<a href="javascript:void(0)" data-id="' . $row->id_user . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-btn" data-bs-toggle="tooltip" title="Hapus"><i class="ri-delete-bin-7-line ri-20px"></i></a>';
            return '<div class="d-flex align-items-center">' . $editBtn . $deleteBtn . '</div>';
        })
        ->filterColumn('nama_pegawai', function($query, $keyword) {
            $query->where('pegawai.nama_pegawai', 'like', "%{$keyword}%");
        })
        ->rawColumns(['action'])
        ->make(true);
  }

  public function store(Request $request)
  {
      // Validasi data baru
      $validator = Validator::make($request->all(), [
        'username' => [
          'required',
          'string',
          'max:255',
          'unique:users,username',
          'regex:/^[A-Za-z0-9_.-]+$/'
        ],
        'password' => [
          'required',
          'string',
          'min:8',
          'max:255',
          // Minimal 8 karakter, ada huruf besar, kecil, angka, dan simbol
          'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/'
        ],
        'id_pegawai' => [
          'nullable',
          'integer',
          'exists:pegawai,id_pegawai'
        ],
        'id_role' => [
          'required',
          'integer',
          'exists:roles,id_role'
        ],
        'remember_token' => [
          'nullable',
          'string',
          'max:255'
        ],
        'failed_attempts' => [
          'nullable',
          'integer',
          'min:0'
        ],
        'active' => [
          'required',
          'integer',
          'in:0,1' // 0 = nonaktif, 1 = aktif
        ],
        'last_attempt' => [
          'nullable',
          'date'
        ],
      ], [
        'username.required' => 'Username wajib diisi.',
        'username.unique' => 'Username sudah digunakan.',
        'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, garis bawah, atau strip.',

        'password.required' => 'Password wajib diisi.',
        'password.min' => 'Password minimal 8 karakter.',
        'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol spesial.',

        'id_role.required' => 'Role wajib dipilih.',
        'id_role.exists' => 'Role yang dipilih tidak ditemukan.',
        'id_pegawai.exists' => 'Pegawai yang dipilih tidak ditemukan.',
        'active.in' => 'Status aktif hanya boleh Non-Aktif atau Aktif.',
      ]);

      if ($validator->fails()) {
          return response()->json(['errors' => $validator->errors()], 422);
      }

      try {
          // Simpan data
          User::create($request->all());
          return response()->json(['success' => 'Data user berhasil ditambahkan.']);

      } catch (\Throwable $e) {
          Log::error('Gagal menyimpan kegiatan', ['error' => $e->getMessage()]);
          return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data.'], 500);
      }
  }
}
