<?php

declare(strict_types=1);

return [
    // Base topic for telemetry messages (publisher will publish to {base})
    'topic_base' => env('TELEMETRY_TOPIC_BASE', 'kukang/telemetry'),

    // Status monitoring configuration
    'status_cache_key' => env('TELEMETRY_STATUS_CACHE_KEY', 'telemetry.last_data_time'),
    'status_timeout_seconds' => env('TELEMETRY_STATUS_TIMEOUT', 5),
];
