<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
  use HasFactory, Notifiable;

  protected $table = 'user'; // Nama tabel singular
  protected $primaryKey = 'id_user'; // Primary key kustom

  protected $fillable = [
    'username', // Pastikan ini ada
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
      'password' => 'hashed'
    ];
  }
}
