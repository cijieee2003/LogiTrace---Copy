<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class DeliveryController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ALLOWED STAFF ROLES
    |--------------------------------------------------------------------------
    */

    private function isStaffRole($user): bool
    {
        return $user &&
            in_array($user->role, [
                'staff',
                'admin',
                'superadmin',
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DELIVERY RELATIONSHIPS
    |--------------------------------------------------------------------------
    |
    | driver = User model
    | driverInfo = DriverInfo model
    |
    | Laravel will return driver_info in JSON.
    |
    */

    private function deliveryRelations(): array
    {
        return [
            'creator',
            'driver.driverInfo',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | GET ALL DELIVERIES
    |--------------------------------------------------------------------------
    |
    | GET /api/staff/deliveries
    |
    */

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->isStaffRole($user)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $deliveries = Delivery::with(
            $this->deliveryRelations()
        )
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Deliveries retrieved successfully.',
            'deliveries' => $deliveries,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE DELIVERY
    |--------------------------------------------------------------------------
    |
    | POST /api/staff/deliveries
    |
    | IMPORTANT:
    |
    | Staff creates a delivery with:
    |
    | driver_id = NULL
    | status    = pending
    |
    | The driver will accept it later.
    |
    */

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->isStaffRole($user)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'dr_number' => [
                'required',
                'string',
                'max:100',
                'unique:deliveries,dr_number',
            ],

            'recipient_name' => [
                'required',
                'string',
                'max:255',
            ],

            'quantity_order' => [
                'required',
                'integer',
                'min:1',
            ],

            'delivery_address' => [
                'required',
                'string',
                'max:1000',
            ],

            'delivery_date' => [
                'nullable',
                'date',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREATE DELIVERY
        |--------------------------------------------------------------------------
        |
        | NEVER accept status or driver_id from the frontend here.
        |
        | Every newly created delivery starts as:
        |
        | pending
        |
        */

        $delivery = Delivery::create([
            'dr_number' => $validated['dr_number'],

            'created_by' => $user->id,

            // No driver yet
            'driver_id' => null,

            'recipient_name' => $validated['recipient_name'],

            'quantity_order' => $validated['quantity_order'],

            'delivery_address' => $validated['delivery_address'],

            'delivery_date' => $validated['delivery_date'] ?? null,

            // Initial status
            'status' => 'pending',
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
            'message' => 'Delivery created successfully.',
            'delivery' => $delivery,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | GET SINGLE DELIVERY
    |--------------------------------------------------------------------------
    |
    | GET /api/staff/deliveries/{id}
    |
    */

    public function show(
        Request $request,
        $id
    ): JsonResponse {
        $user = $request->user();

        if (!$this->isStaffRole($user)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $delivery = Delivery::with(
            $this->deliveryRelations()
        )->findOrFail($id);

        return response()->json([
            'message' => 'Delivery retrieved successfully.',
            'delivery' => $delivery,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE DELIVERY
    |--------------------------------------------------------------------------
    |
    | PUT /api/staff/deliveries/{id}
    |
    | Staff can edit delivery information.
    |
    | Staff CANNOT change:
    |
    | - status
    | - driver_id
    | - created_by
    |
    */

    public function update(
        Request $request,
        $id
    ): JsonResponse {
        $user = $request->user();

        if (!$this->isStaffRole($user)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $delivery = Delivery::findOrFail($id);

        $validated = $request->validate([
            'dr_number' => [
                'required',
                'string',
                'max:100',
                'unique:deliveries,dr_number,' . $delivery->id,
            ],

            'recipient_name' => [
                'required',
                'string',
                'max:255',
            ],

            'quantity_order' => [
                'required',
                'integer',
                'min:1',
            ],

            'delivery_address' => [
                'required',
                'string',
                'max:1000',
            ],

            'delivery_date' => [
                'nullable',
                'date',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | UPDATE ONLY DELIVERY INFORMATION
        |--------------------------------------------------------------------------
        */

        $delivery->update([
            'dr_number' => $validated['dr_number'],

            'recipient_name' => $validated['recipient_name'],

            'quantity_order' => $validated['quantity_order'],

            'delivery_address' => $validated['delivery_address'],

            'delivery_date' => $validated['delivery_date'] ?? null,
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
            'message' => 'Delivery updated successfully.',
            'delivery' => $delivery,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE DELIVERY
    |--------------------------------------------------------------------------
    |
    | DELETE /api/staff/deliveries/{id}
    |
    */

    public function destroy(
        Request $request,
        $id
    ): JsonResponse {
        $user = $request->user();

        if (!$this->isStaffRole($user)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $delivery = Delivery::findOrFail($id);

        $delivery->delete();

        return response()->json([
            'message' => 'Delivery deleted successfully.',
        ]);
    }


       public function transactionReports(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json([
            'message' => 'Unauthenticated.',
        ], 401);
    }

    /*
    |--------------------------------------------------------------------------
    | Only Admin and Staff can view transaction reports
    |--------------------------------------------------------------------------
    */

    if ($user->role !== 'admin' && $user->role !== 'staff') {
        return response()->json([
            'message' => 'Unauthorized.',
        ], 403);
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch only delivered transactions
    |--------------------------------------------------------------------------
    */

    $deliveries = Delivery::with([
        'creator',
        'driver.driver',
        'statusHistories',
    ])
        ->where('status', 'delivered')
        ->latest()
        ->get();

    return response()->json([
        'success' => true,
        'deliveries' => $deliveries,
    ]);
}


public function transactionReportPdf(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json([
            'message' => 'Unauthenticated.',
        ], 401);
    }

    if ($user->role !== 'admin' && $user->role !== 'staff') {
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

    $deliveryIds = $request->delivery_ids;

    /*
    |--------------------------------------------------------------------------
    | FETCH ONLY SELECTED DELIVERED TRANSACTIONS
    |--------------------------------------------------------------------------
    */

    $deliveries = Delivery::with([
        'creator',
        'driver.driverInfo',
        'driver',
        'statusHistories',
         'incidentReports.classification',
    ])
        ->whereIn('id', $deliveryIds)
        ->where('status', 'delivered')
        ->latest()
        ->get();

    /*
    |--------------------------------------------------------------------------
    | MAKE SURE SELECTED TRANSACTIONS ARE ACTUALLY DELIVERED
    |--------------------------------------------------------------------------
    */

    if ($deliveries->isEmpty()) {
        return response()->json([
            'message' => 'No delivered transactions were found.',
        ], 404);
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE PDF
    |--------------------------------------------------------------------------
    */

    $pdf = Pdf::loadView(
        'pdf.delivery-transaction-report',
        [
            'deliveries' => $deliveries,
        ]
    );

    $pdf->setPaper('A4', 'landscape');

    return $pdf->stream(
        'LogiTrace-Delivery-Transaction-Report.pdf'
    );
}
}