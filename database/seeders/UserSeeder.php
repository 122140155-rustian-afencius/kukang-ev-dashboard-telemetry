<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@kukangev.com'],
            [
                'name' => 'Admin Kukang EV',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
    }
}

