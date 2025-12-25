<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Batch OCR Processing</title>
    <script src="https://js.puter.com/v2/"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        .header h1 {
            margin: 0;
            color: #333;
        }
        .stats {
            display: flex;
            gap: 20px;
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        .stat {
            flex: 1;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background-color: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background-color: #4caf50;
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .controls {
            margin: 20px 0;
            display: flex;
            gap: 10px;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        .btn-primary {
            background-color: #2196F3;
            color: white;
        }
        .btn-primary:hover:not(:disabled) {
            background-color: #1976D2;
        }
        .btn-danger {
            background-color: #f44336;
            color: white;
        }
        .btn-danger:hover:not(:disabled) {
            background-color: #d32f2f;
        }
        .btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .log {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            background-color: #fafafa;
            font-family: monospace;
            font-size: 12px;
        }
        .log-entry {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .log-entry.success {
            color: #4caf50;
        }
        .log-entry.error {
            color: #f44336;
        }
        .log-entry.info {
            color: #2196F3;
        }
        .current-item {
            background-color: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Batch OCR Processing</h1>
            <p>Processing {{ $total }} vehicle logs with cropped images...</p>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-label">Total</div>
                <div class="stat-value" id="total">{{ $total }}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Processed</div>
                <div class="stat-value" id="processed">0</div>
            </div>
            <div class="stat">
                <div class="stat-label">Success</div>
                <div class="stat-value" id="success">0</div>
            </div>
            <div class="stat">
                <div class="stat-label">Failed</div>
                <div class="stat-value" id="failed">0</div>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" id="progress" style="width: 0%">0%</div>
        </div>

        <div class="controls">
            <button class="btn btn-primary" id="startBtn" onclick="startProcessing()">Start Processing</button>
            <button class="btn btn-danger" id="stopBtn" onclick="stopProcessing()" disabled>Stop</button>
        </div>

        <div class="current-item" id="currentItem" style="display: none;">
            <strong>Processing:</strong> <span id="currentText"></span>
        </div>

        <div class="log" id="log"></div>
    </div>

    <script>
        const vehicleLogs = @json($vehicleLogs);
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        let currentIndex = 0;
        let isProcessing = false;
        let processed = 0;
        let success = 0;
        let failed = 0;

        function addLog(message, type = 'info') {
            const log = document.getElementById('log');
            const entry = document.createElement('div');
            entry.className = 'log-entry ' + type;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }

        function updateStats() {
            document.getElementById('processed').textContent = processed;
            document.getElementById('success').textContent = success;
            document.getElementById('failed').textContent = failed;
            
            const total = vehicleLogs.length;
            const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
            document.getElementById('progress').style.width = percentage + '%';
            document.getElementById('progress').textContent = percentage + '%';
        }

        function showCurrentItem(text) {
            const currentItem = document.getElementById('currentItem');
            const currentText = document.getElementById('currentText');
            currentText.textContent = text;
            currentItem.style.display = 'block';
        }

        function hideCurrentItem() {
            document.getElementById('currentItem').style.display = 'none';
        }

        // Clean plate text - remove duplicates and extract unique plate number
        function cleanPlateText(text) {
            if (!text || text.trim() === '' || text === 'No text found') {
                return '';
            }
            
            // Remove extra whitespace and split by spaces/newlines
            const cleaned = text.trim().replace(/\s+/g, ' ');
            const parts = cleaned.split(/\s+/).filter(part => part.length > 0);
            
            if (parts.length === 0) {
                return '';
            }
            
            // Get unique parts (removes duplicates)
            const uniqueParts = [...new Set(parts)];
            
            // If only one unique part, return it
            if (uniqueParts.length === 1) {
                return uniqueParts[0];
            }
            
            // For cases like "PMR 6425 PMR 6425" -> ["PMR", "6425"]
            // Combine letters and numbers to form plate number
            const letters = uniqueParts.find(p => /^[A-Za-z]+$/.test(p));
            const numbers = uniqueParts.find(p => /^[0-9]+$/.test(p));
            
            if (letters && numbers) {
                // Return as "ABC1234" format
                return letters.toUpperCase() + numbers;
            }
            
            // If we have exactly 2 unique parts and one looks like letters, one like numbers
            if (uniqueParts.length === 2) {
                const part1 = uniqueParts[0];
                const part2 = uniqueParts[1];
                
                // Check if one is letters and one is numbers
                if (/^[A-Za-z]+$/.test(part1) && /^[0-9]+$/.test(part2)) {
                    return part1.toUpperCase() + part2;
                }
                if (/^[A-Za-z]+$/.test(part2) && /^[0-9]+$/.test(part1)) {
                    return part2.toUpperCase() + part1;
                }
            }
            
            // Try to find a complete plate pattern in the original text
            // Look for pattern like "ABC1234" or "ABC 1234"
            const platePattern = /([A-Za-z]{2,4})\s*([0-9]{3,5})/i;
            const match = cleaned.match(platePattern);
            if (match) {
                return match[1].toUpperCase() + match[2];
            }
            
            // Return first unique part as fallback
            return uniqueParts[0];
        }

        // Load image and convert to base64
        function loadImageAsBase64(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    try {
                        const base64 = canvas.toDataURL('image/jpeg');
                        resolve(base64);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = function() {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = url;
            });
        }

        async function processNext() {
            if (!isProcessing || currentIndex >= vehicleLogs.length) {
                stopProcessing();
                addLog('Batch processing completed!', 'success');
                return;
            }

            const vehicleLog = vehicleLogs[currentIndex];
            currentIndex++;
            
            showCurrentItem(`Vehicle Log #${vehicleLog.id} (${currentIndex}/${vehicleLogs.length})`);
            addLog(`Processing Vehicle Log #${vehicleLog.id}...`, 'info');

            try {
                // Check if puter.ai is loaded
                if (typeof puter === 'undefined' || !puter.ai || !puter.ai.img2txt) {
                    throw new Error('puter.ai SDK not loaded. Please refresh the page.');
                }

                // Load image and convert to base64
                // Use cropped_image_path if available, otherwise use image_path
                let imagePath = vehicleLog.cropped_image_path || vehicleLog.image_path;
                
                if (!imagePath) {
                    throw new Error('No image path available');
                }
                
                // If it's a URL (from image_path), use it directly, otherwise use /storage/
                let imageUrl;
                if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                    imageUrl = imagePath;
                } else {
                    imageUrl = `/storage/${imagePath}`;
                }
                
                const imageBase64 = await loadImageAsBase64(imageUrl);
                
                if (!imageBase64) {
                    throw new Error('Failed to load image');
                }
                
                // EXACT SAME STRUCTURE AS USER'S HTML
                const text = await puter.ai.img2txt({
                    source: imageBase64,
                    provider: 'aws-textract'
                }).then(response => {
                    return response || 'No text found';
                });

                // Clean up the text - remove duplicates and extract unique plate number
                const rawText = (text || '').trim();
                const plateText = cleanPlateText(rawText);
                addLog(`  Raw text: "${rawText}"`, 'info');
                addLog(`  Cleaned text: "${plateText}"`, 'info');

                if (plateText && plateText !== 'No text found' && plateText.length > 0) {
                    // Save result
                    try {
                        addLog(`  Saving to database: "${plateText}"`, 'info');
                        
                        const response = await fetch(`/ocr/${vehicleLog.id}/save`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                            },
                            body: JSON.stringify({
                                plate_text: plateText
                            })
                        });

                        addLog(`  Response status: ${response.status}`, 'info');
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            addLog(`  Response error: ${errorText}`, 'error');
                            throw new Error(`HTTP ${response.status}: ${errorText}`);
                        }

                        const data = await response.json();
                        addLog(`  Response data: ${JSON.stringify(data)}`, 'info');
                        
                        if (data.success) {
                            addLog(`✓ Vehicle Log #${vehicleLog.id}: "${plateText}" - Saved`, 'success');
                            success++;
                        } else {
                            addLog(`✗ Vehicle Log #${vehicleLog.id}: Failed to save - ${data.message || 'Unknown error'}`, 'error');
                            failed++;
                        }
                    } catch (saveError) {
                        addLog(`✗ Vehicle Log #${vehicleLog.id}: Save error - ${saveError.message || saveError.toString()}`, 'error');
                        addLog(`  Error stack: ${saveError.stack || 'No stack'}`, 'error');
                        failed++;
                    }
                } else {
                    addLog(`✗ Vehicle Log #${vehicleLog.id}: No text extracted (empty result)`, 'error');
                    failed++;
                }

                processed++;
                updateStats();

                // Wait a bit before processing next (to avoid rate limiting)
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Process next
                processNext();

            } catch (error) {
                const errorMsg = error.message || error.toString() || JSON.stringify(error) || 'Unknown error';
                addLog(`✗ Vehicle Log #${vehicleLog.id}: Error - ${errorMsg}`, 'error');
                addLog(`  Error stack: ${error.stack || 'No stack trace'}`, 'error');
                processed++;
                failed++;
                updateStats();

                // Wait before retrying next
                await new Promise(resolve => setTimeout(resolve, 1500));
                processNext();
            }
        }

        function startProcessing() {
            if (isProcessing) return;
            
            isProcessing = true;
            currentIndex = 0;
            processed = 0;
            success = 0;
            failed = 0;
            
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            document.getElementById('log').innerHTML = '';
            
            addLog('Starting batch processing...', 'info');
            updateStats();
            
            processNext();
        }

        function stopProcessing() {
            isProcessing = false;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            hideCurrentItem();
            addLog('Processing stopped.', 'info');
        }

        // Check if puter.ai is loaded
        function checkPuterLoaded() {
            if (typeof puter === 'undefined') {
                addLog('ERROR: puter.ai SDK not loaded. Please check if the script is loaded.', 'error');
                return false;
            }
            if (!puter.ai || !puter.ai.img2txt) {
                addLog('ERROR: puter.ai.img2txt is not available.', 'error');
                return false;
            }
            return true;
        }

        // Save base64 images first, then process
        async function saveBase64ImagesFirst() {
            addLog('Step 1: Saving base64 images to local storage...', 'info');
            
            try {
                const response = await fetch('/ocr/save-images', {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addLog(`✓ Saved ${data.saved} images, ${data.failed} failed`, 'success');
                    
                    // Reload page to get updated vehicle logs with cropped_image_path
                    if (data.saved > 0) {
                        addLog('Reloading page to get updated vehicle logs...', 'info');
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                        return;
                    }
                } else {
                    addLog('Failed to save images', 'error');
                }
            } catch (error) {
                addLog('Error saving images: ' + error.message, 'error');
            }
            
            // Continue with processing
            proceedWithProcessing();
        }
        
        function proceedWithProcessing() {
            addLog('Step 2: Starting OCR processing...', 'info');
            
            if (!checkPuterLoaded()) {
                addLog('Waiting for puter.ai SDK to load...', 'info');
                setTimeout(() => {
                    if (checkPuterLoaded()) {
                        addLog('puter.ai SDK loaded successfully!', 'success');
                        if (vehicleLogs.length > 0) {
                            setTimeout(() => {
                                startProcessing();
                            }, 1000);
                        } else {
                            addLog('No vehicle logs to process.', 'info');
                        }
                    } else {
                        addLog('ERROR: puter.ai SDK failed to load. Please refresh the page.', 'error');
                    }
                }, 2000);
            } else {
                addLog('puter.ai SDK loaded successfully!', 'success');
                if (vehicleLogs.length > 0) {
                    setTimeout(() => {
                        startProcessing();
                    }, 1000);
                } else {
                    addLog('No vehicle logs to process.', 'info');
                }
            }
        }

        // Auto-start on page load
        window.addEventListener('DOMContentLoaded', function() {
            addLog('Page loaded. Starting process...', 'info');
            saveBase64ImagesFirst();
        });
    </script>
</body>
</html>

