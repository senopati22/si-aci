<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pangkat extends Model
{
    use HasFactory;

    protected $table = 'pangkat';
    protected $primaryKey = 'id_pangkat';
    public $timestamps = false; // Nonaktifkan jika tabel jabatan tidak punya created_at/updated_at

    protected $fillable = [
      'nama_pangkat',
    ];

    /**
     * Gunakan 'id_jabatan' untuk route model binding.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'id_pangkat';
    }
}
