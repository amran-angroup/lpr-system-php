@echo off
echo [%date% %time%] Starting Laravel Alarm Sync Services...
echo.
cd /d "%~dp0"

REM Create log files if they don't exist
if not exist "storage\logs" mkdir "storage\logs"
if not exist "storage\logs\scheduler.log" type nul > "storage\logs\scheduler.log"
if not exist "storage\logs\queue.log" type nul > "storage\logs\queue.log"

REM Start scheduler in background with logging
echo [%date% %time%] Starting scheduler...
start /B cmd /c "php artisan schedule:work >> storage\logs\scheduler.log 2>&1"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start queue worker in background with logging
echo [%date% %time%] Starting queue worker...
start /B cmd /c "php artisan queue:work --tries=3 --timeout=90 >> storage\logs\queue.log 2>&1"

echo [%date% %time%] Services started in background.
echo.
echo Monitoring logs (Press Ctrl+C to stop monitoring and return to menu)...
echo ========================================
echo.

REM Tail both log files in the terminal
powershell -Command "Get-Content storage\logs\scheduler.log, storage\logs\queue.log -Wait -Tail 50"

