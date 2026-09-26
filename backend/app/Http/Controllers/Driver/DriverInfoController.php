<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\DriverInfo;
use App\Models\User;
use Illuminate\Http\Request;

class DriverInfoController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET DRIVER INFORMATION
    |--------------------------------------------------------------------------
    |
    | Used by the logged-in driver.
    |
    | GET /api/driver/info
    |
    */

    public function getDriverInfo(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'driver') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $driverInfo = DriverInfo::where(
            'user_id',
            $user->id
        )->first();

        return response()->json([
            'user' => $user,
            'driver_info' => $driverInfo,
        ], 200);
    }


    /*
    |--------------------------------------------------------------------------
    | SAVE DRIVER INFORMATION
    |--------------------------------------------------------------------------
    |
    | Used by the logged-in driver.
    |
    | POST /api/driver/info
    |
    */

    public function saveDriverInfo(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'driver') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],

            'middle_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'max:255',
            ],

            'birth_date' => [
                'required',
                'date',
            ],

            'age' => [
                'required',
                'integer',
                'min:18',
                'max:100',
            ],

            'gender' => [
                'required',
                'string',
                'in:Male,Female',
            ],

            'address' => [
                'required',
                'string',
                'max:500',
            ],

            'contact_number' => [
                'required',
                'string',
                'max:20',
            ],

            'license_number' => [
                'required',
                'string',
                'max:100',
            ],

            'license_expiration' => [
                'required',
                'date',
                'after:today',
            ],

            'truck_plate_number' => [
                'required',
                'string',
                'max:100',
            ],

            'truck_name' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREATE OR UPDATE DRIVER INFORMATION
        |--------------------------------------------------------------------------
        */

        $driverInfo = DriverInfo::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | MARK PROFILE AS COMPLETED
        |--------------------------------------------------------------------------
        |
        | Once all required driver information has been successfully saved,
        | the driver can proceed to the password-change step.
        |
        */

        $user->update([
            'profile_completed' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | REFRESH USER
        |--------------------------------------------------------------------------
        */

        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Driver information saved successfully.',

            'driver_info' => $driverInfo,

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


    /*
    |--------------------------------------------------------------------------
    | GET ALL DRIVERS
    |--------------------------------------------------------------------------
    |
    | Used by ADMIN / SUPERADMIN.
    |
    | GET /api/drivers
    |
    */

    public function getAllDrivers(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!in_array($user->role, [
            'admin',
            'superadmin',
        ])) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | GET DRIVERS + DRIVER INFORMATION
        |--------------------------------------------------------------------------
        */

        $drivers = User::where(
            'role',
            'driver'
        )
            ->with('driver')
            ->get([
                'id',
                'username',
                'email',
                'role',
                'email_verified_at',
                'profile_completed',
                'password_changed',
                'created_at',
            ]);

        return response()->json([
            'drivers' => $drivers,
        ], 200);
    }


    /*
    |--------------------------------------------------------------------------
    | GET ONE DRIVER
    |--------------------------------------------------------------------------
    |
    | GET /api/drivers/{id}
    |
    */

    public function getDriver(
        Request $request,
        $id
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!in_array($user->role, [
            'admin',
            'superadmin',
        ])) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $driver = User::where(
            'role',
            'driver'
        )
            ->with('driver')
            ->find($id);

        if (!$driver) {
            return response()->json([
                'message' => 'Driver not found.',
            ], 404);
        }

        return response()->json([
            'driver' => $driver,
        ], 200);
    }
}