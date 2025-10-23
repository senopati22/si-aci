<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Golongan;

class GolonganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $golongans = [
            ['nama_golongan' => 'IV/a'],
            ['nama_golongan' => 'IV/b'],
            ['nama_golongan' => 'IV/c'],
            ['nama_golongan' => 'IV/d'],
            ['nama_golongan' => 'IV/e'],
            ['nama_golongan' => 'III/a'],
            ['nama_golongan' => 'III/b'],
            ['nama_golongan' => 'III/c'],
            ['nama_golongan' => 'III/d'],
            ['nama_golongan' => 'II/a'],
            ['nama_golongan' => 'II/b'],
            ['nama_golongan' => 'II/c'],
            ['nama_golongan' => 'II/d'],
            ['nama_golongan' => 'I/a'],
            ['nama_golongan' => 'I/b'],
            ['nama_golongan' => 'I/c'],
            ['nama_golongan' => 'I/d'],
        ];

        foreach ($golongans as $golongan) {
            Golongan::create($golongan);
        }
    }
}
