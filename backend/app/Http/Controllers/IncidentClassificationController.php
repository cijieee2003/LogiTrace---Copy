<?php

namespace App\Http\Controllers;

use App\Models\IncidentClassification;
use Illuminate\Http\Request;

class IncidentClassificationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL CLASSIFICATIONS
    |--------------------------------------------------------------------------
    | Admin and driver can view classifications.
    */

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin' && $user->role !== 'driver') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $classifications = IncidentClassification::latest()->get();

        return response()->json([
            'success' => true,
            'classifications' => $classifications,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE CLASSIFICATION
    |--------------------------------------------------------------------------
    | Only admin can create.
    */

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can create incident classifications.',
            ], 403);
        }

        $validated = $request->validate([
            'incident_type' => [
                'required',
                'string',
                'max:100',
                'unique:incident_classifications,incident_type',
            ],

            'department' => [
                'required',
                'string',
                'max:255',
            ],

            'department_email' => [
                'required',
                'email',
                'max:255',
            ],

            /*
             * TRUE:
             * Driver must enter quantity affected.
             *
             * FALSE:
             * Quantity is not applicable.
             */
            'quantity_required' => [
                'required',
                'boolean',
            ],
        ]);

        $classification = IncidentClassification::create([
    'incident_type' => $validated['incident_type'],
    'department' => $validated['department'],
    'department_email' => $validated['department_email'],
    'quantity_required' => $validated['quantity_required'],
]);

        return response()->json([
            'success' => true,
            'message' => 'Incident classification created successfully.',
            'classification' => $classification,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE CLASSIFICATION
    |--------------------------------------------------------------------------
    | Admin and driver can view.
    */

    public function show(
        Request $request,
        IncidentClassification $incidentClassification
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin' && $user->role !== 'driver') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'classification' => $incidentClassification,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE CLASSIFICATION
    |--------------------------------------------------------------------------
    | Only admin can update.
    */

    public function update(
        Request $request,
        IncidentClassification $incidentClassification
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can update incident classifications.',
            ], 403);
        }

        $validated = $request->validate([
    'incident_type' => [
        'required',
        'string',
        'max:100',
        'unique:incident_classifications,incident_type,' .
        $incidentClassification->id,
    ],

    'department' => [
        'required',
        'string',
        'max:255',
    ],

    'department_email' => [
        'required',
        'email',
        'max:255',
    ],

    'quantity_required' => [
        'required',
        'boolean',
    ],
]);

       $incidentClassification->update([
    'incident_type' => $validated['incident_type'],
    'department' => $validated['department'],
    'department_email' => $validated['department_email'],
    'quantity_required' => $validated['quantity_required'],
]);

        return response()->json([
            'success' => true,
            'message' => 'Incident classification updated successfully.',
            'classification' => $incidentClassification->fresh(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE CLASSIFICATION
    |--------------------------------------------------------------------------
    | Only admin can delete.
    */

    public function destroy(
        Request $request,
        IncidentClassification $incidentClassification
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

        $hasIncidentReports = $incidentClassification
            ->incidentReports()
            ->exists();

        if ($hasIncidentReports) {
            return response()->json([
                'message' =>
                    'This incident classification cannot be deleted because it is already being used by incident reports.',
            ], 409);
        }

        $incidentClassification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Incident classification deleted successfully.',
        ]);
    }
}

