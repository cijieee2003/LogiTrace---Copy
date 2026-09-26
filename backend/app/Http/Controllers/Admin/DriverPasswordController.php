<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use App\Notifications\DriverPasswordResetNotification;
use Illuminate\Support\Str;

class DriverPasswordController extends Controller
{
    /**
     * Admin requests a password reset email for a driver.
     */
    public function sendResetLink(
        Request $request,
        int $driverId
    ) {
        $admin = $request->user();

        if (!in_array($admin->role, ['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $driver = User::where('id', $driverId)
            ->where('role', 'driver')
            ->first();

        if (!$driver) {
            return response()->json([
                'message' => 'Driver not found.'
            ], 404);
        }

        if (!$driver->email) {
            return response()->json([
                'message' => 'This driver does not have an email address.'
            ], 422);
        }

        $status = Password::broker()->sendResetLink([
            'email' => $driver->email,
        ]);

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Password reset link has been sent to the driver email.'
        ]);

        
    }

     public function resetPassword(Request $request, $id)
    {
        // Get currently logged-in user
        $admin = $request->user();

        // Only admin and superadmin can reset driver passwords
        if (!in_array($admin->role, ['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        // Find the driver
        $driver = User::where('id', $id)
            ->where('role', 'driver')
            ->first();

        // Driver does not exist
        if (!$driver) {
            return response()->json([
                'message' => 'Driver not found.'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Generate random password
        |--------------------------------------------------------------------------
        */

        $newPassword = $this->generatePassword();

        /*
        |--------------------------------------------------------------------------
        | Update password
        |--------------------------------------------------------------------------
        |
        | Your User model has:
        |
        | 'password' => 'hashed'
        |
        | Therefore Laravel automatically hashes this password.
        |
        */

        $driver->password = $newPassword;

        $driver->save();

        /*
        |--------------------------------------------------------------------------
        | Send new password to driver's email
        |--------------------------------------------------------------------------
        */

        $driver->notify(
            new DriverPasswordResetNotification(
                $driver->username,
                $newPassword
            )
        );

        //  $driver->notify(
        //     new DriverPasswordResetNotification($newPassword)
        // );

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Driver password has been reset successfully. A new password has been sent to the driver\'s email.',
        ], 200);
    }

    /**
     * Generate a secure random password.
     */
    private function generatePassword(): string
    {
        return Str::password(
            length: 12,
            letters: true,
            numbers: true,
            symbols: true,
            spaces: false
        );
    }
}