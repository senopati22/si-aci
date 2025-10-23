<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Eselon extends Model
{
    use HasFactory;

    protected $table = 'eselon';
    protected $primaryKey = 'id_eselon';
    public $timestamps = false; // Nonaktifkan jika tabel jabatan tidak punya created_at/updated_at

    protected $fillable = [
        'nama_eselon',
    ];

    /**
     * Gunakan 'id_eselon' untuk route model binding.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'id_eselon';
    }
}
