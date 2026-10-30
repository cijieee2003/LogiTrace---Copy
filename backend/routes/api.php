<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| INCIDENT CLASSIFICATIONS
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\IncidentClassificationController;
use App\Http\Controllers\IncidentClassificationRequestController;

/*
|--------------------------------------------------------------------------
| AUTH CONTROLLERS
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\UserController;

/*
|--------------------------------------------------------------------------
| DRIVER CONTROLLERS
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Driver\DriverInfoController;
use App\Http\Controllers\Driver\DriverRegistrationController;
use App\Http\Controllers\Driver\PasswordController;
use App\Http\Controllers\Driver\DeliveryController as DriverDeliveryController;

/*
|--------------------------------------------------------------------------
| ADMIN CONTROLLERS
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Admin\DriverPasswordController;
use App\Http\Controllers\AdminHistoryController;

/*
|--------------------------------------------------------------------------
| STAFF CONTROLLERS
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Staff\DeliveryController as StaffDeliveryController;

/*
|--------------------------------------------------------------------------
| INCIDENT CONTROLLERS
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\IncidentReportController;


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| EMAIL VERIFICATION
|--------------------------------------------------------------------------
*/

Route::get(
    '/email/verify/{id}/{hash}',
    function ($id, $hash) {

        $user = User::findOrFail($id);

        if (!hash_equals(
            sha1($user->getEmailForVerification()),
            $hash
        )) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link.',
            ], 403);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect(
            'http://localhost:5173/email-verified'
        );
    }
)
    ->middleware('signed')
    ->name('verification.verify');


/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    Route::get('/user', [UserController::class, 'user']);

     Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | DRIVER REGISTRATION / MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::post('/registerDriver', [
        DriverRegistrationController::class,
        'registerDriver'
    ]);

    Route::get('/drivers', [
        DriverInfoController::class,
        'getAllDrivers'
    ]);

    Route::get('/drivers/{id}', [
        DriverInfoController::class,
        'getDriver'
    ]);

    Route::put('/drivers/{id}', [
        DriverRegistrationController::class,
        'updateDriver'
    ]);

    Route::delete('/drivers/{id}', [
        DriverRegistrationController::class,
        'deleteDriver'
    ]);


    /*
    |--------------------------------------------------------------------------
    | DRIVER PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/driver/info', [
        DriverInfoController::class,
        'getDriverInfo'
    ]);

    Route::post('/driver/info', [
        DriverInfoController::class,
        'saveDriverInfo'
    ]);


    /*
    |--------------------------------------------------------------------------
    | DRIVER PASSWORD
    |--------------------------------------------------------------------------
    */

    Route::post('/driver/change-password', [
        PasswordController::class,
        'changePassword'
    ]);


    /*
    |--------------------------------------------------------------------------
    | ADMIN RESET DRIVER PASSWORD
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/admin/drivers/{id}/reset-password',
        [
            DriverPasswordController::class,
            'resetPassword'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | EMAIL VERIFICATION RESEND
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/email/verification-notification',
        function (Request $request) {

            if (
                $request
                    ->user()
                    ->hasVerifiedEmail()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email is already verified.',
                ], 400);
            }

            $request
                ->user()
                ->sendEmailVerificationNotification();

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent successfully.',
            ]);
        }
    )
        ->middleware('throttle:6,1')
        ->name('verification.send');


    /*
    |--------------------------------------------------------------------------
    | STAFF DELIVERY
    |--------------------------------------------------------------------------
    */

    Route::prefix('staff')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | GET ALL DELIVERIES
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/deliveries',
            [
                StaffDeliveryController::class,
                'index'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | CREATE DELIVERY
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/deliveries',
            [
                StaffDeliveryController::class,
                'store'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | GET ONE DELIVERY
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/deliveries/{id}',
            [
                StaffDeliveryController::class,
                'show'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | UPDATE DELIVERY INFORMATION
        |--------------------------------------------------------------------------
        */

        Route::put(
            '/deliveries/{id}',
            [
                StaffDeliveryController::class,
                'update'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | DELETE DELIVERY
        |--------------------------------------------------------------------------
        */

        Route::delete(
            '/deliveries/{id}',
            [
                StaffDeliveryController::class,
                'destroy'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | INCIDENT REPORTS FOR ONE DELIVERY
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/deliveries/{delivery}/incidents',
            [
                IncidentReportController::class,
                'indexForDelivery'
            ]
        );
    });


    /*
    |--------------------------------------------------------------------------
    | DRIVER DELIVERY
    |--------------------------------------------------------------------------
    */

    Route::prefix('driver')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | AVAILABLE DELIVERIES
        |--------------------------------------------------------------------------
        |
        | GET /api/driver/deliveries
        |
        */

        Route::get(
            '/deliveries',
            [
                DriverDeliveryController::class,
                'index'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | ACCEPT DELIVERY
        |--------------------------------------------------------------------------
        |
        | POST /api/driver/deliveries/{delivery}/accept
        |
        */

        Route::post(
            '/deliveries/{delivery}/accept',
            [
                DriverDeliveryController::class,
                'acceptDelivery'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | MY DELIVERIES
        |--------------------------------------------------------------------------
        |
        | GET /api/driver/my-deliveries
        |
        */

        Route::get(
            '/my-deliveries',
            [
                DriverDeliveryController::class,
                'myDeliveries'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | DRIVER ARCHIVE
        |--------------------------------------------------------------------------
        |
        | GET /api/driver/archive
        |
        | Returns deliveries belonging to the authenticated driver
        | whose status is "delivered".
        |
        */

        Route::get(
            '/archive',
            [
                DriverDeliveryController::class,
                'archive'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | UPDATE DELIVERY STATUS
        |--------------------------------------------------------------------------
        |
        | PATCH /api/driver/deliveries/{delivery}/status
        |
        */

        Route::patch(
            '/deliveries/{delivery}/status',
            [
                DriverDeliveryController::class,
                'updateStatus'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | CREATE INCIDENT REPORT
        |--------------------------------------------------------------------------
        |
        | Driver can report during:
        |
        | arrival
        | queueing
        | unloading
        | checking
        |
        | POST:
        | /api/driver/deliveries/{delivery}/incidents
        |
        */

        Route::post(
            '/deliveries/{delivery}/incidents',
            [
                IncidentReportController::class,
                'store'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | DRIVER INCIDENT REPORTS
        |--------------------------------------------------------------------------
        |
        | GET /api/driver/incidents
        |
        */

        Route::get(
            '/incidents',
            [
                IncidentReportController::class,
                'driverReports'
            ]
        );
    });


    /*
    |--------------------------------------------------------------------------
    | DELIVERY TRANSACTION REPORTS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/delivery-transaction-reports',
        [
            StaffDeliveryController::class,
            'transactionReports'
        ]
    );

    Route::post(
        '/delivery-transaction-reports/pdf',
        [
            StaffDeliveryController::class,
            'transactionReportPdf'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | DRIVER DELIVERY TRANSACTION REPORTS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/driver/delivery-transaction-reports',
        [
            DriverDeliveryController::class,
            'driverTransactionReports'
        ]
    );

    Route::post(
        '/driver/delivery-transaction-reports/pdf',
        [
            DriverDeliveryController::class,
            'driverTransactionReportPdf'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INCIDENT REPORT MANAGEMENT
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | ALL INCIDENT REPORTS
    |--------------------------------------------------------------------------
    |
    | Staff/Admin/Superadmin
    |
    | GET /api/incidents
    |
    */

    Route::get(
        '/incidents',
        [
            IncidentReportController::class,
            'index'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | VIEW ONE INCIDENT
    |--------------------------------------------------------------------------
    |
    | GET /api/incidents/{incident}
    |
    */

    Route::get(
        '/incidents/{incident}',
        [
            IncidentReportController::class,
            'show'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | REVIEW INCIDENT
    |--------------------------------------------------------------------------
    |
    | Staff/Admin/Superadmin
    |
    | PUT /api/incidents/{incident}/review
    |
    */

    Route::put(
        '/incidents/{incident}/review',
        [
            IncidentReportController::class,
            'review'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD INCIDENT REPORT PDF
    |--------------------------------------------------------------------------
    |
    | GET /api/incidents/{incident}/pdf
    |
    */

    Route::get(
        '/incidents/{incident}/pdf',
        [
            IncidentReportController::class,
            'pdf'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | DELETE INCIDENT
    |--------------------------------------------------------------------------
    |
    | Admin/Superadmin only
    |
    | DELETE /api/incidents/{incident}
    |
    */

    Route::delete(
        '/incidents/{incident}',
        [
            IncidentReportController::class,
            'destroy'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INCIDENT CLASSIFICATIONS
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | ADMIN + DRIVER
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/incident-classifications',
        [
            IncidentClassificationController::class,
            'index'
        ]
    );

    Route::get(
        '/incident-classifications/{incidentClassification}',
        [
            IncidentClassificationController::class,
            'show'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/incident-classifications',
        [
            IncidentClassificationController::class,
            'store'
        ]
    );

    Route::put(
        '/incident-classifications/{incidentClassification}',
        [
            IncidentClassificationController::class,
            'update'
        ]
    );

    Route::delete(
        '/incident-classifications/{incidentClassification}',
        [
            IncidentClassificationController::class,
            'destroy'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | DRIVER INCIDENT CLASSIFICATION REQUESTS
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/driver/incident-classification-requests',
        [
            IncidentClassificationRequestController::class,
            'store'
        ]
    );

    Route::get(
        '/driver/incident-classification-requests',
        [
            IncidentClassificationRequestController::class,
            'myRequests'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | ADMIN INCIDENT CLASSIFICATION REQUESTS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/incident-classification-requests',
        [
            IncidentClassificationRequestController::class,
            'index'
        ]
    );

    Route::put(
        '/admin/incident-classification-requests/{incidentClassificationRequest}/review',
        [
            IncidentClassificationRequestController::class,
            'review'
        ]
    );

    Route::delete(
        '/admin/incident-classification-requests/{incidentClassificationRequest}',
        [
            IncidentClassificationRequestController::class,
            'destroy'
        ]
    );

    Route::get('/admin/history', [
        AdminHistoryController::class,
        'index'
    ]);

    Route::get('/admin/history/{adminHistory}', [
        AdminHistoryController::class,
        'show'
    ]);


    
});



