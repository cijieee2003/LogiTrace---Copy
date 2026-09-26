<?php

namespace App\Mail;

use App\Models\IncidentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class IncidentReportedMail extends Mailable
{
    use Queueable, SerializesModels;

    public IncidentReport $incident;

    /**
     * Create a new message instance.
     */
    public function __construct(IncidentReport $incident)
    {
        $this->incident = $incident;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this
            ->subject(
                '[LogiTrace] New Incident Report - ' .
                $this->incident->incident_number
            )
            ->view('emails.incident-reported');
    }
}