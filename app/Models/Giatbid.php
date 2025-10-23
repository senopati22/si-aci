<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Giatbid extends Model
{
    use HasFactory;

    protected $table = 'kegiatan_bidang';
    protected $primaryKey = 'id_kegiatan';
    public $timestamps = false;

    // Fillable Anda sudah benar
    protected $fillable = [
        'nama_kegiatan',
        'tgl_kegiatan',
        'tempat_kegiatan',
        'waktu_kegiatan',
        'bidang_kegiatan',
        'jumlah_peserta_kegiatan',
        'pj_acara_kegiatan',
        'pj_sarpras_kegiatan',
        'pj_mc_kegiatan',
        'pj_konsumsi_kegiatan',
        'pj_dokumentasi_kegiatan',
        'anggaran_kegiatan',
        'status_apbd_kegiatan'
    ];

    public function getRouteKeyName()
    {
        return 'id_kegiatan';
    }

    // --- RELASI PENANGGUNG JAWAB ---
    // Ganti relasi pegawai() yang lama dengan 5 relasi ini

    public function pjAcara()
    {
        return $this->belongsTo(Pegawai::class, 'pj_acara_kegiatan', 'id_pegawai');
    }

    public function pjSarpras()
    {
        return $this->belongsTo(Pegawai::class, 'pj_sarpras_kegiatan', 'id_pegawai');
    }

    public function pjMc()
    {
        return $this->belongsTo(Pegawai::class, 'pj_mc_kegiatan', 'id_pegawai');
    }

    public function pjKonsumsi()
    {
        return $this->belongsTo(Pegawai::class, 'pj_konsumsi_kegiatan', 'id_pegawai');
    }

    public function pjDokumentasi()
    {
        return $this->belongsTo(Pegawai::class, 'pj_dokumentasi_kegiatan', 'id_pegawai');
    }
}
