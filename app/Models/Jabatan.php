<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    use HasFactory;

    protected $table = 'jabatan';
    protected $primaryKey = 'id_jabatan';
    public $timestamps = false; // Nonaktifkan jika tabel jabatan tidak punya created_at/updated_at

    protected $fillable = [
      'nama_jabatan',
    ];

    /**
     * Gunakan 'id_jabatan' untuk route model binding.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'id_jabatan';
    }
}
