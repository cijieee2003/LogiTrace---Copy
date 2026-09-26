<?php

namespace App\Support;

use App\Models\AdminHistory;
use App\Models\User;

class AdminHistoryLogger
{
    public static function log(
        ?User $user,
        string $module,
        string $action,
        string $description,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): AdminHistory {
        return AdminHistory::create([
            'user_id' => $user?->id,

            'module' => $module,

            'action' => $action,

            'reference_type' => $referenceType,

            'reference_id' => $referenceId,

            'description' => $description,

            'old_values' => $oldValues,

            'new_values' => $newValues,
        ]);
    }
}