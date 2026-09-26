<?php

namespace App\Notifications;

use App\Models\IncidentClassificationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewIncidentClassificationRequestNotification extends Notification
{
    use Queueable;

    public IncidentClassificationRequest $incidentRequest;

    public function __construct(
        IncidentClassificationRequest $incidentRequest
    ) {
        $this->incidentRequest = $incidentRequest;

        $this->incidentRequest->loadMissing([
            'requester',
        ]);
    }

    public function via(object $notifiable): array
    {
        return [
            'database',
            'mail',
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'incident_classification_request',

            'title' => 'New Incident Classification Request',

            'message' =>
                'Driver ' .
                ($this->incidentRequest->requester?->username ?? 'Unknown Driver') .
                ' requested a new incident classification.',

            'incident_classification_request_id' =>
                $this->incidentRequest->id,

            'incident_type' =>
                $this->incidentRequest->incident_type,

            'requested_by' =>
                $this->incidentRequest->requested_by,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(
                '[LogiTrace] New Incident Classification Request'
            )
            ->greeting('Hello Administrator,')
            ->line(
                'A driver has requested a new incident classification.'
            )
            ->line(
                'Driver: ' .
                ($this->incidentRequest->requester?->username ?? 'Unknown')
            )
            ->line(
                'Incident Type: ' .
                $this->incidentRequest->incident_type
            )
            ->line(
                'Reason: ' .
                $this->incidentRequest->reason
            )
            ->action(
                'Review Request',
                config('app.url') .
                '/admin/incident-classification-requests'
            )
            ->line(
                'Please review this request in the LogiTrace administrator panel.'
            );
    }
}