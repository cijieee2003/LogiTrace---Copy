<?php

namespace Database\Factories;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Staff>
 */
class StaffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $index = 0;

        $staff = [
            [
                'user_id' => 1,
                'assign' => 'superadmin',
            ],
            [
                'user_id' => 2,
                'assign' => 'admin',
            ],
            [
                'user_id' => 3,
                'assign' => 'staff',
            ],

            [
                'user_id' => 4,
                'assign' => 'driver',
            ],
        ];

        return $staff[$index++ % count($staff)];
    }
}