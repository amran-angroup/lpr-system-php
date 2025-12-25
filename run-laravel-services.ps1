# Laravel Services Runner for Windows
# This script starts both the scheduler and queue worker

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$phpPath = "php"  # Change to full path if PHP is not in PATH, e.g., "C:\xampp\php\php.exe"

Write-Host "Starting Laravel services..." -ForegroundColor Green
Write-Host "Project path: $projectPath" -ForegroundColor Yellow

# Change to project directory
Set-Location $projectPath

# Check if PHP is available
try {
    $phpVersion = & $phpPath -v 2>&1
    Write-Host "PHP found: $($phpVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "ERROR: PHP not found! Please update `$phpPath in this script." -ForegroundColor Red
    exit 1
}

# Start scheduler (runs schedule:run every minute)
Write-Host "Starting Laravel Scheduler..." -ForegroundColor Cyan
Start-Process -FilePath $phpPath -ArgumentList "artisan schedule:work" -WorkingDirectory $projectPath -WindowStyle Minimized

# Wait a moment
Start-Sleep -Seconds 2

# Start queue worker
Write-Host "Starting Laravel Queue Worker..." -ForegroundColor Cyan
Start-Process -FilePath $phpPath -ArgumentList "artisan queue:work --tries=3 --timeout=90" -WorkingDirectory $projectPath -WindowStyle Minimized

Write-Host "`nServices started!" -ForegroundColor Green
Write-Host "Check logs in: storage\logs\" -ForegroundColor Yellow
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

