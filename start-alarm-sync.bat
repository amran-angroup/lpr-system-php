@echo off
echo Starting Laravel Alarm Sync Services...
echo.
cd /d "%~dp0"

REM Start scheduler in background
start /B php artisan schedule:work > storage\logs\scheduler.log 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start queue worker in background
start /B php artisan queue:work --tries=3 --timeout=90 > storage\logs\queue.log 2>&1

echo Services started in background.
echo Check logs in storage\logs\ folder.
echo Use stop-alarm-sync.bat to stop.
echo.
pause

