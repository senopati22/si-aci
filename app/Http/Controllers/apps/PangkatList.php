<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pangkat;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PangkatList extends Controller
{
    /**
     * Menampilkan halaman daftar pangkat.
     */
    public function index()
    {
        // Langsung tampilkan view, tidak perlu data tambahan
        return view('content.apps.app-pangkat-list');
    }

    /**
     * Menyediakan data untuk DataTables
     */
    public function data()
    {
        $pangkat = Pangkat::select(['id_pangkat', 'nama_pangkat']); // Hanya butuh 2 kolom

        return DataTables::of($pangkat)
            ->addIndexColumn() // Tambah kolom nomor (DT_RowIndex)
            ->addColumn('action', function ($row) {
                // Tombol aksi yang sama persis dengan pegawai
                $editBtn = '<a href="javascript:void(0)" data-id="' . $row->id_pangkat . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect edit-btn" data-bs-toggle="tooltip" title="Edit"><i class="ri-edit-box-line ri-20px"></i></a>';
                $deleteBtn = '<a href="javascript:void(0)" data-id="' . $row->id_pangkat . '" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-btn" data-bs-toggle="tooltip" title="Hapus"><i class="ri-delete-bin-7-line ri-20px"></i></a>';
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
        // Validasi sederhana untuk nama_pangkat
        $validator = Validator::make($request->all(), [
            'nama_pangkat' => 'required|string|max:50|unique:pangkat,nama_pangkat|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_pangkat.required' => 'Nama pangkat wajib diisi.',
            'nama_pangkat.max' => 'Nama pangkat maksimal 50 karakter.',
            'nama_pangkat.unique' => 'Nama pangkat sudah terdaftar.',
            'nama_pangkat.regex' => 'Nama pangkat hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Pangkat::create($request->all());
            return response()->json(['success' => 'Data pangkat berhasil ditambahkan.']);
        } catch (\Throwable $e) {
            Log::error('Gagal menyimpan pangkat', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data pangkat.'], 500);
        }
    }

    /**
     * Mengambil data untuk form edit.
     * Menggunakan Route-Model Binding (pangkat $pangkat)
     */
    public function edit(Pangkat $pangkat)
    {
        return response()->json($pangkat); // Kembalikan data pangkat sebagai JSON
    }

    /**
     * Memperbarui data di database.
     * Menggunakan Route-Model Binding (pangkat $pangkat)
     */
    public function update(Request $request, Pangkat $pangkat)
    {
        // Validasi dengan pengecualian untuk ID saat ini
        $validator = Validator::make($request->all(), [
            'nama_pangkat' => 'required|string|max:50|unique:pangkat,nama_pangkat,' . $pangkat->id_pangkat . ',id_pangkat|regex:/^[A-Za-z0-9\s\/\-\.]+$/'
        ], [
            'nama_pangkat.required' => 'Nama pangkat wajib diisi.',
            'nama_pangkat.max' => 'Nama pangkat maksimal 50 karakter.',
            'nama_pangkat.unique' => 'Nama pangkat sudah terdaftar.',
            'nama_pangkat.regex' => 'Nama pangkat hanya boleh berisi huruf, angka, spasi, titik, minus, dan slash.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $pangkat->update($request->all());
            return response()->json(['success' => 'Data pangkat berhasil diperbarui.']);
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui pangkat', ['error' => $e->getMessage(), 'id' => $pangkat->id_pangkat]);
            return response()->json(['message' => 'Terjadi kesalahan saat memperbarui data pangkat.'], 500);
        }
    }

    /**
     * Menghapus data dari database.
     * Menggunakan Route-Model Binding (pangkat $pangkat)
     */
    public function destroy(Pangkat $pangkat)
    {
        try {
            $pangkat->delete();
            return response()->json(['success' => 'Data pangkat berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Gagal menghapus pangkat', ['error' => $e->getMessage(), 'id' => $pangkat->id_pangkat]);
            return response()->json(['error' => 'Terjadi kesalahan saat menghapus data.'], 500);
        }
    }
}
