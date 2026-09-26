<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;

class PasswordController extends Controller
{
    /**
     * Driver changes password while logged in.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Check Authentication
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Driver Only
        |--------------------------------------------------------------------------
        */

        if ($user->role !== 'driver') {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Password
        |--------------------------------------------------------------------------
        */

        $validator = Validator::make(
            $request->all(),
            [
                'current_password' => [
                    'required',
                    'string',
                ],

                'new_password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please check your password information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Current Password
        |--------------------------------------------------------------------------
        */

        if (!Hash::check(
            $request->current_password,
            $user->password
        )) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Same Password
        |--------------------------------------------------------------------------
        */

        if (Hash::check(
            $request->new_password,
            $user->password
        )) {
            return response()->json([
                'message' => 'Your new password must be different from your current password.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Change Password
        |--------------------------------------------------------------------------
        */

        $user->password = Hash::make(
            $request->new_password
        );

        /*
        |--------------------------------------------------------------------------
        | Mark Driver Onboarding Password Step Complete
        |--------------------------------------------------------------------------
        */

        $user->password_changed = true;

        $user->save();

        /*
        |--------------------------------------------------------------------------
        | Refresh User
        |--------------------------------------------------------------------------
        */

        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',

            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'profile_completed' => $user->profile_completed,
                'password_changed' => $user->password_changed,
            ],
        ], 200);
    }


    /**
     * Reset password using the email reset token.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'token' => [
                    'required',
                    'string',
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
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please check your information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::broker()->reset(
            [
                'email' => $request->email,
                'password' => $request->password,
                'password_confirmation' =>
                    $request->password_confirmation,
                'token' => $request->token,
            ],
            function ($user, $password) {

                $user->password = Hash::make($password);

                $user->save();

                // Revoke existing Sanctum tokens.
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'message' => 'Password reset successfully.',
        ]);
    }
}