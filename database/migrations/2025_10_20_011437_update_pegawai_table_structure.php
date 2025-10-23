<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            // Ubah nama kolom jika ada nama_jabatan menjadi nama_jabatan_pegawai
            if (Schema::hasColumn('pegawai', 'nama_jabatan')) {
                $table->renameColumn('nama_jabatan', 'nama_jabatan_pegawai');
            }

            // Pastikan kolom ada dengan tipe yang benar
            if (!Schema::hasColumn('pegawai', 'nama_jabatan_pegawai')) {
                $table->string('nama_jabatan_pegawai', 50)->after('nama_pegawai');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            if (Schema::hasColumn('pegawai', 'nama_jabatan_pegawai')) {
                $table->renameColumn('nama_jabatan_pegawai', 'nama_jabatan');
            }
        });
    }
};
