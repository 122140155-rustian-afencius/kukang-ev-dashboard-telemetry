<?php

namespace App\Console\Commands;

use App\Events\TelemetryUpdated;
use App\Services\TelemetryStatusService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\Exceptions\MqttClientException;
use PhpMqtt\Client\Facades\MQTT;

class MqttConsumeTelemetry extends Command
{
    protected $signature = 'mqtt:telemetry';
    protected $description = 'Consume telemetry messages from MQTT broker';

    protected TelemetryStatusService $statusService;

    public function __construct(TelemetryStatusService $statusService)
    {
        parent::__construct();
        $this->statusService = $statusService;
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

                        $data = json_decode($message, true, 512, JSON_THROW_ON_ERROR);
                        if (!is_array($data) || empty($data['ts'])) {
                            Log::warning('Invalid telemetry payload', ['message' => $message]);
                            return;
                        }

                        $dbPayload = [
                            'ts' => Carbon::parse($data['ts']),
                            'esc_temp' => $data['suhu_esc'] ?? $data['esc_temp'] ?? null,
                            'batt_temp' => $data['suhu_baterai'] ?? $data['batt_temp'] ?? null,
                            'motor_temp' => $data['suhu_motor'] ?? $data['motor_temp'] ?? null,
                            'current_a' => $data['arus'] ?? $data['current_a'] ?? null,
                            'voltage_v' => $data['tegangan'] ?? $data['voltage_v'] ?? null,
                            'latitude' => $data['lat'] ?? $data['latitude'] ?? null,
                            'longitude' => $data['lng'] ?? $data['longitude'] ?? null,
                            'speed_kmh' => $data['kecepatan'] ?? $data['speed_kmh'] ?? null,
                            'rpm_wheel' => $data['rpm_roda'] ?? $data['rpm_wheel'] ?? null,
                            'acc_x' => Arr::get($data, 'accel.x') ?? ($data['acc_x'] ?? null),
                            'acc_y' => Arr::get($data, 'accel.y') ?? ($data['acc_y'] ?? null),
                            'acc_z' => Arr::get($data, 'accel.z') ?? ($data['acc_z'] ?? null),
                            'gyro_x' => Arr::get($data, 'gyro.x') ?? ($data['gyro_x'] ?? null),
                            'gyro_y' => Arr::get($data, 'gyro.y') ?? ($data['gyro_y'] ?? null),
                            'gyro_z' => Arr::get($data, 'gyro.z') ?? ($data['gyro_z'] ?? null),
                        ];

                        DB::table('telemetry_raw')->insert($dbPayload);

                        Log::info('Telemetry data successfully saved to database', [
                            'timestamp' => $data['ts'],
                            'data_points' => count(array_filter($dbPayload, fn($value) => $value !== null))
                        ]);

                        $this->line("✓ Telemetry data received and saved: {$data['ts']}");

                        // Update status service with new data
                        $this->statusService->updateLastDataTime();

                        $broadcastPayload = [
                            'ts' => $data['ts'],
                            'suhu_esc' => $data['suhu_esc'] ?? null,
                            'suhu_baterai' => $data['suhu_baterai'] ?? null,
                            'suhu_motor' => $data['suhu_motor'] ?? null,
                            'arus' => $data['arus'] ?? null,
                            'tegangan' => $data['tegangan'] ?? null,
                            'lat' => $data['lat'] ?? null,
                            'lng' => $data['lng'] ?? null,
                            'kecepatan' => $data['kecepatan'] ?? null,
                            'rpm_motor' => $data['rpm_motor'] ?? null,
                            'rpm_wheel' => $data['rpm_wheel'] ?? $data['rpm_roda'] ?? null,
                            'acc_x' => Arr::get($data, 'accel.x') ?? ($data['acc_x'] ?? null),
                            'acc_y' => Arr::get($data, 'accel.y') ?? ($data['acc_y'] ?? null),
                            'acc_z' => Arr::get($data, 'accel.z') ?? ($data['acc_z'] ?? null),
                            'gyro_x' => Arr::get($data, 'gyro.x') ?? ($data['gyro_x'] ?? null),
                            'gyro_y' => Arr::get($data, 'gyro.y') ?? ($data['gyro_y'] ?? null),
                            'gyro_z' => Arr::get($data, 'gyro.z') ?? ($data['gyro_z'] ?? null),
                        ];
                        event(new TelemetryUpdated($broadcastPayload));
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
