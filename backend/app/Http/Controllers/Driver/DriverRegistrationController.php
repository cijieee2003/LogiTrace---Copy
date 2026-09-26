<?php

namespace App\Http\Controllers\Driver;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\DriverVerificationNotification;

use Illuminate\Support\Str;
class DriverRegistrationController extends Controller
{
     public function registerDriver(Request $request)
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:255',
                'unique:users,username',
            ],

            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],
        ]);

        // Generate random password
        $temporaryPassword = Str::password(12);

        // Create driver account
        $driver = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $temporaryPassword,
            'role' => 'driver',
        ]);

        // Send verification email
        $driver->notify(
    new DriverVerificationNotification(
        $temporaryPassword
    )
);

        return response()->json([
            'success' => true,
            'message' => 'Driver registered successfully. Verification email sent.',
            'driver' => [
                'id' => $driver->id,
                'username' => $driver->username,
                'email' => $driver->email,
            ],
        ], 201);
    }

    /**
     * Get all drivers.
     */
    public function getDrivers()
    {
        $drivers = User::where('role', 'driver')
            ->select(
                'id',
                'username',
                'email',
                'email_verified_at',
                'created_at'
            )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'drivers' => $drivers,
        ]);
    }

    /**
     * Get one driver.
     */
    public function getDriver($id)
    {
        $driver = User::where('role', 'driver')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'driver' => $driver,
        ]);
    }

    /**
     * Update driver.
     */
    public function updateDriver(Request $request, $id)
    {
        $driver = User::where('role', 'driver')
            ->findOrFail($id);

        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:255',
                'unique:users,username,' . $driver->id,
            ],

            'email' => [
                'required',
                'email',
                'unique:users,email,' . $driver->id,
            ],
        ]);

        $driver->username = $validated['username'];
        $driver->email = $validated['email'];

        $driver->save();

        return response()->json([
            'success' => true,
            'message' => 'Driver updated successfully.',
            'driver' => $driver,
        ]);
    }

    /**
     * Delete driver.
     */
    public function deleteDriver($id)
    {
        $driver = User::where('role', 'driver')
            ->findOrFail($id);

        $driver->delete();

        return response()->json([
            'success' => true,
            'message' => 'Driver deleted successfully.',
        ]);
    }
}
