<?php

namespace App\Providers;

use App\Domain\Telemetry\Contracts\TelemetryRepository;
use App\Infrastructure\Persistence\DbTelemetryRepository;
use App\Services\TelemetryStatusService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TelemetryStatusService::class);
        $this->app->bind(TelemetryRepository::class, DbTelemetryRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
