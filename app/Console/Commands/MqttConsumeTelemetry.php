<?php

namespace App\Console\Commands;

use App\Domain\Telemetry\Actions\UpsertTelemetryStatus;
use App\Domain\Telemetry\Contracts\TelemetryRepository;
use App\Domain\Telemetry\DTOs\TelemetryData;
use App\Events\TelemetryUpdated;
use App\Services\TelemetryStatusService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\Exceptions\MqttClientException;
use PhpMqtt\Client\Facades\MQTT;

class MqttConsumeTelemetry extends Command
{
    protected $signature = 'mqtt:telemetry';
    protected $description = 'Consume telemetry messages from MQTT broker';

    protected TelemetryStatusService $statusService;
    protected TelemetryRepository $repository;
    protected UpsertTelemetryStatus $upsertStatus;

    public function __construct(TelemetryStatusService $statusService, TelemetryRepository $repository, UpsertTelemetryStatus $upsertStatus)
    {
        parent::__construct();
        $this->statusService = $statusService;
        $this->repository = $repository;
        $this->upsertStatus = $upsertStatus;
    }

    public function handle(): int
    {
        $topic = rtrim((string) config('telemetry.topic_base', 'kukang/telemetry'), '/#');

        while (true) {
            try {
                $client = MQTT::connection('consumer');
                $this->info('Connected to MQTT broker');

                $client->subscribe($topic, function (string $topic, string $message) {
                    try {
                        Log::info('New MQTT telemetry data received', [
                            'topic' => $topic,
                            'message_size' => strlen($message),
                            'timestamp' => now()->toISOString()
                        ]);

                        $payload = json_decode($message, true, 512, JSON_THROW_ON_ERROR);
                        if (!is_array($payload) || empty($payload['ts'])) {
                            Log::warning('Invalid telemetry payload', ['message' => $message]);
                            return;
                        }

                        $dto = TelemetryData::fromMqttPayload($payload);
                        $this->repository->storeRaw($dto);

                        Log::info('Telemetry data successfully saved to database', [
                            'timestamp' => $dto->ts->toIso8601ZuluString(),
                        ]);

                        $this->line("✓ Telemetry data received and saved: {$dto->ts->toIso8601ZuluString()}");

                        // Update status via action
                        $this->upsertStatus->handle();

                        event(new TelemetryUpdated($dto->toBroadcastPayload()));
                    } catch (\Throwable $e) {
                        Log::warning('Failed to process telemetry message', ['error' => $e->getMessage()]);
                    }
                }, 1);

                $client->loop(true);
            } catch (MqttClientException $e) {
                Log::error('MQTT connection lost', ['error' => $e->getMessage()]);
                sleep(5);
            }
        }

        return self::SUCCESS;
    }
}
