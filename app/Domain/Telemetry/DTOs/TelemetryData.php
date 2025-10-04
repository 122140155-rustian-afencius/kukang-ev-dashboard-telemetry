<?php

declare(strict_types=1);

namespace App\Domain\Telemetry\DTOs;

use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;

class TelemetryData
{
    public CarbonImmutable $ts;

    public ?float $lat;

    public ?float $lng;

    public ?float $speedKmh;

    public ?float $currentA;

    public ?float $voltageV;

    public ?float $rpmMotor;

    public ?float $rpmWheel;

    public ?float $escTemp;

    public ?float $battTemp;

    public ?float $motorTemp;

    public ?float $accX;

    public ?float $accY;

    public ?float $accZ;

    public ?float $gyroX;

    public ?float $gyroY;

    public ?float $gyroZ;

    public ?float $heading;

    public function __construct(
        CarbonImmutable $ts,
        ?float $lat = null,
        ?float $lng = null,
        ?float $speedKmh = null,
        ?float $currentA = null,
        ?float $voltageV = null,
        ?float $rpmMotor = null,
        ?float $rpmWheel = null,
        ?float $escTemp = null,
        ?float $battTemp = null,
        ?float $motorTemp = null,
        ?float $accX = null,
        ?float $accY = null,
        ?float $accZ = null,
        ?float $gyroX = null,
        ?float $gyroY = null,
        ?float $gyroZ = null,
        ?float $heading = null,
    ) {
        $this->ts = $ts;
        $this->lat = $lat;
        $this->lng = $lng;
        $this->speedKmh = $speedKmh;
        $this->currentA = $currentA;
        $this->voltageV = $voltageV;
        $this->rpmMotor = $rpmMotor;
        $this->rpmWheel = $rpmWheel;
        $this->escTemp = $escTemp;
        $this->battTemp = $battTemp;
        $this->motorTemp = $motorTemp;
        $this->accX = $accX;
        $this->accY = $accY;
        $this->accZ = $accZ;
        $this->gyroX = $gyroX;
        $this->gyroY = $gyroY;
        $this->gyroZ = $gyroZ;
        $this->heading = $heading;
    }

    /**
     * Normalize incoming MQTT payload keys into a typed DTO.
     * Accepts both English and Indonesian field aliases.
     *
     * @param  array<string,mixed>  $payload
     */
    public static function fromMqttPayload(array $payload): self
    {
        $ts = CarbonImmutable::parse((string) ($payload['ts'] ?? now()->toISOString()));

        $lat = self::toFloat($payload['lat'] ?? $payload['latitude'] ?? null);
        $lng = self::toFloat($payload['lng'] ?? $payload['longitude'] ?? null);
        $speed = self::toFloat($payload['kecepatan'] ?? $payload['speed_kmh'] ?? null);
        $current = self::toFloat($payload['arus'] ?? $payload['current_a'] ?? null);
        $voltage = self::toFloat($payload['tegangan'] ?? $payload['voltage_v'] ?? null);
        $rpmMotor = self::toFloat($payload['rpm_motor'] ?? null);
        $rpmWheel = self::toFloat($payload['rpm_wheel'] ?? $payload['rpm_roda'] ?? null);
        $esc = self::toFloat($payload['suhu_esc'] ?? $payload['esc_temp'] ?? null);
        $batt = self::toFloat($payload['suhu_baterai'] ?? $payload['batt_temp'] ?? null);
        $motor = self::toFloat($payload['suhu_motor'] ?? $payload['motor_temp'] ?? null);

        $accX = self::toFloat($payload['acc_x'] ?? Arr::get($payload, 'accel.x'));
        $accY = self::toFloat($payload['acc_y'] ?? Arr::get($payload, 'accel.y'));
        $accZ = self::toFloat($payload['acc_z'] ?? Arr::get($payload, 'accel.z'));

        $gyroX = self::toFloat($payload['gyro_x'] ?? Arr::get($payload, 'gyro.x'));
        $gyroY = self::toFloat($payload['gyro_y'] ?? Arr::get($payload, 'gyro.y'));
        $gyroZ = self::toFloat($payload['gyro_z'] ?? Arr::get($payload, 'gyro.z'));
        $heading = self::toFloat($payload['heading'] ?? null);

        return new self(
            $ts,
            $lat,
            $lng,
            $speed,
            $current,
            $voltage,
            $rpmMotor,
            $rpmWheel,
            $esc,
            $batt,
            $motor,
            $accX,
            $accY,
            $accZ,
            $gyroX,
            $gyroY,
            $gyroZ,
            $heading,
        );
    }

    /**
     * Prepare a database payload compatible with `telemetry_raw` table.
     *
     * @return array<string,mixed>
     */
    public function toDatabasePayload(): array
    {
        return [
            'ts' => $this->ts,
            'esc_temp' => $this->escTemp,
            'batt_temp' => $this->battTemp,
            'motor_temp' => $this->motorTemp,
            'current_a' => $this->currentA,
            'voltage_v' => $this->voltageV,
            'latitude' => $this->lat,
            'longitude' => $this->lng,
            'speed_kmh' => $this->speedKmh,
            'rpm_wheel' => $this->rpmWheel,
            'acc_x' => $this->accX,
            'acc_y' => $this->accY,
            'acc_z' => $this->accZ,
            'gyro_x' => $this->gyroX,
            'gyro_y' => $this->gyroY,
            'gyro_z' => $this->gyroZ,
            'heading' => $this->heading,
        ];
    }

    /**
     * Prepare a broadcast payload in canonical keys used by frontend.
     *
     * @return array<string,mixed>
     */
    public function toBroadcastPayload(): array
    {
        return [
            'ts' => $this->ts->toIso8601ZuluString(),
            'lat' => $this->lat,
            'lng' => $this->lng,
            'speed_kmh' => $this->speedKmh,
            'current_a' => $this->currentA,
            'voltage_v' => $this->voltageV,
            'rpm_motor' => $this->rpmMotor,
            'suhu_esc' => $this->escTemp,
            'suhu_baterai' => $this->battTemp,
            'suhu_motor' => $this->motorTemp,
            'rpm_wheel' => $this->rpmWheel,
            'acc_x' => $this->accX,
            'acc_y' => $this->accY,
            'acc_z' => $this->accZ,
            'gyro_x' => $this->gyroX,
            'gyro_y' => $this->gyroY,
            'gyro_z' => $this->gyroZ,
            'heading' => $this->heading,
        ];
    }

    private static function toFloat(null|int|float|string $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_float($value)) {
            return $value;
        }
        if (is_int($value)) {
            return (float) $value;
        }
        $f = filter_var($value, FILTER_VALIDATE_FLOAT, FILTER_FLAG_ALLOW_THOUSAND);

        return $f === false ? null : (float) $f;
    }
}
