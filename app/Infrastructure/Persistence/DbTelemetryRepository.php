<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Telemetry\Contracts\TelemetryRepository;
use App\Domain\Telemetry\DTOs\TelemetryData;
use Illuminate\Support\Facades\DB;

class DbTelemetryRepository implements TelemetryRepository
{
    public function storeRaw(TelemetryData $data): void
    {
        DB::table('telemetry_raw')->insert($data->toDatabasePayload());
    }
}

