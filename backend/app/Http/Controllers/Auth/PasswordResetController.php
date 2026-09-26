<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;

class PasswordResetController extends Controller
{
    /**
     * Send password reset email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => [
                'required',
                'email',
            ],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link has been sent to your email.',
            ]);
        }

        return response()->json([
            'message' => __($status),
        ], 422);
    }


    /**
     * Reset password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => [
                'required',
            ],

            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $status = Password::reset(
            $request->only(
                'email',
                'password',
                'password_confirmation',
                'token'
            ),
            function (User $user, string $password) {

                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password has been reset successfully.',
            ]);
        }

        return response()->json([
            'message' => __($status),
        ], 422);
    }


    /**
     * Admin sends password reset link to a driver.
     */
    public function adminResetDriverPassword(
        Request $request,
        $driverId
    ) {
        $admin = $request->user();

        if (!in_array($admin->role, [
            'admin',
            'superadmin',
        ])) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $driver = User::where('id', $driverId)
            ->where('role', 'driver')
            ->first();

        if (!$driver) {
            return response()->json([
                'message' => 'Driver not found.',
            ], 404);
        }

        $status = Password::sendResetLink([
            'email' => $driver->email,
        ]);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' =>
                    'Password reset link has been sent to the driver email.',
            ]);
        }

        return response()->json([
            'message' => __($status),
        ], 422);
    }
}