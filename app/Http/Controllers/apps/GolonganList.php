<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Golongan;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class GolonganList extends Controller
{
    /**
     * Menampilkan halaman daftar golongan.
     */
    public function index()
    {
        // Langsung tampilkan view, tidak perlu data tambahan
        return view('content.apps.app-golongan-list');
    }

    /**
     * Menyediakan data untuk DataTables
     */
    public function data()
    {
        $golongan = Golongan::select(['id_golongan', 'nama_golongan']); // Hanya butuh 2 kolom

        return DataTables::of($golongan)
            ->addIndexColumn() // Tambah kolom nomor (DT_RowIndex)
            ->addColumn('action', function ($row) {
                // Tombol aksi yang sama persis dengan pegawai
                $editBtn = '<a href="javascript:void(0)" data-id="' . $row->id_golongan . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect edit-btn" data-bs-toggle="tooltip" title="Edit"><i class="ri-edit-box-line ri-20px"></i></a>';
                $deleteBtn = '<a href="javascript:void(0)" data-id="' . $row->id_golongan . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-btn" data-bs-toggle="tooltip" title="Hapus"><i class="ri-delete-bin-7-line ri-20px"></i></a>';
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
        // Validasi sederhana untuk nama_golongan
        $validator = Validator::make($request->all(), [
            'nama_golongan' => 'required|string|max:50|unique:golongan,nama_golongan|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_golongan.required' => 'Nama golongan wajib diisi.',
            'nama_golongan.max' => 'Nama golongan maksimal 50 karakter.',
            'nama_golongan.unique' => 'Nama golongan sudah terdaftar.',
            'nama_golongan.regex' => 'Nama golongan hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Golongan::create($request->all());
            return response()->json(['success' => 'Data golongan berhasil ditambahkan.']);
        } catch (\Throwable $e) {
            Log::error('Gagal menyimpan golongan', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data golongan.'], 500);
        }
    }

    /**
     * Mengambil data untuk form edit.
     * Menggunakan Route-Model Binding (golongan $golongan)
     */
    public function edit(Golongan $golongan)
    {
        return response()->json($golongan); // Kembalikan data golongan sebagai JSON
    }

    /**
     * Memperbarui data di database.
     * Menggunakan Route-Model Binding (golongan $golongan)
     */
    public function update(Request $request, Golongan $golongan)
    {
        // Validasi dengan pengecualian untuk ID saat ini
        $validator = Validator::make($request->all(), [
            'nama_golongan' => 'required|string|max:50|unique:golongan,nama_golongan,' . $golongan->id_golongan . ',id_golongan|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_golongan.required' => 'Nama golongan wajib diisi.',
            'nama_golongan.max' => 'Nama golongan maksimal 50 karakter.',
            'nama_golongan.unique' => 'Nama golongan sudah terdaftar.',
            'nama_golongan.regex' => 'Nama golongan hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $golongan->update($request->all());
            return response()->json(['success' => 'Data golongan berhasil diperbarui.']);
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui golongan', ['error' => $e->getMessage(), 'id' => $golongan->id_golongan]);
            return response()->json(['message' => 'Terjadi kesalahan saat memperbarui data golongan.'], 500);
        }
    }

    /**
     * Menghapus data dari database.
     * Menggunakan Route-Model Binding (golongan $golongan)
     */
    public function destroy(Golongan $golongan)
    {
        try {
            $golongan->delete();
            return response()->json(['success' => 'Data golongan berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Gagal menghapus golongan', ['error' => $e->getMessage(), 'id' => $golongan->id_golongan]);
            return response()->json(['error' => 'Terjadi kesalahan saat menghapus data.'], 500);
        }
    }
}
