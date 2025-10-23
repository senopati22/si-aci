<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Jabatan;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class JabatanList extends Controller
{
    /**
     * Menampilkan halaman daftar jabatan.
     */
    public function index()
    {
        // Langsung tampilkan view, tidak perlu data tambahan
        return view('content.apps.app-jabatan-list');
    }

    /**
     * Menyediakan data untuk DataTables
     */
    public function data()
    {
        $jabatan = Jabatan::select(['id_jabatan', 'nama_jabatan']); // Hanya butuh 2 kolom

        return DataTables::of($jabatan)
            ->addIndexColumn() // Tambah kolom nomor (DT_RowIndex)
            ->addColumn('action', function ($row) {
                // Tombol aksi yang sama persis dengan pegawai
                $editBtn = '<a href="javascript:void(0)" data-id="' . $row->id_jabatan . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect edit-btn" data-bs-toggle="tooltip" title="Edit"><i class="ri-edit-box-line ri-20px"></i></a>';
                $deleteBtn = '<a href="javascript:void(0)" data-id="' . $row->id_jabatan . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-btn" data-bs-toggle="tooltip" title="Hapus"><i class="ri-delete-bin-7-line ri-20px"></i></a>';
                return '<div class="d-flex align-items-center">' . $editBtn . $deleteBtn . '</div>';
            })
            ->rawColumns(['action'])
            ->make(true);
    }

    /**
     * Menyimpan data baru ke database.
     */
    public function store(Request $request)
    {
        // Validasi sederhana untuk nama_jabatan
        $validator = Validator::make($request->all(), [
            'nama_jabatan' => 'required|string|max:50|unique:jabatan,nama_jabatan|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_jabatan.required' => 'Nama jabatan wajib diisi.',
            'nama_jabatan.max' => 'Nama jabatan maksimal 50 karakter.',
            'nama_jabatan.unique' => 'Nama jabatan sudah terdaftar.',
            'nama_jabatan.regex' => 'Nama jabatan hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Jabatan::create($request->all());
            return response()->json(['success' => 'Data jabatan berhasil ditambahkan.']);
        } catch (\Throwable $e) {
            Log::error('Gagal menyimpan jabatan', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data jabatan.'], 500);
        }
    }

    /**
     * Mengambil data untuk form edit.
     * Menggunakan Route-Model Binding (jabatan $jabatan)
     */
    public function edit(Jabatan $jabatan)
    {
        return response()->json($jabatan); // Kembalikan data jabatan sebagai JSON
    }

    /**
     * Memperbarui data di database.
     * Menggunakan Route-Model Binding (jabatan $jabatan)
     */
    public function update(Request $request, Jabatan $jabatan)
    {
        // Validasi dengan pengecualian untuk ID saat ini
        $validator = Validator::make($request->all(), [
            'nama_jabatan' => 'required|string|max:50|unique:jabatan,nama_jabatan,' . $jabatan->id_jabatan . ',id_jabatan|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_jabatan.required' => 'Nama jabatan wajib diisi.',
            'nama_jabatan.max' => 'Nama jabatan maksimal 50 karakter.',
            'nama_jabatan.unique' => 'Nama jabatan sudah terdaftar.',
            'nama_jabatan.regex' => 'Nama jabatan hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $jabatan->update($request->all());
            return response()->json(['success' => 'Data jabatan berhasil diperbarui.']);
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui jabatan', ['error' => $e->getMessage(), 'id' => $jabatan->id_jabatan]);
            return response()->json(['message' => 'Terjadi kesalahan saat memperbarui data jabatan.'], 500);
        }
    }

    /**
     * Menghapus data dari database.
     * Menggunakan Route-Model Binding (jabatan $jabatan)
     */
    public function destroy(Jabatan $jabatan)
    {
        try {
            $jabatan->delete();
            return response()->json(['success' => 'Data jabatan berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Gagal menghapus jabatan', ['error' => $e->getMessage(), 'id' => $jabatan->id_jabatan]);
            return response()->json(['error' => 'Terjadi kesalahan saat menghapus data.'], 500);
        }
    }
}
