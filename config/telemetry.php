<?php

declare(strict_types=1);

return [
    // Base topic for telemetry messages (publisher will publish to {base})
    'topic_base' => env('TELEMETRY_TOPIC_BASE', 'kukang/telemetry'),
];
