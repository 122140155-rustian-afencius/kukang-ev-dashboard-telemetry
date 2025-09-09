# Telemetry Status System

Sistem ini mengimplementasikan monitoring status data stream telemetry yang akan menampilkan status "OFFLINE" ketika backend tidak menerima data MQTT selama lebih dari 5 detik.

## Komponen Yang Ditambahkan

### Backend:

1. **TelemetryStatusUpdated Event** (`app/Events/TelemetryStatusUpdated.php`)
    - Event untuk broadcast status data stream
    - Channel: `telemetry.status`

2. **TelemetryStatusService** (`app/Services/TelemetryStatusService.php`)
    - Service untuk mengelola status telemetry
    - Menggunakan Cache untuk menyimpan timestamp data terakhir
    - Timeout: 5 detik

3. **MonitorTelemetryStatus Command** (`app/Console/Commands/MonitorTelemetryStatus.php`)
    - Command untuk monitoring status secara kontinu
    - Menjalankan pengecekan timeout setiap detik

4. **Updated MqttConsumeTelemetry Command**
    - Menambahkan call ke TelemetryStatusService ketika data baru diterima

5. **Updated TelemetryController**
    - Menambahkan endpoint `/api/telemetry/status` untuk mendapatkan status saat ini

### Frontend:

1. **Updated LiveDashboard.tsx**
    - Menambahkan state untuk `dataActive` dan `lastDataTime`
    - Listening ke channel `telemetry.status`
    - Pengecekan timeout setiap detik di frontend
    - Initial status check saat komponen dimount

## Cara Menjalankan

### 1. Jalankan MQTT Consumer (terminal pertama):

```bash
php artisan mqtt:telemetry
```

### 2. Jalankan Status Monitor (terminal kedua):

```bash
php artisan mqtt:monitor-status
```

### 3. Jalankan Broadcasting (terminal ketiga):

```bash
php artisan reverb:start
```

## Cara Kerja

1. **Data Diterima**: Ketika MQTT consumer menerima data, `TelemetryStatusService::updateLastDataTime()` dipanggil
2. **Status Update**: Service akan broadcast event `TelemetryStatusUpdated` dengan status "active"
3. **Timeout Check**: Monitor command berjalan setiap detik untuk mengecek apakah data sudah timeout (>5 detik)
4. **Status Broadcast**: Jika timeout terdeteksi, event `TelemetryStatusUpdated` dengan status "inactive" akan di-broadcast
5. **Frontend Update**: LiveDashboard mendengarkan event dan update UI accordingly

## Status Indikator

- **LIVE (Hijau + Pulse)**: Connected + Data aktif (< 5 detik)
- **OFFLINE (Merah)**: Tidak connected ATAU data timeout (> 5 detik)

## API Endpoints

- `GET /api/telemetry/status`: Mendapatkan status saat ini
    ```json
    {
        "status": "active|inactive",
        "last_data_time": "2025-01-01T12:00:00.000Z",
        "is_active": true
    }
    ```

## Testing

Untuk testing sistem:

1. Jalankan semua commands di atas
2. Kirim data MQTT ke topic telemetry
3. Lihat status berubah menjadi "LIVE"
4. Hentikan pengiriman data MQTT
5. Tunggu >5 detik, status akan berubah menjadi "OFFLINE"
