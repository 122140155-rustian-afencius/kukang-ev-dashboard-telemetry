<?php

namespace App\Console\Commands;

use Carbon\CarbonImmutable as Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\Exceptions\MqttClientException;
use PhpMqtt\Client\Facades\MQTT;

class MqttPublishTelemetry extends Command
{
    protected $signature = 'mqtt:publish-telemetry
        {--topic= : Base topic to publish to (default from config)}
        {--interval=1 : Interval in seconds between messages}
        {--count= : Optional number of messages to send then exit}
    ';

    protected $description = 'Publish telemetry data to the MQTT broker every second (or given interval).';

    public function handle(): int
    {
        $baseTopic = (string) ($this->option('topic') ?? config('telemetry.topic_base', 'kukang/telemetry'));
        $interval  = max(1, (int) $this->option('interval'));
        $count     = $this->option('count') !== null ? max(1, (int) $this->option('count')) : null;

        // Normalize base topic, remove trailing "/" or "/#"
        $baseTopic = rtrim($baseTopic, '/#');
        $topic = $baseTopic;

        $this->info("Publishing to topic: {$topic} every {$interval}s");

        $sent = 0;
        while (true) {
            try {
                $client = MQTT::connection('publisher');

                // Build payload matching MqttConsumeTelemetry expected structure
                $payload = $this->makePayload();

                $client->publish($topic, json_encode($payload, JSON_THROW_ON_ERROR), 0, false);

                $this->line('Published: ' . $payload['ts']);

                $sent++;
                if ($count !== null && $sent >= $count) {
                    break;
                }

                sleep(0.5);
            } catch (MqttClientException $e) {
                Log::error('MQTT publish failed', ['error' => $e->getMessage()]);
                $this->error('MQTT publish failed: ' . $e->getMessage());
                sleep(1);
            } catch (\Throwable $e) {
                Log::warning('Unexpected error while publishing telemetry', ['error' => $e->getMessage()]);
                $this->warn('Unexpected error: ' . $e->getMessage());
                sleep(1);
            }
        }

        return self::SUCCESS;
    }

    /**
     * Create a telemetry payload matching keys used in MqttConsumeTelemetry (no vehicle_id).
     * @return array<string,mixed>
     */
    protected function makePayload(): array
    {
        // Use deterministic-ish randoms for realism; tweak ranges as needed.
        $now = Carbon::now()->toIso8601String();

        $suhuEsc     = $this->randFloat(25, 70);
        $suhuBaterai = $this->randFloat(25, 55);
        $suhuMotor   = $this->randFloat(25, 80);
        $arus        = $this->randFloat(-50, 200); // A
        $tegangan    = $this->randFloat(40, 80);   // V
        $kecepatan   = $this->randFloat(0, 120);   // km/h
        $rpmMotor    = rand(0, 6000);
        $rpmwheel     = rand(0, 2000);

        // Simulated GPS around a point (e.g., Jakarta)
        $latBase = -6.200000; // Jakarta approx
        $lngBase = 106.816666;
        $lat = $latBase + $this->randFloat(-0.01, 0.01);
        $lng = $lngBase + $this->randFloat(-0.01, 0.01);

        return [
            'ts' => $now,
            'suhu_esc' => round($suhuEsc, 2),
            'arus' => round($arus, 2),
            'lat' => round($lat, 6),
            'lng' => round($lng, 6),
            'kecepatan' => round($kecepatan, 2),
        ];
    }

    protected function randFloat(float $min, float $max): float
    {
        return $min + mt_rand() / mt_getrandmax() * ($max - $min);
    }
}
