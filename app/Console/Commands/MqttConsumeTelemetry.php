<?php

namespace App\Console\Commands;

use App\Events\TelemetryUpdated;
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

    public function handle(): int
    {
        $topic = config('mqtt.topic', 'kukang/telemetry/#');

        while (true) {
            try {
                $client = MQTT::connection();
                $this->info('Connected to MQTT broker');

                $client->subscribe($topic, function (string $topic, string $message) {
                    try {
                        $data = json_decode($message, true, 512, JSON_THROW_ON_ERROR);
                        if (!is_array($data) || empty($data['ts']) || empty($data['vehicle_id'])) {
                            Log::warning('Invalid telemetry payload', ['message' => $message]);
                            return;
                        }

                        $payload = [
                            'ts' => Carbon::parse($data['ts']),
                            'vehicle_id' => $data['vehicle_id'],
                            'suhu_esc' => $data['suhu_esc'] ?? null,
                            'suhu_baterai' => $data['suhu_baterai'] ?? null,
                            'suhu_motor' => $data['suhu_motor'] ?? null,
                            'arus' => $data['arus'] ?? null,
                            'tegangan' => $data['tegangan'] ?? null,
                            'lat' => $data['lat'] ?? null,
                            'lng' => $data['lng'] ?? null,
                            'kecepatan' => $data['kecepatan'] ?? null,
                            'rpm_motor' => $data['rpm_motor'] ?? null,
                            'rpm_roda' => $data['rpm_roda'] ?? null,
                            'accel_x' => Arr::get($data, 'accel.x'),
                            'accel_y' => Arr::get($data, 'accel.y'),
                            'accel_z' => Arr::get($data, 'accel.z'),
                            'gyro_x' => Arr::get($data, 'gyro.x'),
                            'gyro_y' => Arr::get($data, 'gyro.y'),
                            'gyro_z' => Arr::get($data, 'gyro.z'),
                        ];

                        DB::table('telemetry_raw')->insert($payload);

                        event(new TelemetryUpdated($data['vehicle_id'], $payload));
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
