<?php

return [
    'host' => env('MQTT_HOST', 'localhost'),
    'port' => env('MQTT_PORT', 1883),
    'username' => env('MQTT_USERNAME'),
    'password' => env('MQTT_PASSWORD'),
    'client_id' => env('MQTT_CLIENT_ID', 'kukang-dashboard'),
    'clean_session' => env('MQTT_CLEAN_SESSION', true),
    'timeout' => env('MQTT_TIMEOUT', 10),
    'keep_alive' => env('MQTT_KEEP_ALIVE', 60),
    'topic' => env('MQTT_TOPIC', 'kukang/telemetry'),
];
