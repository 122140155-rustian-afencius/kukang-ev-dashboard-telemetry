<?php

use App\Domain\Telemetry\DTOs\TelemetryData;

it('normalizes mixed telemetry payload keys into DTO', function () {
    $payload = [
        'ts' => '2024-09-09T12:34:56Z',
        'lat' => -6.2,
        'lng' => 106.8,
        'kecepatan' => 37.5,
        'arus' => '12.3',
        'tegangan' => 48,
        'rpm_roda' => 900,
        'suhu_esc' => 40,
        'suhu_baterai' => 35,
        'suhu_motor' => 42,
        'accel' => ['x' => 0.1, 'y' => 0.2, 'z' => 0.3],
        'gyro' => ['x' => 1.1, 'y' => 1.2, 'z' => 1.3],
    ];

    $dto = TelemetryData::fromMqttPayload($payload);

    expect($dto->ts->toIso8601ZuluString())->toBe('2024-09-09T12:34:56Z');
    expect($dto->lat)->toBe(-6.2)
        ->and($dto->lng)->toBe(106.8)
        ->and($dto->speedKmh)->toBe(37.5)
        ->and($dto->currentA)->toBe(12.3)
        ->and($dto->voltageV)->toBe(48.0)
        ->and($dto->rpmWheel)->toBe(900.0)
        ->and($dto->escTemp)->toBe(40.0)
        ->and($dto->battTemp)->toBe(35.0)
        ->and($dto->motorTemp)->toBe(42.0)
        ->and($dto->accX)->toBe(0.1)
        ->and($dto->gyroZ)->toBe(1.3);

    $db = $dto->toDatabasePayload();
    expect($db)
        ->toHaveKeys(['ts','latitude','longitude','speed_kmh','current_a','voltage_v','rpm_wheel','acc_x','gyro_z']);
});

