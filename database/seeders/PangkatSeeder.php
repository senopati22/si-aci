<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Pangkat;

class PangkatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pangkats = [
            ['nama_pangkat' => 'Pembina Utama Muda'],
            ['nama_pangkat' => 'Pembina Utama Madya'],
            ['nama_pangkat' => 'Pembina Utama'],
            ['nama_pangkat' => 'Pembina Tingkat I'],
            ['nama_pangkat' => 'Pembina'],
            ['nama_pangkat' => 'Penata Muda Tingkat I'],
            ['nama_pangkat' => 'Penata Muda'],
            ['nama_pangkat' => 'Penata Tingkat I'],
            ['nama_pangkat' => 'Penata'],
        ];

        foreach ($pangkats as $pangkat) {
            Pangkat::create($pangkat);
        }
    }
}
