<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TelemetryController extends Controller
{
    public function live()
    {
        return Inertia::render('LiveDashboard');
    }

    public function history()
    {
        return Inertia::render('HistoryDashboard');
    }

    public function historyApi(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|string',
            'start' => 'nullable|date',
            'end' => 'nullable|date',
            'resolution' => 'nullable|in:raw,1s,10s',
        ]);

        $vehicleId = $data['vehicle_id'];
        $start = isset($data['start']) ? Carbon::parse($data['start']) : Carbon::now()->subHour();
        $end = isset($data['end']) ? Carbon::parse($data['end']) : Carbon::now();
        $resolution = $data['resolution'] ?? '1s';

        $table = $resolution === 'raw' ? 'telemetry_raw' : 'telemetry_'.$resolution;

        $query = DB::table($table)
            ->select([
                'ts as t',
                'lat',
                'lng',
                'kecepatan as speed',
                'arus as current',
                'tegangan as voltage',
                'rpm_motor',
                'suhu_esc as esc_temp',
                'suhu_baterai as batt_temp',
                'suhu_motor as motor_temp',
            ])
            ->where('vehicle_id', $vehicleId)
            ->whereBetween('ts', [$start, $end])
            ->orderBy('ts');

        if ($table === 'telemetry_raw') {
            $query->limit(100000);
        }

        $points = $query->get();

        return response()->json(['points' => $points]);
    }
}
