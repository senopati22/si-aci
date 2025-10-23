<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Eselon;

class EselonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $eselons = [
            ['nama_eselon' => 'Eselon I'],
            ['nama_eselon' => 'Eselon II'],
            ['nama_eselon' => 'Eselon III'],
            ['nama_eselon' => 'Eselon IV'],
            ['nama_eselon' => 'Eselon V'],
            ['nama_eselon' => 'Non Eselon'],
        ];

        foreach ($eselons as $eselon) {
            Eselon::create($eselon);
        }
    }
}
