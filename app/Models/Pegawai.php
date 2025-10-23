<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    use HasFactory;

    protected $table = 'pegawai';
    protected $primaryKey = 'id_pegawai';
    public $timestamps = false;

    // Tambahkan semua ID relasi dan field form ke $fillable
    protected $fillable = [
        'ni_pegawai',
        'nama_pegawai',
        'nama_jabatan_pegawai',
        'id_jabatan',
        'plt_pegawai',
        'no_telp_pegawai',
        'tempat_lahir_pegawai',
        'tanggal_lahir_pegawai',
        'jk_pegawai',
        'alamat_pegawai',
        'alamat_domisili_pegawai',
        'id_pangkat',
        'id_golongan',
        'id_eselon',
        'foto_pegawai',
        'status_pegawai',
    ];

    /**
    * Get the route key for the model.
    *
    * @return string
    */
    public function getRouteKeyName()
    {
        return 'id_pegawai';
    }

    // --- TAMBAHKAN RELASI INI ---
    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class, 'id_jabatan', 'id_jabatan');
    }

    public function pangkat()
    {
        return $this->belongsTo(Pangkat::class, 'id_pangkat', 'id_pangkat');
    }

    public function golongan()
    {
        return $this->belongsTo(Golongan::class, 'id_golongan', 'id_golongan');
    }

    public function eselon()
    {
        return $this->belongsTo(Eselon::class, 'id_eselon', 'id_eselon');
    }
}
