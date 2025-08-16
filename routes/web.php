<?php

use App\Http\Controllers\TelemetryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('/', '/live');
    Route::get('/live', [TelemetryController::class, 'live'])->name('live');
    Route::get('/history', [TelemetryController::class, 'history'])->name('history');
});

Route::fallback(function () {
    return Inertia::render('NotFound');
});
