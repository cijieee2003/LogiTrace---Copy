<!DOCTYPE html>
<html>

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>LogiTrace Incident Report</title>

</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f1f5f9;
        font-family: Arial, Helvetica, sans-serif;
    "
>

    {{-- ========================================================= --}}
    {{-- MAIN CONTAINER --}}
    {{-- ========================================================= --}}

    <div
        style="
            width: 100%;
            padding: 30px 0;
            background-color: #f1f5f9;
        "
    >

        <div
            style="
                max-width: 700px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                overflow: hidden;
            "
        >

            {{-- ================================================= --}}
            {{-- HEADER --}}
            {{-- ================================================= --}}

            <div
                style="
                    background-color: #1d4ed8;
                    padding: 25px;
                    text-align: center;
                "
            >

                <h1
                    style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 26px;
                        font-weight: bold;
                    "
                >
                    LogiTrace
                </h1>

                <p
                    style="
                        margin: 7px 0 0;
                        color: #dbeafe;
                        font-size: 13px;
                    "
                >
                    Delivery Tracking & Incident Reporting
                </p>

            </div>


            {{-- ================================================= --}}
            {{-- CONTENT --}}
            {{-- ================================================= --}}

            <div
                style="
                    padding: 30px;
                "
            >

                {{-- TITLE --}}

                <h2
                    style="
                        margin: 0 0 10px;
                        color: #0f172a;
                        font-size: 22px;
                    "
                >
                    New Incident Report
                </h2>


                <p
                    style="
                        margin: 0 0 25px;
                        color: #475569;
                        font-size: 14px;
                        line-height: 1.6;
                    "
                >
                    A new delivery incident has been reported
                    through the LogiTrace system.

                    Please review the incident details below.
                </p>


                {{-- ================================================= --}}
                {{-- INCIDENT NUMBER --}}
                {{-- ================================================= --}}

                <div
                    style="
                        margin-bottom: 25px;
                        padding: 16px;
                        background-color: #eff6ff;
                        border-left: 4px solid #2563eb;
                    "
                >

                    <div
                        style="
                            color: #64748b;
                            font-size: 11px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        "
                    >
                        Incident Number
                    </div>

                    <div
                        style="
                            margin-top: 6px;
                            color: #1d4ed8;
                            font-size: 18px;
                            font-weight: bold;
                        "
                    >
                        {{ $incident->incident_number }}
                    </div>

                </div>


                {{-- ================================================= --}}
                {{-- INCIDENT INFORMATION --}}
                {{-- ================================================= --}}

                <h3
                    style="
                        margin: 0 0 12px;
                        color: #0f172a;
                        font-size: 16px;
                    "
                >
                    Incident Information
                </h3>


                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 25px;
                    "
                >

                    {{-- Incident Type --}}

                    <tr>

                        <td
                            style="
                                width: 40%;
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Incident Type
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->classification?->incident_type ?? 'N/A' }}
                        </td>

                    </tr>


                    {{-- Department --}}

                    <tr>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Department Concerned
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->classification?->department ?? 'N/A' }}
                        </td>

                    </tr>


                    {{-- Department Email --}}

                    <tr>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Department Email
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->classification?->department_email ?? 'N/A' }}
                        </td>

                    </tr>


                    {{-- D.R. Number --}}

                    <tr>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            D.R. Number
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->delivery?->dr_number ?? 'N/A' }}
                        </td>

                    </tr>


                    {{-- Customer Name --}}

                    <tr>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Customer Name
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->delivery?->recipient_name ?? 'N/A' }}
                        </td>

                    </tr>

                    {{-- Customer Address --}}

                    <tr>
                        
                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Customer Address
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->delivery?->delivery_address ?? 'N/A' }}
                        </td>
                    </tr>


                    {{-- Quantity --}}

                    <tr>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Quantity Affected
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->quantity_affected ?? 'N/A' }}
                        </td>

                    </tr>


                    {{-- Reported By --}}

                    <tr>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Reported By
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->reporter?->username ?? 'N/A' }}
                        </td>

                    </tr>



                    {{-- Date --}}

                    <tr>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                                color: #334155;
                                font-size: 13px;
                                font-weight: bold;
                            "
                        >
                            Reported Date
                        </td>

                        <td
                            style="
                                padding: 10px;
                                border: 1px solid #e2e8f0;
                                color: #475569;
                                font-size: 13px;
                            "
                        >
                            {{ $incident->created_at?->format('F d, Y h:i A') ?? 'N/A' }}
                        </td>

                    </tr>

                </table>


                {{-- ================================================= --}}
                {{-- DESCRIPTION --}}
                {{-- ================================================= --}}

                <h3
                    style="
                        margin: 0 0 12px;
                        color: #0f172a;
                        font-size: 16px;
                    "
                >
                    Incident Description
                </h3>


                <div
                    style="
                        padding: 16px;
                        background-color: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        color: #334155;
                        font-size: 13px;
                        line-height: 1.7;
                    "
                >

                    {!! nl2br(e($incident->description)) !!}

                </div>


                {{-- ================================================= --}}
                {{-- EVIDENCE PHOTO --}}
                {{-- ================================================= --}}

                {{-- 
                    Evidence photo section can be added here
                    if the incident has an uploaded photo.
                --}}


                {{-- ================================================= --}}
                {{-- ACTION NOTICE --}}
                {{-- ================================================= --}}

                <div
                    style="
                        margin-top: 30px;
                        padding: 16px;
                        background-color: #fef3c7;
                        border: 1px solid #fde68a;
                        border-radius: 6px;
                    "
                >

                    <p
                        style="
                            margin: 0;
                            color: #92400e;
                            font-size: 13px;
                            line-height: 1.6;
                        "
                    >
                        Please review this incident and take the necessary
                        action according to your department's procedures.
                    </p>

                </div>

            </div>


            {{-- ================================================= --}}
            {{-- FOOTER --}}
            {{-- ================================================= --}}

            <div
                style="
                    padding: 20px;
                    background-color: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                "
            >

                <p
                    style="
                        margin: 0;
                        color: #94a3b8;
                        font-size: 11px;
                    "
                >
                    This is an automated email from LogiTrace.
                </p>

                <p
                    style="
                        margin: 6px 0 0;
                        color: #94a3b8;
                        font-size: 11px;
                    "
                >
                    Please do not reply directly to this email.
                </p>

            </div>

        </div>

    </div>

</body>

</html>