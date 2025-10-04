<?php

namespace App\Http\Controllers;

use App\Services\TelemetryStatusService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TelemetryController extends Controller
{
    protected TelemetryStatusService $statusService;

    public function __construct(TelemetryStatusService $statusService)
    {
        $this->statusService = $statusService;
    }

    public function live()
    {
        return Inertia::render('LiveDashboard');
    }

    public function overview()
    {
        // Get the latest snapshot from raw telemetry (adjust table/columns if needed)
        $latest = DB::table('telemetry_raw')
            ->select([
                'ts',
                'latitude as lat',
                'longitude as lng',
                'speed_kmh',
                'current_a',
                'esc_temp',
            ])
            ->orderByDesc('ts')
            ->first();

        // Last 60 samples (or fallback to 0) for sparklines
        $history = DB::table('telemetry_raw')
            ->select(['current_a', 'esc_temp'])
            ->orderByDesc('ts')
            ->limit(60)
            ->get();

        $currentHistory = $history->pluck('current_a')->reverse()->values();
        $escTempHistory = $history->pluck('esc_temp')->reverse()->values();

        return Inertia::render('Telemetry/Overview', [
            'telemetry' => [
                'speed_kmh' => $latest->speed_kmh ?? 0,
                'current_a' => $latest->current_a ?? 0,
                'suhu_esc' => $latest->esc_temp ?? 0,
                'lat' => $latest->lat ?? 0,
                'lng' => $latest->lng ?? 0,
                'current_history' => $currentHistory,
                'suhu_esc_history' => $escTempHistory,
            ],
        ]);
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
            $table = 'telemetry_' . $resolution;
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

    public function history()
    {
        // Client will fetch history via /api/telemetry/history; render the page shell
        return Inertia::render('Telemetry/History');
    }

    public function maps()
    {
        return Inertia::render('Maps');
    }

    public function status()
    {
        return response()->json($this->statusService->getStatus());
    }
}
