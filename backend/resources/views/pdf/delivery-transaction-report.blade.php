<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Delivery Transaction Report</title>

    <style>
        /* =========================================================
           PAGE
        ========================================================= */

        @page {
            size: A4 landscape;
            margin: 20px 25px 25px 25px;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #111827;
            line-height: 1.4;
            background: #ffffff;
        }

        /* =========================================================
           GENERAL
        ========================================================= */

        .wrap {
            word-wrap: break-word;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

        .muted {
            color: #6b7280;
        }

        .strong {
            font-weight: bold;
        }

        /* =========================================================
           MAIN CONTAINER
        ========================================================= */

        .report-container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
        }

        /* =========================================================
           MAIN HEADER
        ========================================================= */

        .header {
            width: 100%;
            border-bottom: 2px solid #111827;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .header-left {
            width: 55%;
            vertical-align: top;
            padding-right: 15px;
        }

        .header-right {
            width: 45%;
            text-align: right;
            vertical-align: top;
            padding-left: 15px;
        }

        .company-name {
            font-size: 25px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .company-subtitle {
            font-size: 9px;
            color: #637895;
            margin-top: 3px;
        }

        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .report-date {
            font-size: 9px;
            color: #637895;
            margin-top: 4px;
        }

        /* =========================================================
           SECTION TITLE
        ========================================================= */

        .section-title {
            width: 100%;
            background-color: #111827;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            padding: 7px 8px;
            margin-top: 15px;
            margin-bottom: 8px;
            page-break-after: avoid;
        }

        /* =========================================================
           DELIVERY INFORMATION
        ========================================================= */

        .vehicle-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            table-layout: fixed;
        }

        .vehicle-table td {
            border: 1px solid #d1d5db;
            padding: 7px 8px;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

        .vehicle-label {
            width: 15%;
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }

        .vehicle-value {
            width: 35%;
        }

        /* =========================================================
           TRANSACTION TABLE
        ========================================================= */

        .transaction-table-wrapper {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            margin-bottom: 5px;
        }

        .transaction-table {
            width: 100%;
            min-width: 760px;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .transaction-table th {
            background-color: #f3f4f6;
            border: 1px solid #9ca3af;
            padding: 7px 6px;
            font-size: 9px;
            font-weight: bold;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

        .transaction-table td {
            border: 1px solid #d1d5db;
            padding: 7px 6px;
            vertical-align: top;
            font-size: 9px;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            word-break: break-word;
            white-space: normal;
        }

        /* =========================================================
           COLUMN WIDTHS
        ========================================================= */

        .customer-column {
            width: 17%;
        }

        .dr-column {
            width: 12%;
        }

        .quantity-column {
            width: 8%;
            text-align: center;
        }

        .address-column {
            width: 25%;
        }

        .time-column {
            width: 11%;
            text-align: center;
        }

        .remarks-column {
            width: 27%;
        }

        .quantity {
            text-align: center;
        }

        .delivery-time {
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
        }

        /* =========================================================
           REMARKS
        ========================================================= */

        .no-incident {
            color: #6b7280;
            font-style: italic;
        }

        .incident-remark {
            color: #991b1b;
            font-weight: bold;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

        /* =========================================================
           TRANSACTION GROUP
        ========================================================= */

        .group-container {
            width: 100%;
            margin-bottom: 18px;
            page-break-inside: avoid;
        }

        .group-number {
            font-size: 9px;
            color: #637895;
            margin-bottom: 4px;
        }

        /* =========================================================
           SIGNATURE
        ========================================================= */

        .signature-section {
            width: 100%;
            margin-top: 35px;
            page-break-inside: avoid;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .signature-table td {
            width: 50%;
            padding: 10px 30px 0 30px;
            vertical-align: top;
        }

        .signature-line {
            border-top: 1px solid #111827;
            margin-top: 35px;
            padding-top: 5px;
            text-align: center;
            font-size: 9px;
        }

        .signature-label {
            text-align: center;
            color: #637895;
            font-size: 8px;
            margin-top: 2px;
        }

        /* =========================================================
           FOOTER
        ========================================================= */

        .footer {
            position: fixed;
            bottom: -15px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #6b7280;
        }

        /* =========================================================
           TABLET
        ========================================================= */

        @media screen and (max-width: 900px) {

            body {
                font-size: 9px;
                padding: 12px;
            }

            .report-container {
                width: 100%;
            }

            .company-name {
                font-size: 22px;
            }

            .report-title {
                font-size: 14px;
            }

            .transaction-table {
                min-width: 720px;
            }

            .transaction-table th,
            .transaction-table td {
                font-size: 8px;
                padding: 6px 5px;
            }

            .vehicle-table td {
                padding: 6px;
            }
        }

        /* =========================================================
           MOBILE
        ========================================================= */

        @media screen and (max-width: 768px) {

            body {
                font-size: 9px;
                padding: 8px;
            }

            /* HEADER */

            .header {
                padding-bottom: 8px;
                margin-bottom: 12px;
            }

            .header-table,
            .header-table tbody,
            .header-table tr {
                display: block;
                width: 100%;
            }

            .header-left,
            .header-right {
                display: block;
                width: 100%;
                padding: 0;
                text-align: left;
            }

            .header-right {
                margin-top: 10px;
            }

            .company-name {
                font-size: 22px;
            }

            .company-subtitle {
                font-size: 8px;
            }

            .report-title {
                font-size: 14px;
                margin-top: 0;
            }

            .report-date {
                font-size: 8px;
            }

            /* SECTION */

            .section-title {
                font-size: 9px;
                padding: 6px 7px;
                margin-top: 12px;
                margin-bottom: 6px;
            }

            /* DELIVERY INFORMATION */

            .vehicle-table,
            .vehicle-table tbody,
            .vehicle-table tr {
                display: block;
                width: 100%;
            }

            .vehicle-table {
                table-layout: auto;
            }

            .vehicle-table tr {
                margin-bottom: 0;
            }

            .vehicle-table td {
                display: block;
                width: 100%;
                padding: 6px 7px;
            }

            .vehicle-label {
                font-size: 8px;
                padding-bottom: 3px !important;
            }

            .vehicle-value {
                font-size: 9px;
                padding-top: 4px !important;
                margin-bottom: 2px;
            }

            /* TRANSACTION TABLE */

            .transaction-table-wrapper {
                width: 100%;
                max-width: 100%;
                overflow-x: auto;
                overflow-y: hidden;
                border: 1px solid #d1d5db;
                border-radius: 4px;
            }

            .transaction-table {
                min-width: 760px;
                width: 760px;
            }

            .transaction-table th {
                font-size: 8px;
                padding: 6px 5px;
            }

            .transaction-table td {
                font-size: 8px;
                padding: 6px 5px;
            }

            .group-container {
                margin-bottom: 15px;
            }

            .group-number {
                font-size: 8px;
            }

            /* SIGNATURES */

            .signature-section {
                margin-top: 25px;
            }

            .signature-table,
            .signature-table tbody,
            .signature-table tr {
                display: block;
                width: 100%;
            }

            .signature-table td {
                display: block;
                width: 100%;
                padding: 10px 15px 0 15px;
            }

            .signature-line {
                margin-top: 25px;
                font-size: 8px;
            }

            .signature-label {
                font-size: 7px;
            }
        }

        /* =========================================================
           SMALL MOBILE
        ========================================================= */

        @media screen and (max-width: 480px) {

            body {
                font-size: 8px;
                padding: 5px;
            }

            .company-name {
                font-size: 20px;
            }

            .company-subtitle {
                font-size: 7px;
            }

            .report-title {
                font-size: 12px;
            }

            .report-date {
                font-size: 7px;
            }

            .section-title {
                font-size: 8px;
                padding: 5px 6px;
            }

            .vehicle-table td {
                padding: 5px 6px;
            }

            .vehicle-label {
                font-size: 7px;
            }

            .vehicle-value {
                font-size: 8px;
            }

            .transaction-table {
                min-width: 700px;
                width: 700px;
            }

            .transaction-table th,
            .transaction-table td {
                font-size: 7px;
                padding: 5px 4px;
            }

            .group-number {
                font-size: 7px;
            }

            .signature-table td {
                padding-left: 10px;
                padding-right: 10px;
            }

            .footer {
                font-size: 7px;
            }
        }

        /* =========================================================
           PRINT / PDF
        ========================================================= */

        @media print {

            html,
            body {
                width: 100%;
                max-width: 100%;
            }

            body {
                padding: 0;
                margin: 0;
                background: #ffffff;
            }

            .report-container {
                width: 100%;
                max-width: 100%;
            }

            .transaction-table-wrapper {
                width: 100%;
                max-width: 100%;
                overflow: visible;
                border: none;
            }

            .transaction-table {
                width: 100%;
                min-width: 0;
                table-layout: fixed;
            }

            .transaction-table th,
            .transaction-table td {
                font-size: 8px;
                padding: 5px 4px;
                word-break: break-word;
                overflow-wrap: anywhere;
            }

            .header-left {
                width: 55%;
            }

            .header-right {
                width: 45%;
            }

            .vehicle-label {
                width: 15%;
            }

            .vehicle-value {
                width: 35%;
            }

            .vehicle-table td {
                word-break: break-word;
                overflow-wrap: anywhere;
            }

            .signature-table {
                display: table;
                width: 100%;
            }

            .signature-table tbody,
            .signature-table tr {
                display: table-row-group;
            }

            .signature-table tr {
                display: table-row;
            }

            .signature-table td {
                display: table-cell;
                width: 50%;
            }

            .group-container {
                page-break-inside: avoid;
            }

            .section-title {
                page-break-after: avoid;
            }

            .transaction-table thead {
                display: table-header-group;
            }

            .transaction-table tr {
                page-break-inside: avoid;
            }

            .footer {
                position: fixed;
            }
        }
    </style>
</head>

<body>

    <div class="report-container">

        {{-- ============================================================
            MAIN HEADER
        ============================================================ --}}

        <div class="header">

            <table class="header-table">

                <tr>

                    <td class="header-left">

                        <div class="company-name">
                            LogiTrace
                        </div>

                        <div class="company-subtitle">
                            Delivery Tracking &amp; Incident Reporting
                        </div>

                    </td>

                    <td class="header-right">

                        <div class="report-title">
                            DELIVERY TRANSACTION REPORT
                        </div>

                        <div class="report-date">
                            Generated:
                            {{ now()->timezone('Asia/Manila')->format('F d, Y h:i A') }}
                        </div>

                    </td>

                </tr>

            </table>

        </div>


        {{-- ============================================================
            GROUP DELIVERIES
        ============================================================ --}}

        @php

            $deliveryGroups = $deliveries->groupBy(function ($delivery) {

                $driver = $delivery->driver;

                $driverInfo = $driver?->driverInfo;

                $truckName = $driverInfo?->truck_name ?? 'N/A';

                $plateNumber =
                    $driverInfo?->truck_plate_number ?? 'N/A';

                $deliveryDate = $delivery->delivery_date
                    ? \Carbon\Carbon::parse(
                        $delivery->delivery_date
                    )
                        ->timezone('Asia/Manila')
                        ->format('Y-m-d')
                    : 'N/A';

                return implode('|', [
                    $delivery->driver_id ?? 'no-driver',
                    $truckName,
                    $plateNumber,
                    $deliveryDate,
                ]);
            });

            $groupIndex = 0;

        @endphp


        {{-- ============================================================
            DELIVERY GROUPS
        ============================================================ --}}

        @foreach ($deliveryGroups as $group)

            @php

                $groupIndex++;

                $firstDelivery = $group->first();

                $driver = $firstDelivery?->driver;

                $driverInfo = $driver?->driverInfo;


                /*
                |--------------------------------------------------------------------------
                | DRIVER NAME
                |--------------------------------------------------------------------------
                */

                $driverName = 'N/A';

                if ($driverInfo) {

                    $nameParts = [
                        $driverInfo->first_name,
                        $driverInfo->middle_name,
                        $driverInfo->last_name,
                    ];

                    $nameParts = array_filter(
                        $nameParts,
                        fn($name) =>
                            !is_null($name) &&
                            trim($name) !== ''
                    );

                    $nameParts = array_map(
                        fn($name) => trim($name),
                        $nameParts
                    );

                    $driverName = implode(
                        ' ',
                        $nameParts
                    );

                    if ($driverName === '') {
                        $driverName = 'N/A';
                    }
                }

                if (
                    $driverName === 'N/A' &&
                    $driver
                ) {
                    $driverName =
                        $driver->username ?? 'N/A';
                }


                /*
                |--------------------------------------------------------------------------
                | TRUCK INFORMATION
                |--------------------------------------------------------------------------
                */

                $truckName =
                    $driverInfo?->truck_name ?? 'N/A';

                $plateNumber =
                    $driverInfo?->truck_plate_number ?? 'N/A';


                /*
                |--------------------------------------------------------------------------
                | DELIVERY DATE
                |--------------------------------------------------------------------------
                */

                $deliveryDate =
                    $firstDelivery?->delivery_date
                        ? \Carbon\Carbon::parse(
                            $firstDelivery->delivery_date
                        )
                            ->timezone('Asia/Manila')
                            ->format('F d, Y')
                        : 'N/A';

            @endphp


            <div class="group-container">

                {{-- ====================================================
                    DELIVERY INFORMATION
                ===================================================== --}}

                <div class="group-number">
                    Transaction Group #{{ $groupIndex }}
                </div>

                <div class="section-title">
                    DELIVERY INFORMATION
                </div>

                <table class="vehicle-table">

                    <tr>

                        <td class="vehicle-label">
                            Truck Name
                        </td>

                        <td class="vehicle-value wrap">
                            {{ $truckName }}
                        </td>

                        <td class="vehicle-label">
                            Driver Name
                        </td>

                        <td class="vehicle-value wrap">
                            {{ $driverName }}
                        </td>

                    </tr>

                    <tr>

                        <td class="vehicle-label">
                            Plate Number
                        </td>

                        <td class="vehicle-value wrap">
                            {{ $plateNumber }}
                        </td>

                        <td class="vehicle-label">
                            Delivery Date
                        </td>

                        <td class="vehicle-value wrap">
                            {{ $deliveryDate }}
                        </td>

                    </tr>

                </table>


                {{-- ====================================================
                    DELIVERY TRANSACTIONS
                ===================================================== --}}

                <div class="section-title">
                    DELIVERY TRANSACTIONS
                </div>

                <div class="transaction-table-wrapper">

                    <table class="transaction-table">

                        <thead>

                            <tr>

                                <th class="customer-column">
                                    Customer Name
                                </th>

                                <th class="dr-column">
                                    D.R. Number
                                </th>

                                <th class="quantity-column">
                                    Quantity
                                </th>

                                <th class="address-column">
                                    Customer Address
                                </th>

                                <th class="time-column">
                                    Time
                                </th>

                                <th class="remarks-column">
                                    Remarks
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            @foreach ($group as $delivery)

                                @php

                                    $customerName =
                                        $delivery->recipient_name ?? 'N/A';

                                    $drNumber =
                                        $delivery->dr_number ?? 'N/A';

                                    $quantity =
                                        $delivery->quantity_order ?? 0;

                                    $customerAddress =
                                        $delivery->delivery_address ?? 'N/A';


                                    /*
                                    |--------------------------------------------------------------------------
                                    | DELIVERY TIME
                                    |--------------------------------------------------------------------------
                                    */

                                    $deliveryTime = 'N/A';

                                    $statusHistories =
                                        $delivery->statusHistories
                                        ?? $delivery->status_histories
                                        ?? collect();

                                    $deliveredHistory = collect(
                                        $statusHistories
                                    )
                                        ->where(
                                            'status',
                                            'delivered'
                                        )
                                        ->sortByDesc(
                                            'changed_at'
                                        )
                                        ->first();

                                    if (
                                        $deliveredHistory &&
                                        !empty(
                                            $deliveredHistory->changed_at
                                        )
                                    ) {

                                        $deliveryTime =
                                            \Carbon\Carbon::parse(
                                                $deliveredHistory->changed_at
                                            )
                                                ->timezone('Asia/Manila')
                                                ->format('h:i A');
                                    }


                                    /*
                                    |--------------------------------------------------------------------------
                                    | INCIDENT
                                    |--------------------------------------------------------------------------
                                    */

                                    $incident =
                                        $delivery->incidentReports
                                            ->sortByDesc('created_at')
                                            ->first();

                                    $incidentType =
                                        $incident?->classification?->incident_type;

                                @endphp

                                <tr>

                                    <td class="wrap">
                                        {{ $customerName }}
                                    </td>

                                    <td class="wrap">
                                        {{ $drNumber }}
                                    </td>

                                    <td class="quantity">
                                        {{ $quantity }}
                                    </td>

                                    <td class="wrap">
                                        {{ $customerAddress }}
                                    </td>

                                    <td class="delivery-time">
                                        {{ $deliveryTime }}
                                    </td>

                                    <td class="wrap">

                                        @if (
                                            $incident &&
                                            $incident->classification
                                        )

                                            <span class="incident-remark">
                                                {{ $incident->classification->incident_type }}
                                            </span>

                                        @else

                                            <span class="no-incident">
                                                Delivery completed successfully without any incidents.
                                            </span>

                                        @endif

                                    </td>

                                </tr>

                            @endforeach

                        </tbody>

                    </table>

                </div>

            </div>

        @endforeach


        {{-- ============================================================
            SIGNATURES
        ============================================================ --}}

        <div class="signature-section">

            <table class="signature-table">

                <tr>

                    <td>

                        <div class="signature-line">
                            Received By
                        </div>

                        <div class="signature-label">
                            Staff / Admin
                        </div>

                    </td>

                    <td>

                        <div class="signature-line">
                            Checked By
                        </div>

                        <div class="signature-label">
                            Authorized Personnel
                        </div>

                    </td>

                </tr>

            </table>

        </div>

    </div>


    {{-- ============================================================
        FOOTER
    ============================================================ --}}

    <div class="footer">

        LogiTrace &mdash;
        Delivery Tracking &amp; Incident Reporting

        &nbsp; | &nbsp;

        Generated
        {{ now()->timezone('Asia/Manila')->format('F d, Y h:i A') }}

    </div>

</body>

</html>