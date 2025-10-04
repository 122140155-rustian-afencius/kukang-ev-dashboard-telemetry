<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;

class TelemetryUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('telemetry.kukang');
    }

    public function broadcastWith(): array
    {
        return [
            'ts' => $this->payload['ts'],
            'lat' => $this->payload['lat'] ?? null,
            'lng' => $this->payload['lng'] ?? null,
            'speed_kmh' => $this->payload['kecepatan'] ?? $this->payload['speed_kmh'] ?? null,
            'current_a' => $this->payload['arus'] ?? $this->payload['current_a'] ?? null,
            'voltage_v' => $this->payload['tegangan'] ?? $this->payload['voltage_v'] ?? null,
            'rpm_motor' => $this->payload['rpm_motor'] ?? null,
            'suhu_esc' => $this->payload['suhu_esc'] ?? null,
            'suhu_baterai' => $this->payload['suhu_baterai'] ?? null,
            'suhu_motor' => $this->payload['suhu_motor'] ?? null,
            'rpm_wheel' => $this->payload['rpm_wheel'] ?? $this->payload['rpm_roda'] ?? null,
            'acc_x' => $this->payload['acc_x'] ?? Arr::get($this->payload, 'accel.x'),
            'acc_y' => $this->payload['acc_y'] ?? Arr::get($this->payload, 'accel.y'),
            'acc_z' => $this->payload['acc_z'] ?? Arr::get($this->payload, 'accel.z'),
            'gyro_x' => $this->payload['gyro_x'] ?? Arr::get($this->payload, 'gyro.x'),
            'gyro_y' => $this->payload['gyro_y'] ?? Arr::get($this->payload, 'gyro.y'),
            'gyro_z' => $this->payload['gyro_z'] ?? Arr::get($this->payload, 'gyro.z'),
            'heading' => $this->payload['heading'] ?? null,
        ];
    }
}
