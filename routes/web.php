<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TelemetryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root: send authenticated users to /dashboard, guests to /login
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('root');

// Guest-only routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('login.store');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    // Redirect /telemetry to the dashboard to keep one unified layout
    Route::get('telemetry', fn() => redirect()->route('dashboard'))->name('telemetry.overview');
    Route::get('dashboard', [TelemetryController::class, 'live'])->name('dashboard');
    Route::get('history', [TelemetryController::class, 'history'])->name('history');
    Route::get('maps', [TelemetryController::class, 'maps'])->name('maps');

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});

Route::fallback(function () {
    return Inertia::render('NotFound');
});
