<?php

namespace App\Http\Controllers;

use App\Models\VehicleLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OcrController extends Controller
{
    /**
     * Show OCR processing page for a vehicle log
     */
    public function show($id)
    {
        $vehicleLog = VehicleLog::findOrFail($id);
        
        // Get the cropped image URL - must be absolute URL for puter.ai
        $imageUrl = null;
        if ($vehicleLog->cropped_image_path) {
            $imageUrl = asset('storage/' . $vehicleLog->cropped_image_path);
        } elseif ($vehicleLog->image_path) {
            $imageUrl = $vehicleLog->image_path;
        }
        
        return view('ocr.process', [
            'vehicleLog' => $vehicleLog,
            'imageUrl' => $imageUrl,
        ]);
    }
    
    /**
     * Process OCR for a vehicle log via AJAX
     */
    public function process(Request $request, $id)
    {
        $vehicleLog = VehicleLog::findOrFail($id);
        
        // Get the cropped image URL - must be absolute URL for puter.ai
        $imageUrl = null;
        if ($vehicleLog->cropped_image_path) {
            $imageUrl = asset('storage/' . $vehicleLog->cropped_image_path);
        } elseif ($vehicleLog->image_path) {
            $imageUrl = $vehicleLog->image_path;
        }
        
        if (!$imageUrl) {
            return response()->json([
                'success' => false,
                'message' => 'No image available for processing',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'imageUrl' => $imageUrl,
            'vehicleLogId' => $vehicleLog->id,
        ]);
    }
    
    /**
     * Save OCR result to vehicle log
     */
    public function saveResult(Request $request, $id)
    {
        try {
            $request->validate([
                'plate_text' => 'required|string|max:255',
            ]);
            
            $vehicleLog = VehicleLog::findOrFail($id);
            
            $plateText = trim($request->plate_text);
            
            Log::info('Saving OCR result', [
                'vehicle_log_id' => $id,
                'plate_text' => $plateText,
            ]);
            
            // Update both fields:
            // - plate_text: stores the OCR extracted text (for reference)
            // - license_plate: stores the cleaned plate number (for search/display)
            $updateData = [
                'plate_text' => $plateText,
                'license_plate' => $plateText, // Always update license_plate with cleaned text
            ];
            
            $vehicleLog->update($updateData);
            
            Log::info('OCR result saved successfully', [
                'vehicle_log_id' => $id,
                'updated_data' => $updateData,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'OCR result saved successfully',
                'vehicleLog' => $vehicleLog->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error saving OCR result', [
                'vehicle_log_id' => $id,
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error saving OCR result', [
                'vehicle_log_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Save base64 images to local storage and update cropped_image_path
     */
    public function saveBase64Images()
    {
        // Get all vehicle logs with base64 images but no cropped_image_path
        $vehicleLogs = VehicleLog::whereNotNull('plate_image_base64')
            ->where('plate_image_base64', '!=', '')
            ->where(function($query) {
                $query->whereNull('cropped_image_path')
                      ->orWhere('cropped_image_path', '=', '');
            })
            ->orderBy('id', 'asc')
            ->get(['id', 'plate_image_base64']);
        
        $saved = 0;
        $failed = 0;
        
        foreach ($vehicleLogs as $vehicleLog) {
            try {
                // Decode base64 image
                $base64Data = $vehicleLog->plate_image_base64;
                
                // Remove data URL prefix if present
                if (strpos($base64Data, 'data:image') === 0) {
                    $base64Data = preg_replace('/^data:image\/\w+;base64,/', '', $base64Data);
                }
                
                $imageData = base64_decode($base64Data);
                
                if (!$imageData) {
                    $failed++;
                    continue;
                }
                
                // Generate unique filename
                $filename = 'cropped_plates/plate_' . uniqid('', true) . '.jpg';
                
                // Save to public storage
                Storage::disk('public')->put($filename, $imageData);
                
                // Update vehicle log with cropped_image_path
                $vehicleLog->update(['cropped_image_path' => $filename]);
                
                $saved++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('Failed to save base64 image for vehicle log', [
                    'id' => $vehicleLog->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => "Saved {$saved} images, {$failed} failed",
            'saved' => $saved,
            'failed' => $failed,
            'total' => $vehicleLogs->count(),
        ]);
    }
    
    /**
     * Batch process all vehicle logs with cropped images
     */
    public function batchProcess()
    {
        // Get all vehicle logs with cropped_image_path
        $vehicleLogs = VehicleLog::whereNotNull('cropped_image_path')
            ->where('cropped_image_path', '!=', '')
            ->orderBy('id', 'asc')
            ->get(['id', 'cropped_image_path']);
        
        return view('ocr.batch', [
            'vehicleLogs' => $vehicleLogs,
            'total' => $vehicleLogs->count(),
        ]);
    }
}

