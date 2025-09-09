<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class TelemetryStatusUpdated implements ShouldBroadcast
{
    use SerializesModels;

    public string $status;
    public string $lastDataTime;

    public function __construct(string $status, string $lastDataTime)
    {
        $this->status = $status;
        $this->lastDataTime = $lastDataTime;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('telemetry.status');
    }

    public function broadcastWith(): array
    {
        return [
            'status' => $this->status,
            'last_data_time' => $this->lastDataTime,
            'timestamp' => now()->toISOString(),
        ];
    }
}
