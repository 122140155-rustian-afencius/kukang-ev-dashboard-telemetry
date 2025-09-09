<?php

namespace App\Console\Commands;

use App\Services\TelemetryStatusService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MonitorTelemetryStatus extends Command
{
    protected $signature = 'mqtt:monitor-status';
    protected $description = 'Monitor telemetry status and broadcast timeout events';

    protected TelemetryStatusService $statusService;

    public function __construct(TelemetryStatusService $statusService)
    {
        parent::__construct();
        $this->statusService = $statusService;
    }

    public function handle(): int
    {
        $this->info('Starting telemetry status monitor...');

        while (true) {
            try {
                $this->statusService->checkTimeout();
                sleep(1); // Check every second
            } catch (\Throwable $e) {
                Log::error('Error in telemetry status monitor', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                sleep(5);
            }
        }

        return self::SUCCESS;
    }
}
