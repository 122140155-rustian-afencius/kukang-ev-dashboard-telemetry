<?php

declare(strict_types=1);

namespace App\Domain\Telemetry\Contracts;

use App\Domain\Telemetry\DTOs\TelemetryData;

interface TelemetryRepository
{
    /**
     * Store a raw telemetry data point.
     */
    public function storeRaw(TelemetryData $data): void;
}

