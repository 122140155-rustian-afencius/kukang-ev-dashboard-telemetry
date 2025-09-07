<?php

use App\Http\Controllers\TelemetryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

// Redirect /telemetry to the dashboard to keep one unified layout
Route::get('telemetry', function () {
    return redirect()->route('live');
})->name('telemetry.overview');
Route::get('live', [TelemetryController::class, 'live'])->name('live');
Route::get('history', [TelemetryController::class, 'history'])->name('history');
// Route::middleware(['auth'])->group(function () {
//     Route::redirect('/', '/live');
//     Route::get('/live', [TelemetryController::class, 'live'])->name('live');
//     Route::get('/history', [TelemetryController::class, 'history'])->name('history');
// });

Route::fallback(function () {
    return Inertia::render('NotFound');
});
