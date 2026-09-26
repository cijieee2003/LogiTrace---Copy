<?php

namespace App\Http\Controllers;

use App\Models\IncidentClassification;
use App\Models\IncidentClassificationRequest;
use App\Models\User;
use App\Notifications\NewIncidentClassificationRequestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class IncidentClassificationRequestController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | DRIVER - CREATE REQUEST
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
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

        $validated = $request->validate([
            'incident_type' => [
                'required',
                'string',
                'max:255',
            ],

            'reason' => [
                'required',
                'string',
                'max:5000',
            ],
        ]);

        /*
         * Prevent duplicate official classifications.
         */
        $existingClassification = IncidentClassification::where(
            'incident_type',
            $validated['incident_type']
        )->first();

        if ($existingClassification) {
            return response()->json([
                'message' => 'This incident classification already exists.',
                'classification' => $existingClassification,
            ], 409);
        }

        /*
         * Prevent duplicate pending requests.
         */
        $existingRequest = IncidentClassificationRequest::where(
            'requested_by',
            $user->id
        )
            ->whereRaw(
                'LOWER(incident_type) = ?',
                [
                    strtolower($validated['incident_type']),
                ]
            )
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'You already have a pending request for this incident type.',
                'request' => $existingRequest,
            ], 409);
        }

        $incidentRequest = IncidentClassificationRequest::create([
            'requested_by' => $user->id,
            'incident_type' => $validated['incident_type'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        /*
         * Automatically notify every admin.
         */
        $admins = User::where('role', 'admin')->get();

        if ($admins->isNotEmpty()) {
            Notification::send(
                $admins,
                new NewIncidentClassificationRequestNotification(
                    $incidentRequest
                )
            );
        }

        $incidentRequest->load([
            'requester',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your new incident classification request has been sent to the administrator.',
            'request' => $incidentRequest,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | DRIVER - OWN REQUESTS
    |--------------------------------------------------------------------------
    */

    public function myRequests(Request $request)
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

        $requests = IncidentClassificationRequest::with([
            'reviewer',
            'createdClassification',
        ])
            ->where('requested_by', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - VIEW REQUESTS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $requests = IncidentClassificationRequest::with([
            'requester',
            'reviewer',
            'createdClassification',
        ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - REVIEW REQUEST
    |--------------------------------------------------------------------------
    */

    public function review(
        Request $request,
        IncidentClassificationRequest $incidentClassificationRequest
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($incidentClassificationRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been reviewed.',
            ], 409);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:approved,rejected',
            ],

            'department' => [
                'required_if:status,approved',
                'nullable',
                'string',
                'max:255',
            ],

            'department_email' => [
                'required_if:status,approved',
                'nullable',
                'email',
                'max:255',
            ],

            'admin_remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        /*
         * Check again in case an official classification
         * was created after the driver submitted the request.
         */
        if ($validated['status'] === 'approved') {
            $existingClassification = IncidentClassification::where(
                'incident_type',
                $incidentClassificationRequest->incident_type
            )->first();

            if ($existingClassification) {
                return response()->json([
                    'message' => 'An incident classification with this incident type already exists.',
                    'classification' => $existingClassification,
                ], 409);
            }
        }

        DB::beginTransaction();

        try {
            $createdClassification = null;

            /*
             * APPROVE
             */
            if ($validated['status'] === 'approved') {
                $createdClassification = IncidentClassification::create([
                    'incident_type' => $incidentClassificationRequest->incident_type,
                    'department' => $validated['department'],
                    'department_email' => $validated['department_email'],
                ]);
            }

            /*
             * Update request.
             */
            $incidentClassificationRequest->update([
                'status' => $validated['status'],
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
                'admin_remarks' => $validated['admin_remarks'] ?? null,
                'created_classification_id' => $createdClassification?->id,
            ]);

            DB::commit();

            $incidentClassificationRequest->load([
                'requester',
                'reviewer',
                'createdClassification',
            ]);

            return response()->json([
                'success' => true,
                'message' => $validated['status'] === 'approved'
                    ? 'Incident classification approved successfully.'
                    : 'Incident classification request rejected successfully.',

                'request' => $incidentClassificationRequest,
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to review incident classification request.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - DELETE REQUEST HISTORY
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        IncidentClassificationRequest $incidentClassificationRequest
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $incidentClassificationRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Request deleted successfully.',
        ]);
    }
}