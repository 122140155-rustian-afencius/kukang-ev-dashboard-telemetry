<?php

declare(strict_types=1);

namespace App\Domain\Telemetry\Actions;

use App\Services\TelemetryStatusService;

class UpsertTelemetryStatus
{
    public function __construct(private readonly TelemetryStatusService $statusService)
    {
    }

    public function handle(): void
    {
        $this->statusService->updateLastDataTime();
    }
}

