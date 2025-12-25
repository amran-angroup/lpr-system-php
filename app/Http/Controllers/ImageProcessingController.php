<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImageProcessingController extends Controller
{
    /**
     * Process image to detect vehicle, license plate, and extract text
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function processImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,gif,webp|max:10240', // 10MB max
        ]);

        try {
            $image = $request->file('image');
            $apiUrl = config('services.image_processing.url', 'http://127.0.0.1:8080/api/process-image');

            // Forward the image to the Python API
            $response = Http::timeout(60)
                ->attach('image', file_get_contents($image->getRealPath()), $image->getClientOriginalName())
                ->post($apiUrl);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            Log::error('Image processing API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Image processing failed',
                'error' => $response->json() ?? $response->body(),
            ], $response->status());

        } catch (\Exception $e) {
            Log::error('Image processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process image: ' . $e->getMessage(),
            ], 500);
        }
    }
}

