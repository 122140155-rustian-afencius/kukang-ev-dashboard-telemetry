<?php

use App\Http\Controllers\TelemetryController;
use Illuminate\Support\Facades\Route;

Route::get('/telemetry/history', [TelemetryController::class, 'historyApi']);
Route::get('/telemetry/status', [TelemetryController::class, 'status']);
