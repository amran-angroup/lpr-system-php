@echo off
echo Stopping Laravel services...
echo.

REM Kill PHP processes running artisan commands
taskkill /F /FI "WINDOWTITLE eq Laravel Scheduler*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Laravel Queue Worker*" 2>nul

REM Also try to kill by process name (more reliable)
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "php.exe"') do (
    wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /i "artisan schedule:work" >nul && taskkill /F /PID %%a 2>nul
    wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /i "artisan queue:work" >nul && taskkill /F /PID %%a 2>nul
)

echo Services stopped.
pause

