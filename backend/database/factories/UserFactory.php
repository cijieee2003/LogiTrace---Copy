<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password = null;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $index = 0;

        $users = [
            [
                'username' => 'LogitraceSuperadmin',
                'email' => 'superadmin@logitrace.com',
                'role' => 'superadmin',
                'password' => Hash::make('password123'),
            ],
            [
                'username' => 'LogitraceAdmin',
                'email' => 'admin@logitrace.com',
                'role' => 'admin',
                'password' => Hash::make('password123'),
            ],
            [
                'username' => 'LogitraceStaff',
                'email' => 'staff@logitrace.com',
                'role' => 'staff',
                'password' => Hash::make('password123'),
            ],

            // [
            //     'username' => 'LogitraceDriver',
            //     'email' => 'driver@logitrace.com',
            //     'role' => 'driver',
            //     'password' => Hash::make('password123'),
            // ],
        ];

        return $users[$index++ % count($users)];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}