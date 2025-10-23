<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Jabatan;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jabatans = [
            ['nama_jabatan' => 'Kepala Dinas'],
            ['nama_jabatan' => 'Sekretaris Dinas'],
            ['nama_jabatan' => 'Kepala Bidang'],
            ['nama_jabatan' => 'Kepala Seksi'],
            ['nama_jabatan' => 'Staff'],
            ['nama_jabatan' => 'Kepala Bagian'],
            ['nama_jabatan' => 'Kepala Sub Bagian'],
        ];

        foreach ($jabatans as $jabatan) {
            Jabatan::create($jabatan);
        }
    }
}
