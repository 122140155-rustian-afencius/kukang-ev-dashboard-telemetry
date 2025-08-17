# Kukang EV Telemetry Dashboard

## Development

Run the MQTT consumer:

```
php artisan mqtt:telemetry
```

Start Reverb WebSocket server:

```
php artisan reverb:start --host=0.0.0.0 --port=8080
```

Start the Vite dev server:

```
npm run dev
```

The default configuration uses a public Mosquitto broker for testing only.
