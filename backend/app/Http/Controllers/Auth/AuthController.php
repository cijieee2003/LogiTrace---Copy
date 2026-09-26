<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => ['required'],
            'password' => ['required'],
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Driver Email Verification
        |--------------------------------------------------------------------------
        |
        | Drivers must verify their email before they are allowed to log in.
        |
        */
        if ($user->role === 'driver' && !$user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Sanctum Token
        |--------------------------------------------------------------------------
        */

        $token = $user->createToken('token')->plainTextToken;

        /*
        |--------------------------------------------------------------------------
        | Login Response
        |--------------------------------------------------------------------------
        |
        | profile_completed:
        | false = driver must complete their profile
        |
        | password_changed:
        | false = driver must change their temporary password
        |
        */

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $token,

            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,

                'email_verified_at' => $user->email_verified_at,

                // Driver onboarding status
                'profile_completed' => $user->profile_completed,
                'password_changed' => $user->password_changed,
            ],
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->noContent();
    }
}