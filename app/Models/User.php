<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'user'; // nama tabel (karena singular)
    protected $primaryKey = 'id_user'; // primary key kustom
    public $timestamps = true; // karena kamu punya created_at & updated_at

    protected $fillable = [
        'username',
        'password',
        'id_pegawai',
        'id_role',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'active' => 'boolean',
            'last_attempt' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'id_pegawai', 'id_pegawai');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }
}
