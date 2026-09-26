<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <title>LogiTrace Incident Report</title>

    <style>

        /* =========================================================
           PAGE
        ========================================================= */

        @page {
            margin: 28px 35px 30px 35px;
        }

        * {
            box-sizing: border-box;
        }

         body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #111827;
            margin: 0;
            padding: 0;
            line-height: 1.4;
        }


        /* =========================================================
           GENERAL
        ========================================================= */

        .wrap {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .muted {
            color: #6b7280;
        }

        .strong {
            font-weight: bold;
        }


        /* =========================================================
           HEADER
        ========================================================= */

        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .header-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }

        .header-left {
            width: 58%;
            text-align: left;
        }

        .header-right {
            width: 42%;
            text-align: right;
        }

        .brand {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 0.5px;
            color: #1e3a8a;
        }

        .brand-subtitle {
            margin-top: 3px;
            font-size: 8px;
            color: #64748b;
            letter-spacing: 0.3px;
        }

        .report-label {
            margin-top: 8px;
            font-size: 12px;
            font-weight: bold;
            color: #111827;
            letter-spacing: 0.8px;
        }

        .ticket-box {
            display: inline-block;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            padding: 7px 10px;
            min-width: 155px;
            text-align: left;
        }

        .ticket-label {
            font-size: 7px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 3px;
        }

        .ticket-number {
            font-size: 10px;
            font-weight: bold;
            color: #1e3a8a;
        }


        /* =========================================================
           HEADER LINE
        ========================================================= */

        .header-line {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .header-line td {
            border: none;
            padding: 0;
            height: 3px;
        }

        .header-line-main {
            width: 100%;
            background: #1e3a8a;
        }


        /* =========================================================
           INCIDENT INFORMATION
        ========================================================= */

        .incident-information {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 22px;
        }

        .incident-information td {
            border: 1px solid #cbd5e1;
            padding: 6px 7px;
            vertical-align: top;
            font-size: 8.5px;
        }

        .incident-information .section-header {
            height: 21px;
            padding: 5px 7px !important;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #1e3a8a;
            font-size: 8px !important;
            font-weight: bold;
            letter-spacing: 0.5px;
            vertical-align: middle !important;
        }

        .info-label {
            width: 21%;
            background: #f8fafc;
            color: #475569;
            font-weight: bold;
        }

        .info-value {
            width: 29%;
            color: #111827;
        }

        .info-label-right {
            width: 21%;
            background: #f8fafc;
            color: #475569;
            font-weight: bold;
        }

        .info-value-right {
            width: 29%;
            color: #111827;
        }

        .address-label {
            width: 21%;
            height: 45px;
            background: #f8fafc;
            color: #475569;
            font-weight: bold;
        }

        .address-value {
            width: 79%;
            height: 45px;
            color: #111827;
        }

        .classification-value {
            font-weight: bold;
            color: #1e3a8a;
        }

        .email-value {
            color: #334155;
            font-size: 8px;
        }


        /* =========================================================
           TIMESTAMP
        ========================================================= */

        .timestamp-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .timestamp-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 7px;
            height: 17px;
            font-size: 8px;
            vertical-align: middle;
        }

        .timestamp-title {
            height: 21px !important;
            padding: 5px 7px !important;
            background: #f1f5f9;
            color: #1e3a8a;
            font-size: 8px !important;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .timestamp-header {
            background: #f8fafc;
            color: #475569;
            font-weight: bold;
        }

        .timestamp-status {
            width: 40%;
        }

        .timestamp-date {
            width: 30%;
            text-align: center;
        }

        .timestamp-time {
            width: 30%;
            text-align: center;
        }

        .status-name {
            font-weight: bold;
            color: #334155;
        }

        .timestamp-empty {
            color: #94a3b8;
        }

        .status-dot {
            display: inline-block;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #64748b;
            margin-right: 5px;
        }


        /* =========================================================
           DESCRIPTION
        ========================================================= */

        .description-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 22px;
        }

        .description-table td {
            border: 1px solid #cbd5e1;
        }

        .description-header {
            height: 21px;
            padding: 5px 7px !important;
            background: #f1f5f9;
            color: #1e3a8a;
            vertical-align: middle !important;
            font-size: 8px !important;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .description-content {
            height: 105px;
            vertical-align: top !important;
            padding: 9px !important;
            line-height: 1.5;
            font-size: 8.5px;
            color: #1f2937;
        }


        /* =========================================================
           EVIDENCE PHOTO
        ========================================================= */

        .evidence-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .evidence-table td {
            border: 1px solid #cbd5e1;
        }

        .evidence-header {
            height: 21px;
            padding: 5px 7px !important;
            background: #f1f5f9;
            color: #1e3a8a;
            vertical-align: middle !important;
            font-size: 8px !important;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .evidence-content {
            height: 190px;
            padding: 10px !important;
            text-align: center;
            vertical-align: middle !important;
            background: #ffffff;
        }

        .evidence-image {
            max-width: 430px;
            max-height: 170px;
            width: auto;
            height: auto;
        }

        .no-evidence {
            color: #94a3b8;
            font-size: 8px;
        }


        /* =========================================================
           FOOTER
        ========================================================= */

        .footer-note-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .footer-note-table td {
            border: none;
            padding: 0;
            font-size: 7px;
            color: #64748b;
        }

        .footer-note-left {
            width: 70%;
            text-align: left;
        }

        .footer-note-right {
            width: 30%;
            text-align: right;
        }


        /* =========================================================
           SIGNATURE
        ========================================================= */

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-table td {
            border: none;
            padding: 0;
            vertical-align: bottom;
            font-size: 8.5px;
            color: #374151;
        }

        .received-cell {
            width: 70%;
        }

        .date-cell {
            width: 30%;
        }

        .signature-line {
            display: inline-block;
            width: 150px;
            border-bottom: 1px solid #475569;
            height: 13px;
            vertical-align: bottom;
            margin-left: 5px;
        }

        .date-line {
            display: inline-block;
            width: 80px;
            border-bottom: 1px solid #475569;
            height: 13px;
            vertical-align: bottom;
            margin-left: 5px;
        }

    </style>
</head>

<body>

@php

    /*
    |--------------------------------------------------------------------------
    | DELIVERY
    |--------------------------------------------------------------------------
    */

    $delivery = $incident->delivery;


    /*
    |--------------------------------------------------------------------------
    | INCIDENT CLASSIFICATION
    |--------------------------------------------------------------------------
    */

    $classification = $incident->classification;


    /*
    |--------------------------------------------------------------------------
    | INCIDENT CLASSIFICATION NAME
    |--------------------------------------------------------------------------
    */

    $incidentClassification = 'N/A';

    if ($classification) {

        $incidentClassification =
            $classification->incident_type ?? 'N/A';

        if ($incidentClassification !== 'N/A') {

            $incidentClassification = ucwords(
                str_replace(
                    '_',
                    ' ',
                    $incidentClassification
                )
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT CONCERNED
    |--------------------------------------------------------------------------
    */

    $departmentConcerned = 'N/A';

    if ($classification) {

        $departmentConcerned =
            $classification->department ?? 'N/A';
    }


    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT EMAIL
    |--------------------------------------------------------------------------
    */

    $departmentEmail = 'N/A';

    if ($classification) {

        $departmentEmail =
            $classification->department_email ?? 'N/A';
    }


    /*
    |--------------------------------------------------------------------------
    | EVIDENCE PHOTO
    |--------------------------------------------------------------------------
    |
    | evidence_photo contains the path stored by Laravel, for example:
    |
    | incident-reports/example.jpg
    |
    */

    $evidencePhotoPath = null;

    if (!empty($incident->evidence_photo)) {

        $possiblePath = storage_path(
            'app/public/' . $incident->evidence_photo
        );

        if (file_exists($possiblePath)) {

            $evidencePhotoPath = $possiblePath;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | STATUS HISTORY
    |--------------------------------------------------------------------------
    */

    $historyByStatus = collect();

    if ($delivery) {

        $delivery->loadMissing('statusHistories');

        $historyByStatus = $delivery
            ->statusHistories
            ->keyBy('status');
    }


    /*
    |--------------------------------------------------------------------------
    | INCIDENT DATE
    |--------------------------------------------------------------------------
    */

    $incidentDate = 'N/A';

    if ($incident->created_at) {

        $incidentDate = \Carbon\Carbon::parse(
            $incident->created_at
        )
        ->timezone('Asia/Manila')
        ->format('F d, Y');
    }


    /*
    |--------------------------------------------------------------------------
    | INCIDENT TIME
    |--------------------------------------------------------------------------
    */

    $incidentTime = 'N/A';

    if ($incident->created_at) {

        $incidentTime = \Carbon\Carbon::parse(
            $incident->created_at
        )
        ->timezone('Asia/Manila')
        ->format('h:i A');
    }


    /*
    |--------------------------------------------------------------------------
    | DR NUMBER
    |--------------------------------------------------------------------------
    */

    $drNumber =
        $delivery?->dr_number ?? 'N/A';


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER NAME
    |--------------------------------------------------------------------------
    */

    $customerName =
        $delivery?->recipient_name ?? 'N/A';


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER ADDRESS
    |--------------------------------------------------------------------------
    */

    $customerAddress =
        $delivery?->delivery_address ?? 'N/A';


    /*
    |--------------------------------------------------------------------------
    | REPORTED BY
    |--------------------------------------------------------------------------
    */

    $reportedBy = 'N/A';

    if ($incident->reporter) {

        $reportedBy =
            $incident->reporter->username
            ?? $incident->reporter->email
            ?? 'N/A';
    }


    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    $description =
        $incident->description
        ?? 'No description provided.';


    /*
    |--------------------------------------------------------------------------
    | TICKET NUMBER
    |--------------------------------------------------------------------------
    */

    $ticketNumber =
        $incident->incident_number
        ?? 'N/A';


    /*
    |--------------------------------------------------------------------------
    | STATUS DATE HELPER
    |--------------------------------------------------------------------------
    */

    $getStatusDate = function ($status) use ($historyByStatus) {

        if (!$historyByStatus->has($status)) {
            return '';
        }

        $history = $historyByStatus->get($status);

        if (!$history || !$history->changed_at) {
            return '';
        }

        return \Carbon\Carbon::parse(
            $history->changed_at
        )
        ->timezone('Asia/Manila')
        ->format('F d, Y');
    };


    /*
    |--------------------------------------------------------------------------
    | STATUS TIME HELPER
    |--------------------------------------------------------------------------
    */

    $getStatusTime = function ($status) use ($historyByStatus) {

        if (!$historyByStatus->has($status)) {
            return '';
        }

        $history = $historyByStatus->get($status);

        if (!$history || !$history->changed_at) {
            return '';
        }

        return \Carbon\Carbon::parse(
            $history->changed_at
        )
        ->timezone('Asia/Manila')
        ->format('h:i A');
    };

@endphp


<!-- ================================================================
     HEADER
================================================================ -->

<table class="header-table">

    <tr>

        <td class="header-left">

            <div class="brand">
                LogiTrace
            </div>

            <div class="brand-subtitle">
                Delivery Tracking &amp; Incident Reporting
            </div>

            <div class="report-label">
                INCIDENT REPORT
            </div>

        </td>

        <td class="header-right">

            <div class="ticket-box">

                <div class="ticket-label">
                    Ticket Number
                </div>

                <div class="ticket-number">
                    {{ $ticketNumber }}
                </div>

            </div>

        </td>

    </tr>

</table>


<!-- ================================================================
     HEADER LINE
================================================================ -->

<table class="header-line">

    <tr>

        <td class="header-line-main"></td>

    </tr>

</table>


<!-- ================================================================
     INCIDENT INFORMATION
================================================================ -->

<table class="incident-information">

    <tr>

        <td
            colspan="4"
            class="section-header"
        >
            INCIDENT INFORMATION
        </td>

    </tr>


    <!-- DATE / CLASSIFICATION -->

    <tr>

        <td class="info-label">
            Date of Incident
        </td>

        <td class="info-value">
            {{ $incidentDate }}
        </td>

        <td class="info-label-right">
            Incident Classification
        </td>

        <td class="info-value-right">

            <span class="classification-value wrap">
                {{ $incidentClassification }}
            </span>

        </td>

    </tr>


    <!-- TIME / DEPARTMENT -->

    <tr>

        <td class="info-label">
            Time of Incident
        </td>

        <td class="info-value">
            {{ $incidentTime }}
        </td>

        <td class="info-label-right">
            Department Concerned
        </td>

        <td class="info-value-right">

            <span class="wrap">
                {{ $departmentConcerned }}
            </span>

        </td>

    </tr>


    <!-- DR / EMAIL -->

    <tr>

        <td class="info-label">
            DR Number
        </td>

        <td class="info-value">
            {{ $drNumber }}
        </td>

        <td class="info-label-right">
            Department Email
        </td>

        <td class="info-value-right">

            <span class="email-value wrap">
                {{ $departmentEmail }}
            </span>

        </td>

    </tr>


    <!-- CUSTOMER / REPORTER -->

    <tr>

        <td class="info-label">
            Customer Name
        </td>

        <td class="info-value">

            <span class="wrap">
                {{ $customerName }}
            </span>

        </td>

        <td class="info-label-right">
            Reported By
        </td>

        <td class="info-value-right">

            <span class="wrap">
                {{ $reportedBy }}
            </span>

        </td>

    </tr>


    <!-- ADDRESS -->

    <tr>

        <td class="address-label">
            Customer Address
        </td>

        <td
            colspan="3"
            class="address-value"
        >

            <span class="wrap">
                {{ $customerAddress }}
            </span>

        </td>

    </tr>

</table>


<!-- ================================================================
     DELIVERY TIME STAMPS
================================================================ -->

<table class="timestamp-table">

    <tr>

        <td
            colspan="3"
            class="timestamp-title"
        >
            DELIVERY TIME STAMPS
        </td>

    </tr>


    <tr class="timestamp-header">

        <td class="timestamp-status">
            Status
        </td>

        <td class="timestamp-date">
            Date
        </td>

        <td class="timestamp-time">
            Time
        </td>

    </tr>


    <!-- ARRIVAL -->

    <tr>

        <td class="timestamp-status">

            <span class="status-dot"></span>

            <span class="status-name">
                Arrival
            </span>

        </td>

        <td class="timestamp-date">

            @if($getStatusDate('arrival'))
                {{ $getStatusDate('arrival') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

        <td class="timestamp-time">

            @if($getStatusTime('arrival'))
                {{ $getStatusTime('arrival') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

    </tr>


    <!-- QUEUING -->

    <tr>

        <td class="timestamp-status">

            <span class="status-dot"></span>

            <span class="status-name">
                Queuing
            </span>

        </td>

        <td class="timestamp-date">

            @if($getStatusDate('queuing'))
                {{ $getStatusDate('queuing') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

        <td class="timestamp-time">

            @if($getStatusTime('queuing'))
                {{ $getStatusTime('queuing') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

    </tr>


    <!-- UNLOADING -->

    <tr>

        <td class="timestamp-status">

            <span class="status-dot"></span>

            <span class="status-name">
                Unloading
            </span>

        </td>

        <td class="timestamp-date">

            @if($getStatusDate('unloading'))
                {{ $getStatusDate('unloading') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

        <td class="timestamp-time">

            @if($getStatusTime('unloading'))
                {{ $getStatusTime('unloading') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

    </tr>


    <!-- CHECKING -->

    <tr>

        <td class="timestamp-status">

            <span class="status-dot"></span>

            <span class="status-name">
                Checking
            </span>

        </td>

        <td class="timestamp-date">

            @if($getStatusDate('checking'))
                {{ $getStatusDate('checking') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

        <td class="timestamp-time">

            @if($getStatusTime('checking'))
                {{ $getStatusTime('checking') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

    </tr>


    <!-- DELIVERED -->

    <tr>

        <td class="timestamp-status">

            <span class="status-dot"></span>

            <span class="status-name">
                Delivered
            </span>

        </td>

        <td class="timestamp-date">

            @if($getStatusDate('delivered'))
                {{ $getStatusDate('delivered') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

        <td class="timestamp-time">

            @if($getStatusTime('delivered'))
                {{ $getStatusTime('delivered') }}
            @else
                <span class="timestamp-empty">—</span>
            @endif

        </td>

    </tr>

</table>


<!-- ================================================================
     DESCRIPTION OF INCIDENT
================================================================ -->

<table class="description-table">

    <tr>

        <td class="description-header">
            DESCRIPTION OF INCIDENT
        </td>

    </tr>

    <tr>

        <td class="description-content">

            <span class="wrap">
                {{ $description }}
            </span>

        </td>

    </tr>

</table>


<!-- ================================================================
     EVIDENCE PHOTO
================================================================ -->

<!-- <table class="evidence-table">

    <tr>

        <td class="evidence-header">
            EVIDENCE PHOTO
        </td>

    </tr>

    <tr>

        <td class="evidence-content">

            @if($evidencePhotoPath)

                <img
                    src="{{ $evidencePhotoPath }}"
                    class="evidence-image"
                >

            @else

                <span class="no-evidence">
                    No evidence photo attached.
                </span>

            @endif

        </td>

    </tr>

</table> -->


<!-- ================================================================
     FOOTER NOTE
================================================================ -->

<table class="footer-note-table">

    <tr>

        <td class="footer-note-left">
            Generated by LogiTrace Delivery Tracking &amp; Incident Reporting System
        </td>

        <td class="footer-note-right">
            Incident Report
        </td>

    </tr>

</table>


<!-- ================================================================
     SIGNATURE
================================================================ -->

<table class="signature-table">

    <tr>

        <td class="received-cell">

            Received by

            <span class="signature-line"></span>

        </td>

        <td class="date-cell">

            Date

            <span class="date-line"></span>

        </td>

    </tr>

</table>


</body>
</html>