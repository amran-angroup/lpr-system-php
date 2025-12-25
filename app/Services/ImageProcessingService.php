<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageProcessingService
{
    /**
     * Process image from EZVIZ URL using Roboflow for plate detection and text_ocr.py for text extraction
     * 
     * @param string $imageUrl EZVIZ image URL
     * @return array|null Processing results or null on failure
     */
    public function processImageFromUrl(string $imageUrl): ?array
    {
        $tempImagePath = null;
        $tempCroppedPath = null;

        try {
            // Download image from EZVIZ
            $imageContent = $this->downloadImage($imageUrl);
            
            if (!$imageContent) {
                Log::warning('Failed to download image from EZVIZ', ['url' => $imageUrl]);
                return null;
            }

            // Save temporarily to process
            $tempImagePath = 'temp/' . uniqid('alarm_', true) . '.jpg';
            Storage::disk('local')->put($tempImagePath, $imageContent);
            $fullImagePath = Storage::disk('local')->path($tempImagePath);

            // Step 1: Call Roboflow API to detect license plate
            $roboflowResult = $this->detectPlateWithRoboflow($imageUrl);
            
            if (!$roboflowResult) {
                Log::warning('Roboflow API returned null', ['url' => $imageUrl]);
                return [
                    'success' => false,
                    'message' => 'Roboflow API call failed',
                ];
            }
            
            // Log the full response for debugging
            Log::info('Roboflow API response received', [
                'url' => $imageUrl,
                'has_predictions_key' => isset($roboflowResult['predictions']),
                'predictions_type' => gettype($roboflowResult['predictions'] ?? null),
                'predictions_count' => is_array($roboflowResult['predictions'] ?? null) ? count($roboflowResult['predictions']) : 0,
                'full_response_keys' => array_keys($roboflowResult),
            ]);
            
            // Check if predictions exist and is an array
            if (!isset($roboflowResult['predictions']) || !is_array($roboflowResult['predictions']) || empty($roboflowResult['predictions'])) {
                Log::warning('No license plate detected by Roboflow', [
                    'url' => $imageUrl,
                    'roboflow_result' => $roboflowResult,
                    'predictions_key_exists' => isset($roboflowResult['predictions']),
                    'predictions_is_array' => is_array($roboflowResult['predictions'] ?? null),
                    'predictions_empty' => empty($roboflowResult['predictions'] ?? null),
                ]);
                return [
                    'success' => false,
                    'message' => 'No license plate detected',
                ];
            }

            // Get the best prediction (highest confidence)
            $bestPrediction = $this->getBestPrediction($roboflowResult['predictions']);
            
            if (!$bestPrediction) {
                Log::warning('No valid prediction found', ['url' => $imageUrl]);
                return [
                    'success' => false,
                    'message' => 'No valid license plate prediction',
                ];
            }

            // Step 2: Crop the detected plate from the image
            $croppedImagePath = $this->cropPlateFromImage($fullImagePath, $bestPrediction);
            
            $plateText = null;
            $plateImageBase64 = null;
            $savedCroppedImagePath = null;
            
            if ($croppedImagePath) {
                $tempCroppedPath = $croppedImagePath;

                // Step 3: Save cropped image permanently
                $savedCroppedImagePath = $this->saveCroppedImage($croppedImagePath);
                
                // Step 4: Use puter.ai to extract text from cropped plate
                if ($savedCroppedImagePath) {
                    $plateText = $this->extractTextWithOCR($savedCroppedImagePath);
                }
                
                // Convert cropped image to base64 for immediate display
                if (file_exists($croppedImagePath)) {
                    $croppedImageContent = file_get_contents($croppedImagePath);
                    $plateImageBase64 = 'data:image/jpeg;base64,' . base64_encode($croppedImageContent);
                }
            } else {
                Log::warning('Failed to crop license plate, but plate was detected', [
                    'url' => $imageUrl,
                    'prediction' => $bestPrediction,
                ]);
            }

            // Prepare result - return success even if cropping failed, as long as plate was detected
            $result = [
                'success' => true,
                'confidence' => $bestPrediction['confidence'],
                'license_plate' => [
                    'x' => $bestPrediction['x'],
                    'y' => $bestPrediction['y'],
                    'width' => $bestPrediction['width'],
                    'height' => $bestPrediction['height'],
                ],
                'license_plate_coords' => [
                    'x' => $bestPrediction['x'],
                    'y' => $bestPrediction['y'],
                    'width' => $bestPrediction['width'],
                    'height' => $bestPrediction['height'],
                ],
                'plate_text' => $plateText,
                'plate_image_base64' => $plateImageBase64,
                'cropped_image_path' => $savedCroppedImagePath,
            ];

            return $result;

        } catch (\Exception $e) {
            Log::error('Image processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => $imageUrl,
            ]);
            return null;
        } finally {
            // Clean up temp files
            if ($tempImagePath && Storage::disk('local')->exists($tempImagePath)) {
                Storage::disk('local')->delete($tempImagePath);
            }
            if ($tempCroppedPath && file_exists($tempCroppedPath)) {
                unlink($tempCroppedPath);
            }
        }
    }

    /**
     * Detect license plate using Roboflow API
     * 
     * @param string $imageUrl Image URL
     * @return array|null Roboflow API response or null on failure
     */
    private function detectPlateWithRoboflow(string $imageUrl): ?array
    {
        try {
            $apiKey = config('services.roboflow.api_key');
            $modelUrl = config('services.roboflow.model_url');
            
            $url = $modelUrl . '?api_key=' . $apiKey . '&image=' . urlencode($imageUrl);
            
            // Add a small delay to avoid rate limiting
            usleep(500000); // 0.5 second delay
            
            // Disable SSL verification to avoid certificate issues
            $response = Http::withoutVerifying()
                ->timeout(60)
                ->post($url);
            
            if ($response->successful()) {
                $result = $response->json();
                
                // Log the response for debugging
                Log::info('Roboflow API response', [
                    'url' => $imageUrl,
                    'has_predictions' => isset($result['predictions']) && !empty($result['predictions']),
                    'predictions_count' => isset($result['predictions']) ? count($result['predictions']) : 0,
                ]);
                
                return $result;
            }

            Log::error('Roboflow API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'url' => $imageUrl,
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Roboflow API error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => $imageUrl,
            ]);
            return null;
        }
    }

    /**
     * Get the best prediction (highest confidence)
     * 
     * @param array $predictions Array of predictions
     * @return array|null Best prediction or null
     */
    private function getBestPrediction(array $predictions): ?array
    {
        if (empty($predictions)) {
            return null;
        }

        // Sort by confidence descending
        usort($predictions, function($a, $b) {
            return ($b['confidence'] ?? 0) <=> ($a['confidence'] ?? 0);
        });

        return $predictions[0];
    }

    /**
     * Crop license plate from image using PHP imagecrop
     * 
     * @param string $imagePath Full path to the image
     * @param array $prediction Prediction data with x, y, width, height
     * @return string|null Path to cropped image or null on failure
     */
    private function cropPlateFromImage(string $imagePath, array $prediction): ?string
    {
        try {
            // Detect image type and load accordingly
            $imageInfo = @getimagesize($imagePath);
            if (!$imageInfo) {
                Log::error('Failed to get image info', ['path' => $imagePath]);
                return null;
            }

            $imageType = $imageInfo[2];
            $image = null;

            switch ($imageType) {
                case IMAGETYPE_JPEG:
                    $image = imagecreatefromjpeg($imagePath);
                    break;
                case IMAGETYPE_PNG:
                    $image = imagecreatefrompng($imagePath);
                    break;
                case IMAGETYPE_GIF:
                    $image = imagecreatefromgif($imagePath);
                    break;
                case IMAGETYPE_WEBP:
                    $image = imagecreatefromwebp($imagePath);
                    break;
                default:
                    Log::error('Unsupported image type', [
                        'path' => $imagePath,
                        'type' => $imageType,
                    ]);
                    return null;
            }
            
            if (!$image) {
                Log::error('Failed to load image for cropping', ['path' => $imagePath]);
                return null;
            }

            // Get image dimensions
            $imageWidth = imagesx($image);
            $imageHeight = imagesy($image);

            // Roboflow returns center coordinates (x, y) and width, height
            // Convert to top-left corner coordinates for imagecrop
            $centerX = $prediction['x'];
            $centerY = $prediction['y'];
            $width = $prediction['width'];
            $height = $prediction['height'];

            // Calculate top-left corner
            $x = max(0, $centerX - ($width / 2));
            $y = max(0, $centerY - ($height / 2));

            // Ensure coordinates are within image bounds
            $x = min($x, $imageWidth - 1);
            $y = min($y, $imageHeight - 1);
            $width = min($width, $imageWidth - $x);
            $height = min($height, $imageHeight - $y);

            // Create crop rectangle
            $cropRect = [
                'x' => (int) $x,
                'y' => (int) $y,
                'width' => (int) $width,
                'height' => (int) $height,
            ];

            // Crop the image
            $croppedImage = imagecrop($image, $cropRect);
            
            if (!$croppedImage) {
                imagedestroy($image);
                Log::error('Failed to crop image', ['rect' => $cropRect]);
                return null;
            }

            // Save cropped image
            $croppedPath = Storage::disk('local')->path('temp/' . uniqid('cropped_plate_', true) . '.jpg');
            
            // Ensure directory exists
            $croppedDir = dirname($croppedPath);
            if (!is_dir($croppedDir)) {
                mkdir($croppedDir, 0755, true);
            }

            imagejpeg($croppedImage, $croppedPath, 95);
            
            // Free memory
            imagedestroy($image);
            imagedestroy($croppedImage);

            return $croppedPath;

        } catch (\Exception $e) {
            Log::error('Image cropping error', [
                'error' => $e->getMessage(),
                'path' => $imagePath,
            ]);
            return null;
        }
    }

    /**
     * Extract text from cropped plate image using puter.ai img2txt API
     * Uses Node.js script to call puter.ai since it's a JavaScript SDK
     * 
     * @param string $imagePath Storage path to cropped plate image (e.g., 'cropped_plates/plate_xxx.jpg')
     * @return string|null Extracted text or null on failure
     */
    private function extractTextWithOCR(string $imagePath): ?string
    {
        try {
            // Get the full path to the image file
            $fullImagePath = Storage::disk('public')->path($imagePath);
            
            if (!file_exists($fullImagePath)) {
                Log::error('Image file not found for OCR', ['path' => $fullImagePath]);
                return null;
            }
            
            // Use Node.js script with puter.ai SDK (official method)
            $scriptPath = base_path('ocr_puter.js');
            
            if (!file_exists($scriptPath)) {
                Log::error('OCR script not found', ['path' => $scriptPath]);
                return null;
            }
            
            // Try using Node.js script with puter.ai SDK
            $nodeCmd = 'node';
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                // On Windows, try node first, then nodejs
                $nodeCmd = 'node';
            }
            
            $command = sprintf(
                '%s "%s" "%s" 2>&1',
                escapeshellarg($nodeCmd),
                escapeshellarg($scriptPath),
                escapeshellarg($fullImagePath)
            );
            
            $output = [];
            $returnVar = 0;
            exec($command, $output, $returnVar);
            
            $outputString = implode("\n", $output);
            
            if ($returnVar === 0 && !empty($outputString)) {
                $text = trim($outputString);
                
                // Process the text to extract clean plate number
                $plateText = $this->processOCRText($text);
                
                Log::info('OCR extraction successful via Node.js script with puter.ai SDK', [
                    'image_path' => $imagePath,
                    'raw_text' => $text,
                    'processed_text' => $plateText,
                ]);
                
                return $plateText;
            } else {
                Log::warning('Node.js OCR script with puter.ai SDK failed', [
                    'return_var' => $returnVar,
                    'output' => $outputString,
                    'image_path' => $imagePath,
                ]);
                return null;
            }
            
            // Process the text to extract clean plate number
            $plateText = $this->processOCRText($text);
            
            Log::info('OCR extraction completed', [
                'image_path' => $imagePath,
                'raw_text' => $text,
                'processed_text' => $plateText,
            ]);
            
            return $plateText;

        } catch (\Exception $e) {
            Log::error('OCR extraction error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'image_path' => $imagePath,
            ]);
            return null;
        }
    }
    
    /**
     * Process OCR text to extract clean license plate number
     * Handles various formats like:
     * - "NDC 4073\n1\nNDC\n4073\n1\nNDC\n4073" -> "NDC4073"
     * - "PRV 8425\nPRV\n8425" -> "PRV8425"
     * - "POJ 7299\nPOJ\n7299" -> "POJ7299"
     * 
     * @param string $rawText Raw OCR text
     * @return string|null Cleaned plate text or null
     */
    private function processOCRText(?string $rawText): ?string
    {
        if (empty($rawText)) {
            return null;
        }
        
        // Split by newlines and filter out empty lines
        $lines = array_filter(
            array_map('trim', explode("\n", $rawText)),
            function($line) {
                return !empty($line);
            }
        );
        
        if (empty($lines)) {
            return null;
        }
        
        // Try to find the most common pattern
        // Look for lines that match plate format (3 letters + 4 digits, or similar)
        $platePattern = '/^([A-Z]{2,4})\s*(\d{3,5})$/i';
        $bestMatch = null;
        $bestScore = 0;
        
        foreach ($lines as $line) {
            // Remove spaces and check if it matches plate format
            $cleanLine = preg_replace('/\s+/', '', strtoupper($line));
            
            // Check if it matches common plate patterns
            if (preg_match('/^[A-Z]{2,4}\d{3,5}$/', $cleanLine)) {
                // Score based on length (prefer longer matches) and format
                $score = strlen($cleanLine);
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $bestMatch = $cleanLine;
                }
            }
        }
        
        // If we found a good match, return it
        if ($bestMatch && strlen($bestMatch) >= 6) {
            return $bestMatch;
        }
        
        // Otherwise, try to combine first line (might be "ABC 1234" format)
        $firstLine = trim($lines[0]);
        $combined = preg_replace('/\s+/', '', strtoupper($firstLine));
        
        // Check if combined line is valid
        if (preg_match('/^[A-Z]{2,4}\d{3,5}$/', $combined) && strlen($combined) >= 6) {
            return $combined;
        }
        
        // Last resort: try to extract letters and numbers from all lines
        $allText = implode('', $lines);
        $letters = preg_replace('/[^A-Z]/i', '', $allText);
        $numbers = preg_replace('/[^0-9]/', '', $allText);
        
        if (strlen($letters) >= 2 && strlen($numbers) >= 3) {
            // Take first 2-4 letters and first 3-5 numbers
            $plateText = substr($letters, 0, min(4, strlen($letters))) . 
                        substr($numbers, 0, min(5, strlen($numbers)));
            return strtoupper($plateText);
        }
        
        // If nothing works, return the first non-empty line cleaned up
        return preg_replace('/[^A-Z0-9]/i', '', strtoupper($firstLine)) ?: null;
    }
    
    /**
     * Save cropped image permanently to public storage
     * 
     * @param string $tempCroppedPath Temporary path to cropped image
     * @return string|null Path to saved image or null on failure
     */
    private function saveCroppedImage(string $tempCroppedPath): ?string
    {
        try {
            if (!file_exists($tempCroppedPath)) {
                Log::error('Cropped image file not found', ['path' => $tempCroppedPath]);
                return null;
            }
            
            // Generate unique filename
            $filename = 'cropped_plates/' . uniqid('plate_', true) . '.jpg';
            
            // Read the image content
            $imageContent = file_get_contents($tempCroppedPath);
            
            // Save to public storage so it can be accessed via URL
            Storage::disk('public')->put($filename, $imageContent);
            
            // Return the storage path
            return $filename;
            
        } catch (\Exception $e) {
            Log::error('Failed to save cropped image', [
                'error' => $e->getMessage(),
                'temp_path' => $tempCroppedPath,
            ]);
            return null;
        }
    }

    /**
     * Process cropped image with Roboflow and OCR
     * Re-runs Roboflow on the cropped image for better accuracy
     * 
     * @param string $croppedImagePath Storage path to cropped image (e.g., 'cropped_plates/plate_xxx.jpg')
     * @return array|null Processing results or null on failure
     */
    public function processCroppedImage(string $croppedImagePath): ?array
    {
        try {
            // Get the full path to the cropped image
            $fullImagePath = Storage::disk('public')->path($croppedImagePath);
            
            if (!file_exists($fullImagePath)) {
                Log::error('Cropped image file not found', ['path' => $fullImagePath]);
                return null;
            }
            
            // Since we already have the cropped plate image, skip Roboflow
            // and directly extract text using OCR
            // Step 1: Extract text using OCR from the cropped image
            $plateText = $this->extractTextWithOCR($croppedImagePath);
            
            // Convert cropped image to base64 for display
            $plateImageBase64 = null;
            if (file_exists($fullImagePath)) {
                $croppedImageContent = file_get_contents($fullImagePath);
                $plateImageBase64 = 'data:image/jpeg;base64,' . base64_encode($croppedImageContent);
            }
            
            // Prepare result - we already have the cropped image, so just return OCR results
            $result = [
                'success' => true,
                'confidence' => null, // No Roboflow confidence since we skipped it
                'license_plate_coords' => null, // No coords needed for already cropped image
                'plate_text' => $plateText,
                'plate_image_base64' => $plateImageBase64,
                'cropped_image_path' => $croppedImagePath, // Keep original cropped image
            ];
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error('Cropped image processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'cropped_image_path' => $croppedImagePath,
            ]);
            return null;
        }
    }
    
    /**
     * Check if URL is accessible
     * 
     * @param string $url URL to check
     * @return bool True if accessible
     */
    private function isUrlAccessible(string $url): bool
    {
        try {
            $response = Http::timeout(5)->head($url);
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Download image from EZVIZ URL
     * 
     * @param string $url Image URL
     * @return string|null Image content or null on failure
     */
    private function downloadImage(string $url): ?string
    {
        try {
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->get($url);
            
            if ($response->successful()) {
                return $response->body();
            }

            Log::warning('Failed to download image', [
                'url' => $url,
                'status' => $response->status(),
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Image download error', [
                'error' => $e->getMessage(),
                'url' => $url,
            ]);
            return null;
        }
    }
}

