<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(SuperAdminSeeder::class);
        
        $user = \App\Models\User::factory()->create([
            'name' => 'Anil Bhattarai',
            'email' => 'editor@neptechnews.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'chief_editor'
        ]);

        // Don't create random categories and articles because SuperAdminSeeder already creates categories and news:sync creates articles.
    }
}
