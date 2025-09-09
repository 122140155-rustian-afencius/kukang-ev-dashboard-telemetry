<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\TelemetryStatusUpdated;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TelemetryStatusService
{
    private const STATUS_ACTIVE = 'active';
    private const STATUS_INACTIVE = 'inactive';

    /**
     * Update the last data received timestamp
     */
    public function updateLastDataTime(): void
    {
        $now = now();
        $cacheKey = (string) config('telemetry.status_cache_key', 'telemetry.last_data_time');
        Cache::put($cacheKey, $now->toISOString(), 3600); // Cache for 1 hour

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
        $cacheKey = (string) config('telemetry.status_cache_key', 'telemetry.last_data_time');
        $lastDataTime = Cache::get($cacheKey);

        if (!$lastDataTime) {
            return false;
        }

        $lastTime = Carbon::parse($lastDataTime);
        $secondsSinceLastData = now()->diffInSeconds($lastTime);

        $timeout = (int) config('telemetry.status_timeout_seconds', 5);
        return $secondsSinceLastData <= $timeout;
    }

    /**
     * Get the current status
     */
    public function getStatus(): array
    {
        $cacheKey = (string) config('telemetry.status_cache_key', 'telemetry.last_data_time');
        $lastDataTime = Cache::get($cacheKey);
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
        $timeout = (int) config('telemetry.status_timeout_seconds', 5);

        if (!$status['is_active'] && $status['last_data_time']) {
            Log::info('Telemetry timeout detected', [
                'last_data_time' => $status['last_data_time'],
                'timeout_seconds' => $timeout,
            ]);

            // Broadcast inactive status
            event(new TelemetryStatusUpdated(
                self::STATUS_INACTIVE,
                (string) $status['last_data_time']
            ));
        }
    }
}
