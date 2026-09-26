<?php

namespace App\Http\Controllers;

use App\Mail\IncidentReportedMail;
use App\Models\Delivery;
use App\Models\IncidentClassification;
use App\Models\IncidentReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class IncidentReportController extends Controller
{
    /**
     * Driver creates an incident report.
     *
     * POST:
     * /api/driver/deliveries/{delivery}/incidents
     */
    public function store(Request $request, $deliveryId)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Driver only
        |--------------------------------------------------------------------------
        */

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
        | Find delivery
        |--------------------------------------------------------------------------
        */

        $delivery = Delivery::find($deliveryId);

        if (!$delivery) {
            return response()->json([
                'message' => 'Delivery not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Driver ownership
        |--------------------------------------------------------------------------
        */

        if ((int) $delivery->driver_id !== (int) $user->id) {
            return response()->json([
                'message' => 'You are not assigned to this delivery.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Incident can only be reported during these stages
        |--------------------------------------------------------------------------
        */

        $allowedStatuses = [
            'arrival',
            'queuing',
            'unloading',
            'checking',
        ];

        if (!in_array($delivery->status, $allowedStatuses, true)) {
            return response()->json([
                'message' =>
                    'Incident reports can only be submitted during arrival, queuing, unloading, or checking.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate incident information
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'incident_classification_id' => [
                'required',
                'integer',
                'exists:incident_classifications,id',
            ],

            'description' => [
                'required',
                'string',
                'max:5000',
            ],

            'evidence_photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Get classification
        |--------------------------------------------------------------------------
        */

        $classification = IncidentClassification::find(
            $validated['incident_classification_id']
        );

        if (!$classification) {
            return response()->json([
                'message' => 'Incident classification not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Quantity validation
        |--------------------------------------------------------------------------
        */

        $quantityAffected = null;

        if ($classification->quantity_required) {
            $quantityValidation = $request->validate([
                'quantity_affected' => [
                    'required',
                    'integer',
                    'min:1',
                ],
            ]);

            $quantityAffected =
                $quantityValidation['quantity_affected'];
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent multiple active incidents
        |--------------------------------------------------------------------------
        */

        $existingActiveIncident = IncidentReport::where(
            'delivery_id',
            $delivery->id
        )
            ->whereIn('status', [
                'open',
                'under_review',
            ])
            ->exists();

        if ($existingActiveIncident) {
            return response()->json([
                'message' =>
                    'This delivery already has an active incident report.',
            ], 409);
        }

        /*
        |--------------------------------------------------------------------------
        | Evidence photo
        |--------------------------------------------------------------------------
        */

        $evidencePhoto = null;

        if ($request->hasFile('evidence_photo')) {
            $evidencePhoto = $request
                ->file('evidence_photo')
                ->store(
                    'incident-evidence',
                    'public'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Generate incident number
        |--------------------------------------------------------------------------
        */

        $incidentNumber =
            $this->generateIncidentNumber();

        /*
        |--------------------------------------------------------------------------
        | Create incident report
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | reported_by is the authenticated driver's users.id.
        |
        */

        $incident = IncidentReport::create([
            'incident_number' =>
                $incidentNumber,

            'delivery_id' =>
                $delivery->id,

            'reported_by' =>
                $user->id,

            'incident_classification_id' =>
                $classification->id,

            'quantity_affected' =>
                $quantityAffected,

            'description' =>
                $validated['description'],

            'evidence_photo' =>
                $evidencePhoto,

            'status' =>
                'open',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Load relationships
        |--------------------------------------------------------------------------
        */

        $incident->load([
            'delivery.creator',
            'delivery.driver.driver',
            'reporter.driver',
            'reviewer',
            'classification',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Send department email
        |--------------------------------------------------------------------------
        */

        try {
            if (!empty($classification->department_email)) {
                Mail::to(
                    $classification->department_email
                )->send(
                    new IncidentReportedMail($incident)
                );
            }
        } catch (\Throwable $e) {
            Log::error(
                'Incident email failed.',
                [
                    'incident_id' =>
                        $incident->id,

                    'incident_number' =>
                        $incident->incident_number,

                    'error' =>
                        $e->getMessage(),
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' =>
                true,

            'message' =>
                'Incident report submitted successfully.',

            'incident' =>
                $this->formatIncident($incident),
        ], 201);
    }


    /**
     * Driver views their own incident reports.
     *
     * GET:
     * /api/driver/incidents
     */
    public function driverReports(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Driver only
        |--------------------------------------------------------------------------
        */

        if ($user->role !== 'driver') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Get incidents belonging to authenticated driver
        |--------------------------------------------------------------------------
        */

        $incidents = IncidentReport::with([
            'delivery.creator',
            'delivery.driver.driver',
            'reporter.driver',
            'reviewer',
            'classification',
        ])
            ->where(
                'reported_by',
                $user->id
            )
            ->latest()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' =>
                true,

            'driver_id' =>
                $user->id,

            'count' =>
                $incidents->count(),

            'incidents' =>
                $incidents
                    ->map(
                        fn ($incident) =>
                            $this->formatIncident($incident)
                    )
                    ->values(),
        ]);
    }


    /**
     * Admin/Staff/Superadmin views ALL incident reports.
     *
     * GET:
     * /api/incidents
     */
    public function index(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Allowed roles
        |--------------------------------------------------------------------------
        */

        if (!in_array($user->role, [
            'staff',
            'admin',
            'superadmin',
        ], true)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Fetch ALL incident reports
        |--------------------------------------------------------------------------
        */

        $incidents = IncidentReport::with([
            'delivery.creator',
            'delivery.driver.driver',
            'reporter.driver',
            'reviewer',
            'classification',
        ])
            ->latest()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' =>
                true,

            'count' =>
                $incidents->count(),

            'incidents' =>
                $incidents
                    ->map(
                        fn ($incident) =>
                            $this->formatIncident($incident)
                    )
                    ->values(),
        ]);
    }


    /**
     * Staff/Admin/Superadmin views incidents
     * belonging to one delivery.
     *
     * GET:
     * /api/staff/deliveries/{delivery}/incidents
     */
    public function indexForDelivery(
        Request $request,
        Delivery $delivery
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Allowed roles
        |--------------------------------------------------------------------------
        */

        if (!in_array($user->role, [
            'staff',
            'admin',
            'superadmin',
        ], true)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Get incidents belonging to delivery
        |--------------------------------------------------------------------------
        */

        $incidents = IncidentReport::with([
            'delivery.creator',
            'delivery.driver.driver',
            'reporter.driver',
            'reviewer',
            'classification',
        ])
            ->where(
                'delivery_id',
                $delivery->id
            )
            ->latest()
            ->get();

        return response()->json([
            'success' =>
                true,

            'delivery_id' =>
                $delivery->id,

            'incidents' =>
                $incidents
                    ->map(
                        fn ($incident) =>
                            $this->formatIncident($incident)
                    )
                    ->values(),
        ]);
    }


    /**
     * View one incident.
     *
     * GET:
     * /api/incidents/{incident}
     */
    public function show(
        Request $request,
        IncidentReport $incident
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Driver can view own report.
        | Staff/Admin/Superadmin can view all.
        |--------------------------------------------------------------------------
        */

        $allowed =
            (
                (int) $user->id ===
                (int) $incident->reported_by
            )
            ||
            in_array($user->role, [
                'staff',
                'admin',
                'superadmin',
            ], true);

        if (!$allowed) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load relationships
        |--------------------------------------------------------------------------
        */

        $incident->load([
            'delivery.creator',
            'delivery.driver.driver',
            'reporter.driver',
            'reviewer',
            'classification',
        ]);

        return response()->json([
            'success' =>
                true,

            'incident' =>
                $this->formatIncident($incident),
        ]);
    }


    /**
     * Staff/Admin/Superadmin reviews an incident.
     *
     * PUT:
     * /api/incidents/{incident}/review
     */
    public function review(
        Request $request,
        IncidentReport $incident
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Allowed roles
        |--------------------------------------------------------------------------
        */

        if (!in_array($user->role, [
            'staff',
            'admin',
            'superadmin',
        ], true)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate review
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'status' => [
                'required',
                'in:under_review,resolved',
            ],

            'staff_remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Update incident
        |--------------------------------------------------------------------------
        */

        $incident->update([
            'status' =>
                $validated['status'],

            'staff_remarks' =>
                $validated['staff_remarks'] ?? null,

            'reviewed_by' =>
                $user->id,

            'reviewed_at' =>
                now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Do NOT automatically change delivery status
        |--------------------------------------------------------------------------
        */

        $incident->load([
            'delivery.creator',
            'delivery.driver.driver',
            'reporter.driver',
            'reviewer',
            'classification',
        ]);

        return response()->json([
            'success' =>
                true,

            'message' =>
                'Incident report updated successfully.',

            'incident' =>
                $this->formatIncident($incident),
        ]);
    }


    /**
     * Download incident report as PDF.
     *
     * GET:
     * /api/incidents/{incident}/pdf
     */
    public function pdf(
        Request $request,
        IncidentReport $incident
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Staff/Admin/Superadmin can download.
        | Driver can download own incident.
        |--------------------------------------------------------------------------
        */

        $allowed =
            in_array($user->role, [
                'staff',
                'admin',
                'superadmin',
            ], true)
            ||
            (
                (int) $user->id ===
                (int) $incident->reported_by
            );

        if (!$allowed) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load relationships
        |--------------------------------------------------------------------------
        */

        $incident->load([
            'delivery.creator',
            'delivery.driver.driver',
            'reporter.driver',
            'reviewer',
            'classification',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Generate PDF
        |--------------------------------------------------------------------------
        */

        $pdf = Pdf::loadView(
            'pdf.incident-report',
            [
                'incident' => $incident,
            ]
        );

        $pdf->setPaper(
            'a4',
            'portrait'
        );

        $filename =
            (
                $incident->incident_number
                ?: 'incident-report'
            )
            . '.pdf';

        return $pdf->stream($filename);
    }


    /**
     * Delete incident report.
     *
     * DELETE:
     * /api/incidents/{incident}
     */
    public function destroy(
        Request $request,
        IncidentReport $incident
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Only Admin/Superadmin
        |--------------------------------------------------------------------------
        */

        if (!in_array($user->role, [
            'admin',
            'superadmin',
        ], true)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Delete evidence photo
        |--------------------------------------------------------------------------
        */

        if ($incident->evidence_photo) {
            Storage::disk('public')->delete(
                $incident->evidence_photo
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Delete incident
        |--------------------------------------------------------------------------
        */

        $incident->delete();

        return response()->json([
            'success' =>
                true,

            'message' =>
                'Incident report deleted successfully.',
        ]);
    }


    /**
     * Generate unique incident number.
     *
     * Example:
     * INC-20260905-A7F82K
     */
    private function generateIncidentNumber()
    {
        do {
            $number =
                'INC-' .
                now()->format('Ymd') .
                '-' .
                strtoupper(
                    Str::random(6)
                );

        } while (
            IncidentReport::where(
                'incident_number',
                $number
            )->exists()
        );

        return $number;
    }


    /**
     * Format incident response.
     */
    private function formatIncident(
        IncidentReport $incident
    ) {
        return [

            /*
            |--------------------------------------------------------------------------
            | Basic information
            |--------------------------------------------------------------------------
            */

            'id' =>
                $incident->id,

            'incident_number' =>
                $incident->incident_number,

            'delivery_id' =>
                $incident->delivery_id,

            'reported_by' =>
                $incident->reported_by,

            'incident_classification_id' =>
                $incident->incident_classification_id,

            /*
            |--------------------------------------------------------------------------
            | Classification
            |--------------------------------------------------------------------------
            */

            'incident_type' =>
                $incident
                    ->classification
                    ?->incident_type,

            'department_concerned' =>
                $incident
                    ->classification
                    ?->department,

            'department_email' =>
                $incident
                    ->classification
                    ?->department_email,

            'quantity_required' =>
                $incident
                    ->classification
                    ?->quantity_required
                    ?? false,

            /*
            |--------------------------------------------------------------------------
            | Incident information
            |--------------------------------------------------------------------------
            */

            'quantity_affected' =>
                $incident->quantity_affected,

            'description' =>
                $incident->description,

            'evidence_photo' =>
                $incident->evidence_photo,

            'status' =>
                $incident->status,

            /*
            |--------------------------------------------------------------------------
            | Review information
            |--------------------------------------------------------------------------
            */

            'staff_remarks' =>
                $incident->staff_remarks,

            'reviewed_by' =>
                $incident->reviewed_by,

            'reviewed_at' =>
                $incident->reviewed_at,

            /*
            |--------------------------------------------------------------------------
            | Dates
            |--------------------------------------------------------------------------
            */

            'created_at' =>
                $incident->created_at,

            'updated_at' =>
                $incident->updated_at,

            /*
            |--------------------------------------------------------------------------
            | Relationships
            |--------------------------------------------------------------------------
            */

            'delivery' =>
                $incident->delivery,

            'classification' =>
                $incident->classification,

            'reporter' =>
                $incident->reporter,

            'reviewer' =>
                $incident->reviewer,
        ];
    }
}

