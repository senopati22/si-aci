<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Golongan extends Model
{
    use HasFactory;

    protected $table = 'golongan';
    protected $primaryKey = 'id_golongan';
    public $timestamps = false; // Nonaktifkan jika tabel jabatan tidak punya created_at/updated_at

    protected $fillable = [
      'nama_golongan',
    ];

    /**
     * Gunakan 'id_golongan' untuk route model binding.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'id_golongan';
    }
}
