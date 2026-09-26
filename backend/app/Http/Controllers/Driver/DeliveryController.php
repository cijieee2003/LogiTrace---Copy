<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\DeliveryStatusHistory;
use App\Models\IncidentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class DeliveryController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | DRIVER AUTHORIZATION
    |--------------------------------------------------------------------------
    */

    private function isDriver($user): bool
    {
        return $user && $user->role === 'driver';
    }


    /*
    |--------------------------------------------------------------------------
    | DELIVERY RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    private function deliveryRelations(): array
    {
        return [
            'creator',
            'driver.driverInfo',
            'statusHistories',
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | GET PENDING DELIVERIES
    |--------------------------------------------------------------------------
    |
    | GET /api/driver/deliveries
    |
    */

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->isDriver($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $deliveries = Delivery::with(
            $this->deliveryRelations()
        )
            ->where('status', 'pending')
            ->whereNull('driver_id')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'deliveries' => $deliveries,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ACCEPT DELIVERY
    |--------------------------------------------------------------------------
    |
    | POST /api/driver/deliveries/{id}/accept
    |
    | pending -> pick_up
    |
    */

    public function accept(
        Request $request,
        $id
    ): JsonResponse {
        return $this->acceptDelivery($request, $id);
    }


    /*
    |--------------------------------------------------------------------------
    | ACCEPT DELIVERY
    |--------------------------------------------------------------------------
    */

    public function acceptDelivery(
        Request $request,
        $id
    ): JsonResponse {
        $user = $request->user();

        if (!$this->isDriver($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if ($delivery->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This delivery is no longer available.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK DRIVER ASSIGNMENT
        |--------------------------------------------------------------------------
        */

        if ($delivery->driver_id !== null) {
            return response()->json([
                'success' => false,
                'message' =>
                    'This delivery has already been assigned to another driver.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | ASSIGN CURRENT DRIVER
        |--------------------------------------------------------------------------
        */

        $delivery->driver_id = $user->id;

        /*
        |--------------------------------------------------------------------------
        | CHANGE STATUS
        |--------------------------------------------------------------------------
        */

        $delivery->status = 'pick_up';

        $delivery->save();

        /*
        |--------------------------------------------------------------------------
        | RECORD PICK UP DATE AND TIME
        |--------------------------------------------------------------------------
        */

        DeliveryStatusHistory::create([
            'delivery_id' => $delivery->id,
            'status' => 'pick_up',
            'changed_by' => $user->id,
            'changed_at' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $delivery->load(
            $this->deliveryRelations()
        );

        return response()->json([
            'success' => true,
            'message' => 'Delivery accepted successfully.',
            'delivery' => $delivery,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET DRIVER'S ACTIVE DELIVERIES
    |--------------------------------------------------------------------------
    |
    | GET /api/driver/my-deliveries
    |
    | IMPORTANT:
    | Delivered deliveries are excluded here.
    |
    | This keeps completed deliveries out of DriverDelivery
    | and allows them to appear only in DriverArchive.
    |
    */

    public function myDeliveries(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if (!$this->isDriver($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $deliveries = Delivery::with(
            $this->deliveryRelations()
        )
            ->where('driver_id', $user->id)

            // IMPORTANT:
            // Only active/in-progress deliveries.
            ->where('status', '!=', 'delivered')

            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'deliveries' => $deliveries,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET DRIVER DELIVERY ARCHIVE
    |--------------------------------------------------------------------------
    |
    | GET /api/driver/archive
    |
    | Only delivered deliveries belonging to the logged-in driver
    | are returned.
    |
    */

    public function archive(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if (!$this->isDriver($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $deliveries = Delivery::with(
            $this->deliveryRelations()
        )
            ->where('driver_id', $user->id)

            // IMPORTANT:
            // Archive contains completed deliveries only.
            ->where('status', 'delivered')

            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'deliveries' => $deliveries,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE DELIVERY STATUS
    |--------------------------------------------------------------------------
    |
    | PATCH /api/driver/deliveries/{id}/status
    |
    | Status flow:
    |
    | pick_up
    |    ↓
    | arrival
    |    ↓
    | queuing
    |    ↓
    | unloading
    |    ↓
    | checking
    |    ↓
    | delivered
    |
    */

    public function updateStatus(
        Request $request,
        $id
    ): JsonResponse {
        $user = $request->user();

        if (!$this->isDriver($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | FIND DELIVERY
        |--------------------------------------------------------------------------
        */

        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | MAKE SURE DELIVERY BELONGS TO DRIVER
        |--------------------------------------------------------------------------
        */

        if ((int) $delivery->driver_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not assigned to this delivery.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATE STATUS
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:arrival,queuing,unloading,checking,delivered',
            ],
        ]);

        $newStatus = $validated['status'];

        $currentStatus = $delivery->status;

        /*
        |--------------------------------------------------------------------------
        | ALLOWED STATUS TRANSITIONS
        |--------------------------------------------------------------------------
        */

        $allowedTransitions = [
            'pick_up' => 'arrival',
            'arrival' => 'queuing',
            'queuing' => 'unloading',
            'unloading' => 'checking',
            'checking' => 'delivered',
        ];

        /*
        |--------------------------------------------------------------------------
        | PREVENT INVALID / SKIPPED STATUS
        |--------------------------------------------------------------------------
        */

        if (
            !isset($allowedTransitions[$currentStatus]) ||
            $allowedTransitions[$currentStatus] !== $newStatus
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    "Invalid status transition from {$currentStatus} to {$newStatus}.",
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE DELIVERY + STATUS HISTORY
        |--------------------------------------------------------------------------
        |
        | Both operations happen inside one transaction.
        |
        */

        DB::transaction(function () use (
            $delivery,
            $newStatus,
            $user
        ) {
            /*
            |----------------------------------------------------------------------
            | UPDATE DELIVERY STATUS
            |----------------------------------------------------------------------
            */

            $delivery->status = $newStatus;
            $delivery->save();

            /*
            |----------------------------------------------------------------------
            | CREATE STATUS HISTORY
            |----------------------------------------------------------------------
            */

            DeliveryStatusHistory::create([
                'delivery_id' => $delivery->id,
                'status' => $newStatus,
                'changed_by' => $user->id,
                'changed_at' => now(),
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | RELOAD DELIVERY
        |--------------------------------------------------------------------------
        */

        $delivery->load(
            $this->deliveryRelations()
        );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        $message = $newStatus === 'delivered'
            ? 'Delivery completed successfully.'
            : 'Delivery status updated successfully.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'delivery' => $delivery,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DRIVER TRANSACTION REPORT PDF
    |--------------------------------------------------------------------------
    |
    | POST /api/driver/transaction-reports/pdf
    |
    */

    public function driverTransactionReportPdf(
        Request $request
    ) {
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

        $request->validate([
            'delivery_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'delivery_ids.*' => [
                'required',
                'integer',
                'exists:deliveries,id',
            ],
        ]);

        $deliveries = Delivery::with([
            'creator',
            'driver.driverInfo',
            'driver',
            'incidentReports.classification',
        ])
            ->whereIn(
                'id',
                $request->delivery_ids
            )

            // Selected delivery must belong to driver.
            ->where(
                'driver_id',
                $user->id
            )

            // Only delivered transactions.
            ->where(
                'status',
                'delivered'
            )

            ->latest()
            ->get();

        if ($deliveries->isEmpty()) {
            return response()->json([
                'message' =>
                    'No delivered transactions were found for your account.',
            ], 404);
        }

        $pdf = Pdf::loadView(
            'pdf.delivery-transaction-report',
            [
                'deliveries' => $deliveries,
            ]
        );

        $pdf->setPaper(
            'A4',
            'landscape'
        );

        return $pdf->stream(
            'LogiTrace-Driver-DTR.pdf'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DRIVER TRANSACTION REPORTS
    |--------------------------------------------------------------------------
    |
    | GET /api/driver/transaction-reports
    |
    */

    public function driverTransactionReports(
        Request $request
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | ONLY DRIVER
        |--------------------------------------------------------------------------
        */

        if ($user->role !== 'driver') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | ONLY COMPLETED DELIVERIES
        |--------------------------------------------------------------------------
        */

        $deliveries = Delivery::with([
            'creator',
            'driver.driverInfo',
            'driver',
            'incidentReports.classification',
        ])
            ->where(
                'driver_id',
                $user->id
            )
            ->where(
                'status',
                'delivered'
            )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'deliveries' => $deliveries,
        ]);
    }

    public function incidentReports(Request $request)
{
    $user = $request->user();

    $reports = IncidentReport::with([
        'delivery',
        'delivery.driver',
    ])
    ->whereHas('delivery', function ($query) use ($user) {
        $query->where('driver_id', $user->id);
    })
    ->latest()
    ->get();

    return response()->json([
        'incident_reports' => $reports,
    ]);
}
}

