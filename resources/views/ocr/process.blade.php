<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>OCR Processing - Vehicle Log #{{ $vehicleLog->id }}</title>
    <script src="https://js.puter.com/v2/"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
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
        .header p {
            margin: 5px 0 0 0;
            color: #666;
        }
        .content {
            display: flex;
            gap: 20px;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .image-section, .result-section {
            flex: 1;
        }
        .image-section img {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .result-section {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 15px;
            min-height: 200px;
            background-color: #fafafa;
        }
        .result-section.loading {
            color: #666;
            font-style: italic;
        }
        .result-section.success {
            background-color: #e8f5e9;
            border-color: #4caf50;
        }
        .result-section.error {
            background-color: #ffebee;
            border-color: #f44336;
        }
        .actions {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
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
            transition: background-color 0.3s;
        }
        .btn-primary {
            background-color: #2196F3;
            color: white;
        }
        .btn-primary:hover {
            background-color: #1976D2;
        }
        .btn-success {
            background-color: #4caf50;
            color: white;
        }
        .btn-success:hover {
            background-color: #45a049;
        }
        .btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .status {
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        .status.show {
            display: block;
        }
        .status.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        #plateText {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 10px;
        }
        .auto-save-indicator {
            display: inline-block;
            margin-left: 10px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OCR Processing - Vehicle Log #{{ $vehicleLog->id }}</h1>
            <p>Processing cropped license plate image...</p>
        </div>

        <div class="content">
            <div class="image-section">
                @if($imageUrl)
                    <img src="{{ $imageUrl }}" alt="License Plate Image" id="plateImage">
                @else
                    <p>No image available</p>
                @endif
            </div>
            <div class="result-section loading" id="result">
                Extracting text...
            </div>
        </div>

        <div class="actions">
            <input type="text" id="plateText" placeholder="Extracted plate text will appear here..." style="display: none;">
            <button class="btn btn-primary" id="processBtn" onclick="processOCR()" style="display: none;">Process Again</button>
            <button class="btn btn-success" id="saveBtn" onclick="saveResult()" style="display: none;">Save Result</button>
        </div>

        <div class="status" id="status"></div>
    </div>

    <script>
        const vehicleLogId = {{ $vehicleLog->id }};
        const imageUrl = @json($imageUrl);
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Auto-process on page load
        window.addEventListener('DOMContentLoaded', function() {
            if (imageUrl) {
                processOCR();
            } else {
                showResult('No image available for processing', 'error');
            }
        });

        function processOCR() {
            const resultDiv = document.getElementById('result');
            const processBtn = document.getElementById('processBtn');
            const saveBtn = document.getElementById('saveBtn');
            const plateTextInput = document.getElementById('plateText');
            
            // Reset UI
            resultDiv.className = 'result-section loading';
            resultDiv.textContent = 'Extracting text...';
            processBtn.disabled = true;
            saveBtn.style.display = 'none';
            plateTextInput.style.display = 'none';
            hideStatus();

            // Process with puter.ai
            puter.ai.img2txt({
                source: imageUrl,
                provider: 'aws-textract'
            }).then(response => {
                const text = response || 'No text found';
                
                // Show result
                resultDiv.className = 'result-section success';
                resultDiv.textContent = text;
                
                // Show input and buttons
                plateTextInput.value = text;
                plateTextInput.style.display = 'block';
                saveBtn.style.display = 'inline-block';
                processBtn.style.display = 'inline-block';
                processBtn.disabled = false;
                
                // Auto-save if text was found
                if (text && text !== 'No text found' && text.trim().length > 0) {
                    setTimeout(() => {
                        saveResult(true); // Auto-save
                    }, 1000);
                }
            }).catch(error => {
                resultDiv.className = 'result-section error';
                resultDiv.textContent = 'Error: ' + (error.message || 'Failed to extract text');
                processBtn.style.display = 'inline-block';
                processBtn.disabled = false;
                showStatus('OCR processing failed: ' + error.message, 'error');
            });
        }

        function saveResult(isAutoSave = false) {
            const plateText = document.getElementById('plateText').value.trim();
            const saveBtn = document.getElementById('saveBtn');
            
            if (!plateText) {
                showStatus('Please enter plate text', 'error');
                return;
            }

            saveBtn.disabled = true;
            if (isAutoSave) {
                saveBtn.textContent = 'Auto-saving...';
            } else {
                saveBtn.textContent = 'Saving...';
            }

            fetch(`/ocr/${vehicleLogId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    plate_text: plateText
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showStatus(isAutoSave ? 'Result auto-saved successfully!' : 'Result saved successfully!', 'success');
                    saveBtn.textContent = 'Saved ✓';
                    setTimeout(() => {
                        saveBtn.textContent = 'Save Result';
                        saveBtn.disabled = false;
                    }, 2000);
                } else {
                    showStatus('Failed to save: ' + (data.message || 'Unknown error'), 'error');
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Result';
                }
            })
            .catch(error => {
                showStatus('Error saving result: ' + error.message, 'error');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Result';
            });
        }

        function showStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = 'status ' + type + ' show';
            setTimeout(() => {
                hideStatus();
            }, 5000);
        }

        function hideStatus() {
            const statusDiv = document.getElementById('status');
            statusDiv.classList.remove('show');
        }
    </script>
</body>
</html>

