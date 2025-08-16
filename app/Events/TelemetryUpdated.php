<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class TelemetryUpdated implements ShouldBroadcast
{
    use SerializesModels;

    public string $vehicleId;
    public array $payload;

    public function __construct(string $vehicleId, array $payload)
    {
        $this->vehicleId = $vehicleId;
        $this->payload = $payload;
    }

    public function broadcastOn(): Channel
    {
        return new Channel("telemetry.kukang.{$this->vehicleId}");
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
        ];
    }
}
