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

    public function historyApi(Request $request)
    {
        $data = $request->validate([
            'start' => 'nullable|date',
            'end' => 'nullable|date',
            'resolution' => 'nullable|in:raw,1s,10s',
        ]);

        $start = isset($data['start']) ? Carbon::parse($data['start']) : Carbon::now()->subHour();
        $end = isset($data['end']) ? Carbon::parse($data['end']) : Carbon::now();
        $resolution = $data['resolution'] ?? '1s';

        if ($resolution === 'raw') {
            $points = DB::table('telemetry_raw')
                ->select([
                    'ts as t',
                    'latitude as lat',
                    'longitude as lng',
                    'speed_kmh as speed',
                    'current_a as current',
                    'voltage_v as voltage',
                    'rpm_motor',
                    'esc_temp',
                    'batt_temp',
                    'motor_temp',
                ])
                ->whereBetween('ts', [$start, $end])
                ->orderBy('ts')
                ->limit(100000)
                ->get();
        } else {
            $table = 'telemetry_'.$resolution;
            $points = DB::table($table)
                ->select([
                    'bucket as t',
                    DB::raw('NULL::double precision as lat'),
                    DB::raw('NULL::double precision as lng'),
                    'speed_kmh_avg as speed',
                    'current_a_avg as current',
                    'voltage_v_avg as voltage',
                    'rpm_motor_avg as rpm_motor',
                    'esc_temp_avg as esc_temp',
                    'batt_temp_avg as batt_temp',
                    'motor_temp_avg as motor_temp',
                ])
                ->whereBetween('bucket', [$start, $end])
                ->orderBy('bucket')
                ->get();
        }

        return response()->json(['points' => $points]);
    }
}
