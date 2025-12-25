<?php

use App\Http\Controllers\AlarmsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImageProcessingController;
use App\Http\Controllers\OcrController;
use App\Http\Controllers\VehicleLogsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('alarms', [AlarmsController::class, 'list'])->name('alarms.index');
    Route::get('alarms/{id}', [AlarmsController::class, 'show'])->name('alarms.show');
    Route::post('alarms/sync', [AlarmsController::class, 'index'])->name('alarms.sync');

    Route::get('vehicle-logs', [VehicleLogsController::class, 'index'])->name('vehicle-logs.index');
    Route::get('vehicle-logs/{id}', [VehicleLogsController::class, 'show'])->name('vehicle-logs.show');
    
    // OCR Processing Routes
    Route::get('ocr/save-images', [OcrController::class, 'saveBase64Images'])->name('ocr.save-images');
    Route::get('ocr/batch', [OcrController::class, 'batchProcess'])->name('ocr.batch');
    Route::get('ocr/{id}', [OcrController::class, 'show'])->name('ocr.show');
    Route::post('ocr/{id}/save', [OcrController::class, 'saveResult'])->name('ocr.save');
});

// API Routes
Route::post('api/process-image', [ImageProcessingController::class, 'processImage'])->name('api.process-image');

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
