<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Delivery;
use App\Models\DeliveryStatusHistory;
use App\Models\IncidentReport;
use App\Models\IncidentClassificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class AdminHistoryController extends Controller
{
    /**
     * Get combined admin history.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | AUTHORIZATION
        |--------------------------------------------------------------------------
        */

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
        | FILTERS
        |--------------------------------------------------------------------------
        */

        $type = $request->query('type', 'all');

        $allowedTypes = [
            'all',
            'driver',
            'delivery',
            'incident',
            'classification_request',
        ];

        if (!in_array($type, $allowedTypes)) {
            return response()->json([
                'message' => 'Invalid history type.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | HISTORY COLLECTION
        |--------------------------------------------------------------------------
        */

        $history = collect();

        /*
        |--------------------------------------------------------------------------
        | DRIVER HISTORY
        |--------------------------------------------------------------------------
        */

        if (
            $type === 'all' ||
            $type === 'driver'
        ) {
            $drivers = User::where('role', 'driver')
                ->with('driverInfo')
                ->get();

            foreach ($drivers as $driver) {

                /*
                | Driver registered
                */

                if ($driver->created_at) {

                    $history->push([
                        'id' => 'driver-created-' . $driver->id,

                        'type' => 'driver',

                        'action' => 'Driver Registered',

                        'description' =>
                            'A new driver account was registered.',

                        'reference' =>
                            $driver->username,

                        'reference_id' =>
                            $driver->id,

                        'actor' => [
                            'id' => null,
                            'username' => 'System',
                            'role' => 'system',
                        ],

                        'subject' => [
                            'id' => $driver->id,
                            'username' => $driver->username,
                            'email' => $driver->email,
                        ],

                        'timestamp' =>
                            $driver->created_at,

                        'metadata' => [
                            'email' => $driver->email,
                            'email_verified' =>
                                !is_null(
                                    $driver->email_verified_at
                                ),
                        ],
                    ]);
                }

                /*
                | Email verified
                */

                if ($driver->email_verified_at) {

                    $history->push([
                        'id' => 'driver-verified-' . $driver->id,

                        'type' => 'driver',

                        'action' => 'Driver Email Verified',

                        'description' =>
                            'The driver verified their email address.',

                        'reference' =>
                            $driver->username,

                        'reference_id' =>
                            $driver->id,

                        'actor' => [
                            'id' => $driver->id,
                            'username' => $driver->username,
                            'role' => 'driver',
                        ],

                        'subject' => [
                            'id' => $driver->id,
                            'username' => $driver->username,
                            'email' => $driver->email,
                        ],

                        'timestamp' =>
                            $driver->email_verified_at,

                        'metadata' => [
                            'email' => $driver->email,
                        ],
                    ]);
                }

                /*
                | Driver profile updated
                */

                if (
                    $driver->driverInfo &&
                    $driver->driverInfo->updated_at
                ) {

                    /*
                    |--------------------------------------------------------------------------
                    | Only treat updated_at as a profile history event
                    | if it is different from created_at.
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !$driver->driverInfo->created_at ||
                        $driver->driverInfo->updated_at
                            ->ne(
                                $driver->driverInfo->created_at
                            )
                    ) {

                        $history->push([
                            'id' =>
                                'driver-profile-updated-' .
                                $driver->driverInfo->id,

                            'type' => 'driver',

                            'action' =>
                                'Driver Profile Updated',

                            'description' =>
                                'Driver profile information was updated.',

                            'reference' =>
                                $driver->username,

                            'reference_id' =>
                                $driver->id,

                            'actor' => [
                                'id' => $driver->id,
                                'username' =>
                                    $driver->username,
                                'role' => 'driver',
                            ],

                            'subject' => [
                                'id' => $driver->id,
                                'username' =>
                                    $driver->username,
                            ],

                            'timestamp' =>
                                $driver->driverInfo->updated_at,

                            'metadata' => [
                                'profile_completed' =>
                                    $driver->profile_completed,
                            ],
                        ]);
                    }
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | DELIVERY CREATION HISTORY
        |--------------------------------------------------------------------------
        */

        if (
            $type === 'all' ||
            $type === 'delivery'
        ) {

            $deliveries = Delivery::with([
                'creator',
                'driver',
            ])
                ->latest('created_at')
                ->get();

            foreach ($deliveries as $delivery) {

                if (!$delivery->created_at) {
                    continue;
                }

                $creator = $delivery->creator;

                $history->push([
                    'id' =>
                        'delivery-created-' .
                        $delivery->id,

                    'type' => 'delivery',

                    'action' => 'Delivery Created',

                    'description' =>
                        'A new delivery transaction was created.',

                    'reference' =>
                        $delivery->dr_number,

                    'reference_id' =>
                        $delivery->id,

                    'actor' => [
                        'id' =>
                            $creator?->id,

                        'username' =>
                            $creator?->username ??
                            'Unknown',

                        'role' =>
                            $creator?->role ??
                            'unknown',
                    ],

                    'subject' => [
                        'id' =>
                            $delivery->id,

                        'dr_number' =>
                            $delivery->dr_number,

                        'recipient_name' =>
                            $delivery->recipient_name,
                    ],

                    'timestamp' =>
                        $delivery->created_at,

                    'metadata' => [
                        'quantity' =>
                            $delivery->quantity_order,

                        'delivery_date' =>
                            $delivery->delivery_date,

                        'status' =>
                            $delivery->status,
                    ],
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | DELIVERY STATUS HISTORY
        |--------------------------------------------------------------------------
        */

        if (
            $type === 'all' ||
            $type === 'delivery'
        ) {

            $statusHistories =
                DeliveryStatusHistory::with([
                    'delivery',
                    'changedBy',
                ])
                    ->latest('changed_at')
                    ->get();

            foreach (
                $statusHistories as $statusHistory
            ) {

                $delivery =
                    $statusHistory->delivery;

                if (!$delivery) {
                    continue;
                }

                $changedBy =
                    $statusHistory->changedBy;

                $statusLabels = [
                    'pick_up' => 'Pick Up',
                    'arrival' => 'Arrival',
                    'queuing' => 'Queuing',
                    'unloading' => 'Unloading',
                    'checking' => 'Checking',
                    'delivered' => 'Delivered',
                ];

                $statusLabel =
                    $statusLabels[
                        $statusHistory->status
                    ] ??
                    ucfirst(
                        str_replace(
                            '_',
                            ' ',
                            $statusHistory->status
                        )
                    );

                $history->push([
                    'id' =>
                        'delivery-status-' .
                        $statusHistory->id,

                    'type' => 'delivery',

                    'action' =>
                        'Delivery ' .
                        $statusLabel,

                    'description' =>
                        'Delivery status changed to ' .
                        $statusLabel .
                        '.',

                    'reference' =>
                        $delivery->dr_number,

                    'reference_id' =>
                        $delivery->id,

                    'actor' => [
                        'id' =>
                            $changedBy?->id,

                        'username' =>
                            $changedBy?->username ??
                            'Unknown',

                        'role' =>
                            $changedBy?->role ??
                            'unknown',
                    ],

                    'subject' => [
                        'id' =>
                            $delivery->id,

                        'dr_number' =>
                            $delivery->dr_number,

                        'recipient_name' =>
                            $delivery->recipient_name,
                    ],

                    'timestamp' =>
                        $statusHistory->changed_at,

                    'metadata' => [
                        'status' =>
                            $statusHistory->status,

                        'status_label' =>
                            $statusLabel,
                    ],
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | INCIDENT HISTORY
        |--------------------------------------------------------------------------
        */

        if (
            $type === 'all' ||
            $type === 'incident'
        ) {

            $incidents = IncidentReport::with([
                'delivery',
                'reporter',
                'reviewer',
                'classification',
            ])
                ->latest('created_at')
                ->get();

            foreach ($incidents as $incident) {

                /*
                |--------------------------------------------------------------------------
                | INCIDENT REPORTED
                |--------------------------------------------------------------------------
                */

                if ($incident->created_at) {

                    $reporter =
                        $incident->reporter;

                    $history->push([
                        'id' =>
                            'incident-created-' .
                            $incident->id,

                        'type' => 'incident',

                        'action' =>
                            'Incident Reported',

                        'description' =>
                            'A new incident report was submitted.',

                        'reference' =>
                            $incident->incident_number,

                        'reference_id' =>
                            $incident->id,

                        'actor' => [
                            'id' =>
                                $reporter?->id,

                            'username' =>
                                $reporter?->username ??
                                'Unknown',

                            'role' =>
                                $reporter?->role ??
                                'unknown',
                        ],

                        'subject' => [
                            'id' =>
                                $incident->id,

                            'incident_number' =>
                                $incident->incident_number,

                            'delivery_id' =>
                                $incident->delivery_id,
                        ],

                        'timestamp' =>
                            $incident->created_at,

                        'metadata' => [
                            'status' =>
                                $incident->status,

                            'classification' =>
                                $incident->classification
                                    ?->incident_type,

                            'department' =>
                                $incident->classification
                                    ?->department,

                            'quantity_affected' =>
                                $incident->quantity_affected,
                        ],
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | INCIDENT REVIEWED
                |--------------------------------------------------------------------------
                */

                if ($incident->reviewed_at) {

                    $reviewer =
                        $incident->reviewer;

                    $history->push([
                        'id' =>
                            'incident-reviewed-' .
                            $incident->id,

                        'type' => 'incident',

                        'action' =>
                            'Incident Reviewed',

                        'description' =>
                            'An incident report was reviewed.',

                        'reference' =>
                            $incident->incident_number,

                        'reference_id' =>
                            $incident->id,

                        'actor' => [
                            'id' =>
                                $reviewer?->id,

                            'username' =>
                                $reviewer?->username ??
                                'Unknown',

                            'role' =>
                                $reviewer?->role ??
                                'unknown',
                        ],

                        'subject' => [
                            'id' =>
                                $incident->id,

                            'incident_number' =>
                                $incident->incident_number,

                            'delivery_id' =>
                                $incident->delivery_id,
                        ],

                        'timestamp' =>
                            $incident->reviewed_at,

                        'metadata' => [
                            'status' =>
                                $incident->status,

                            'remarks' =>
                                $incident->staff_remarks,

                            'classification' =>
                                $incident->classification
                                    ?->incident_type,
                        ],
                    ]);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSIFICATION REQUEST HISTORY
        |--------------------------------------------------------------------------
        */

        if (
            $type === 'all' ||
            $type === 'classification_request'
        ) {

            $requests =
                IncidentClassificationRequest::with([
                    'requester',
                    'reviewer',
                    'createdClassification',
                ])
                    ->latest('created_at')
                    ->get();

            foreach ($requests as $classificationRequest) {

                /*
                |--------------------------------------------------------------------------
                | REQUEST SUBMITTED
                |--------------------------------------------------------------------------
                */

                if (
                    $classificationRequest->created_at
                ) {

                    $requester =
                        $classificationRequest->requester;

                    $history->push([
                        'id' =>
                            'classification-request-created-' .
                            $classificationRequest->id,

                        'type' =>
                            'classification_request',

                        'action' =>
                            'Classification Request Submitted',

                        'description' =>
                            'A driver submitted an incident classification request.',

                        'reference' =>
                            $classificationRequest->incident_type,

                        'reference_id' =>
                            $classificationRequest->id,

                        'actor' => [
                            'id' =>
                                $requester?->id,

                            'username' =>
                                $requester?->username ??
                                'Unknown',

                            'role' =>
                                $requester?->role ??
                                'unknown',
                        ],

                        'subject' => [
                            'id' =>
                                $classificationRequest->id,

                            'incident_type' =>
                                $classificationRequest->incident_type,

                            'reason' =>
                                $classificationRequest->reason,
                        ],

                        'timestamp' =>
                            $classificationRequest->created_at,

                        'metadata' => [
                            'status' =>
                                $classificationRequest->status,
                        ],
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | REQUEST REVIEWED
                |--------------------------------------------------------------------------
                */

                if (
                    $classificationRequest->reviewed_at
                ) {

                    $reviewer =
                        $classificationRequest->reviewer;

                    $history->push([
                        'id' =>
                            'classification-request-reviewed-' .
                            $classificationRequest->id,

                        'type' =>
                            'classification_request',

                        'action' =>
                            'Classification Request ' .
                            ucfirst(
                                $classificationRequest->status
                            ),

                        'description' =>
                            'An incident classification request was reviewed.',

                        'reference' =>
                            $classificationRequest->incident_type,

                        'reference_id' =>
                            $classificationRequest->id,

                        'actor' => [
                            'id' =>
                                $reviewer?->id,

                            'username' =>
                                $reviewer?->username ??
                                'Unknown',

                            'role' =>
                                $reviewer?->role ??
                                'unknown',
                        ],

                        'subject' => [
                            'id' =>
                                $classificationRequest->id,

                            'incident_type' =>
                                $classificationRequest->incident_type,
                        ],

                        'timestamp' =>
                            $classificationRequest->reviewed_at,

                        'metadata' => [
                            'status' =>
                                $classificationRequest->status,

                            'remarks' =>
                                $classificationRequest->admin_remarks,

                            'created_classification_id' =>
                                $classificationRequest
                                    ->created_classification_id,
                        ],
                    ]);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | SORT ALL EVENTS
        |--------------------------------------------------------------------------
        */

        $history = $history
            ->sortByDesc(function ($item) {
                return $item['timestamp'];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        $perPage = min(
            max(
                (int) $request->query(
                    'per_page',
                    30
                ),
                1
            ),
            100
        );

        $page = max(
            (int) $request->query(
                'page',
                1
            ),
            1
        );

        $total = $history->count();

        $items = $history
            ->forPage(
                $page,
                $perPage
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'history' => $items,

            'pagination' => [
                'current_page' =>
                    $page,

                'per_page' =>
                    $perPage,

                'total' =>
                    $total,

                'last_page' =>
                    max(
                        (int) ceil(
                            $total / $perPage
                        ),
                        1
                    ),
            ],
        ]);
    }
}