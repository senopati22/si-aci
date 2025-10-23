<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Eselon; // Gunakan model Eselon
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class EselonList extends Controller
{
    /**
     * Menampilkan halaman daftar Eselon.
     */
    public function index()
    {
        // Langsung tampilkan view, tidak perlu data tambahan
        return view('content.apps.app-eselon-list');
    }

    /**
     * Menyediakan data untuk DataTables
     */
    public function data()
    {
        $eselon = Eselon::select(['id_eselon', 'nama_eselon']); // Hanya butuh 2 kolom

        return DataTables::of($eselon)
            ->addIndexColumn() // Tambah kolom nomor (DT_RowIndex)
            ->addColumn('action', function ($row) {
                // Tombol aksi yang sama persis dengan pegawai
                $editBtn = '<a href="javascript:void(0)" data-id="' . $row->id_eselon . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect edit-btn" data-bs-toggle="tooltip" title="Edit"><i class="ri-edit-box-line ri-20px"></i></a>';
                $deleteBtn = '<a href="javascript:void(0)" data-id="' . $row->id_eselon . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-btn" data-bs-toggle="tooltip" title="Hapus"><i class="ri-delete-bin-7-line ri-20px"></i></a>';
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
        // Validasi sederhana untuk nama_eselon
        $validator = Validator::make($request->all(), [
            'nama_eselon' => 'required|string|max:50|unique:eselon,nama_eselon|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_eselon.required' => 'Nama Eselon wajib diisi.',
            'nama_eselon.max' => 'Nama Eselon maksimal 50 karakter.',
            'nama_eselon.unique' => 'Nama Eselon sudah terdaftar.',
            'nama_eselon.regex' => 'Nama Eselon hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Eselon::create($request->all());
            return response()->json(['success' => 'Data eselon berhasil ditambahkan.']);
        } catch (\Throwable $e) {
            Log::error('Gagal menyimpan eselon', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data eselon.'], 500);
        }
    }

    /**
     * Mengambil data untuk form edit.
     * Menggunakan Route-Model Binding (Eselon $eselon)
     */
    public function edit(Eselon $eselon)
    {
        return response()->json($eselon); // Kembalikan data eselon sebagai JSON
    }

    /**
     * Memperbarui data di database.
     * Menggunakan Route-Model Binding (Eselon $eselon)
     */
    public function update(Request $request, Eselon $eselon)
    {
        // Validasi dengan pengecualian untuk ID saat ini
        $validator = Validator::make($request->all(), [
            'nama_eselon' => 'required|string|max:50|unique:eselon,nama_eselon,' . $eselon->id_eselon . ',id_eselon|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_eselon.required' => 'Nama Eselon wajib diisi.',
            'nama_eselon.max' => 'Nama Eselon maksimal 50 karakter.',
            'nama_eselon.unique' => 'Nama Eselon sudah terdaftar.',
            'nama_eselon.regex' => 'Nama Eselon hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $eselon->update($request->all());
            return response()->json(['success' => 'Data eselon berhasil diperbarui.']);
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui eselon', ['error' => $e->getMessage(), 'id' => $eselon->id_eselon]);
            return response()->json(['message' => 'Terjadi kesalahan saat memperbarui data eselon.'], 500);
        }
    }

    /**
     * Menghapus data dari database.
     * Menggunakan Route-Model Binding (Eselon $eselon)
     */
    public function destroy(Eselon $eselon)
    {
        try {
            $eselon->delete();
            return response()->json(['success' => 'Data eselon berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Gagal menghapus eselon', ['error' => $e->getMessage(), 'id' => $eselon->id_eselon]);
            return response()->json(['error' => 'Terjadi kesalahan saat menghapus data.'], 500);
        }
    }
}
