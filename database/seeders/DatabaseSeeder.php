<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    // Seed master data
    $this->call([
      JabatanSeeder::class,
      PangkatSeeder::class,
      GolonganSeeder::class,
      EselonSeeder::class,
    ]);

    // Seed users (commented out due to table structure issues)
    // User::factory(10)->create();

    // User::factory()->create([
    //   'name' => 'Test User',
    //   'email' => 'test@example.com',
    // ]);
  }
}
