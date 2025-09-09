<?php

namespace App\Services;

use App\Events\TelemetryStatusUpdated;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TelemetryStatusService
{
    private const CACHE_KEY = 'telemetry.last_data_time';
    private const TIMEOUT_SECONDS = 5; // 5 seconds timeout
    private const STATUS_ACTIVE = 'active';
    private const STATUS_INACTIVE = 'inactive';

    /**
     * Update the last data received timestamp
     */
    public function updateLastDataTime(): void
    {
        $now = now();
        Cache::put(self::CACHE_KEY, $now->toISOString(), 3600); // Cache for 1 hour

        Log::debug('Telemetry last data time updated', [
            'timestamp' => $now->toISOString()
        ]);

        // Broadcast active status
        event(new TelemetryStatusUpdated(self::STATUS_ACTIVE, $now->toISOString()));
    }

    /**
     * Check if telemetry data is active (received within timeout period)
     */
    public function isActive(): bool
    {
        $lastDataTime = Cache::get(self::CACHE_KEY);

        if (!$lastDataTime) {
            return false;
        }

        $lastTime = Carbon::parse($lastDataTime);
        $secondsSinceLastData = now()->diffInSeconds($lastTime);

        return $secondsSinceLastData <= self::TIMEOUT_SECONDS;
    }

    /**
     * Get the current status
     */
    public function getStatus(): array
    {
        $lastDataTime = Cache::get(self::CACHE_KEY);
        $isActive = $this->isActive();

        return [
            'status' => $isActive ? self::STATUS_ACTIVE : self::STATUS_INACTIVE,
            'last_data_time' => $lastDataTime,
            'is_active' => $isActive,
        ];
    }

    /**
     * Start monitoring for timeout (to be called periodically)
     */
    public function checkTimeout(): void
    {
        $status = $this->getStatus();

        if (!$status['is_active'] && $status['last_data_time']) {
            Log::info('Telemetry timeout detected', [
                'last_data_time' => $status['last_data_time'],
                'timeout_seconds' => self::TIMEOUT_SECONDS
            ]);

            // Broadcast inactive status
            event(new TelemetryStatusUpdated(
                self::STATUS_INACTIVE,
                $status['last_data_time']
            ));
        }
    }
}
