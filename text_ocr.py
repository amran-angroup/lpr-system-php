import easyocr
import re
import cv2
import numpy as np
import os
import sys
from pathlib import Path

# Fix encoding issues on Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Lazy initialization - only load EasyOCR when needed
_reader = None

def get_reader():
    """Lazy load EasyOCR reader to avoid downloading models at import time"""
    global _reader
    if _reader is None:
        print("[INFO] Initializing EasyOCR reader (this may take a moment on first use)...")
        try:
            _reader = easyocr.Reader(['en'], gpu=False)
            print("[SUCCESS] EasyOCR reader initialized successfully")
        except Exception as e:
            print(f"[ERROR] Failed to initialize EasyOCR: {e}")
            raise
    return _reader

def fix_common_ocr_mistakes(text, confidence_scores=None, use_smart_correction=True):
    """
    Fix common OCR errors with confidence-based decisions
    """
    if len(text) < 4:
        return text
    
    result = list(text)
    
    # Detect plate format (letters first or numbers first)
    letters_first = False
    if len(text) >= 3:
        if text[0].isalpha() and text[1].isalpha():
            letters_first = True
    
    # Character-by-character corrections based on position
    for i, char in enumerate(text):
        # Get confidence for this position if available
        conf = confidence_scores[i] if confidence_scores and i < len(confidence_scores) else 1.0
        
        # Determine if this position should be a letter or number based on format
        should_be_letter = False
        if letters_first:
            # First 3 positions are typically letters
            should_be_letter = i < 3
        else:
            # Last 3 positions are typically letters
            should_be_letter = i >= len(text) - 3
        
        if should_be_letter:
            # This position should be a letter
            if conf < 0.85 or not use_smart_correction:
                if char == 'W':
                    result[i] = 'N'
                elif char == 'M' and (i == 0 or i == len(text) - 3):
                    if conf < 0.75:
                        result[i] = 'N'
                elif char == 'O':
                    # Check context - might be D or O
                    if i == 1 or i == len(text) - 2:
                        result[i] = 'D'
                    else:
                        result[i] = 'O'
                elif char == 'C' and i == 0:
                    # C at start might be misread N
                    if conf < 0.70:
                        result[i] = 'N'
                elif char in '0123456789':
                    conversions = {'0': 'O', '1': 'I', '8': 'B', '5': 'S', '3': 'B', '4': 'A'}
                    result[i] = conversions.get(char, char)
        else:
            # This position should be a number
            if char == 'O':
                result[i] = '0'
            elif char == 'I' or char == 'L':
                result[i] = '1'
            elif char == 'S':
                result[i] = '5'
            elif char == 'Z':
                result[i] = '2'
            elif char == 'B':
                result[i] = '8'
            elif char == 'G':
                result[i] = '6'
    
    return ''.join(result)

def preprocess_image(img):
    """
    Apply multiple preprocessing techniques
    """
    # Scale up significantly
    img = cv2.resize(img, None, fx=8, fy=8, interpolation=cv2.INTER_CUBIC)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    
    # Denoise
    gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    
    # Sharpen
    kernel_sharpen = np.array([[-1,-1,-1],
                                [-1, 9,-1],
                                [-1,-1,-1]])
    gray = cv2.filter2D(gray, -1, kernel_sharpen)
    
    return gray

def is_valid_plate_format(text):
    """
    Check if the plate follows common formats
    Most plates start with letters: ABC1234, AB123CD
    Some start with numbers: 1234ABC (less common)
    """
    if len(text) < 4:
        return False, 0
    
    score = 0
    
    # Check if starts with letters (most common)
    if text[0].isalpha():
        score += 10
        if len(text) > 1 and text[1].isalpha():
            score += 10
        if len(text) > 2 and text[2].isalpha():
            score += 5
    
    # Check if has numbers after letters
    has_letters = any(c.isalpha() for c in text)
    has_numbers = any(c.isdigit() for c in text)
    if has_letters and has_numbers:
        score += 5
    
    return True, score

def finalize_plate_id(image_path):
    # Load Image
    img = cv2.imread(image_path)
    if img is None:
        return "Image not found"

    # Preprocess
    gray = preprocess_image(img)
    
    # Try multiple thresholding techniques
    thresholding_methods = []
    
    # Method 1: OTSU
    _, thresh1 = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    thresholding_methods.append(('OTSU', thresh1))
    
    # Method 2: Inverted OTSU
    _, thresh2 = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    thresholding_methods.append(('INV_OTSU', thresh2))
    
    # Method 3: Adaptive Gaussian
    thresh3 = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                     cv2.THRESH_BINARY, 11, 2)
    thresholding_methods.append(('ADAPTIVE_GAUSS', thresh3))
    
    # Method 4: Adaptive Mean
    thresh4 = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, 
                                     cv2.THRESH_BINARY, 11, 2)
    thresholding_methods.append(('ADAPTIVE_MEAN', thresh4))
    
    # Method 5: Manual threshold at multiple levels
    for threshold_val in [100, 127, 150]:
        _, thresh_manual = cv2.threshold(gray, threshold_val, 255, cv2.THRESH_BINARY)
        thresholding_methods.append((f'MANUAL_{threshold_val}', thresh_manual))

    all_results = []
    
    for method_name, thresh in thresholding_methods:
        # Minimal morphological operations to preserve character integrity
        kernel = np.ones((2, 2), np.uint8)
        processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
        
        # Perform OCR with optimized settings
        reader = get_reader()
        results = reader.readtext(processed, 
                                  detail=1, 
                                  paragraph=False,
                                  batch_size=1,
                                  width_ths=0.5,
                                  height_ths=0.5,
                                  decoder='greedy')
        
        if results:
            # Extract character positions with detailed info
            results_with_pos = []
            for detection in results:
                bbox, raw_text, prob = detection
                # Get all corner positions
                x_coords = [point[0] for point in bbox]
                y_coords = [point[1] for point in bbox]
                
                x_min = min(x_coords)
                x_max = max(x_coords)
                x_center = sum(x_coords) / 4
                y_center = sum(y_coords) / 4
                
                results_with_pos.append({
                    'bbox': bbox,
                    'text': raw_text,
                    'prob': prob,
                    'x_min': x_min,
                    'x_max': x_max,
                    'x_center': x_center,
                    'y_center': y_center
                })
            
            # Try both sorting directions
            # Left to right (normal)
            ltr_sorted = sorted(results_with_pos, key=lambda x: x['x_min'])
            # Right to left (reversed)
            rtl_sorted = sorted(results_with_pos, key=lambda x: x['x_min'], reverse=True)
            
            for sort_method, sorted_results in [('LTR', ltr_sorted), ('RTL', rtl_sorted)]:
                full_plate = ""
                total_confidence = 0
                char_confidences = []
                
                for detection in sorted_results:
                    raw_text = detection['text']
                    prob = detection['prob']
                    clean_segment = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
                    
                    if len(clean_segment) > 0:
                        full_plate += clean_segment
                        total_confidence += prob
                        char_confidences.extend([prob] * len(clean_segment))
                
                avg_confidence = total_confidence / len(sorted_results) if sorted_results else 0
                
                if len(full_plate) >= 4:
                    # Check plate format validity
                    is_valid, format_score = is_valid_plate_format(full_plate)
                    
                    # Boost confidence for valid formats
                    adjusted_confidence = avg_confidence + (format_score * 0.01)
                    
                    all_results.append({
                        'plate': full_plate,
                        'confidence': adjusted_confidence,
                        'method': f"{method_name}_{sort_method}",
                        'raw': full_plate,
                        'char_confidences': char_confidences,
                        'orientation': sort_method.lower(),
                        'format_score': format_score
                    })
    
    if not all_results:
        return "No Plate Detected"
    
    # Sort by adjusted confidence (includes format score)
    all_results.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Show top 5 results for debugging
    print("\nTop 5 OCR results:")
    for i, result in enumerate(all_results[:5]):
        print(f"{i+1}. {result['raw']} -> (conf: {result['confidence']:.3f}, format_score: {result['format_score']}, method: {result['method']})")
    
    # Get best result
    best_result = all_results[0]
    best_plate = best_result['plate']
    char_confidences = best_result.get('char_confidences', [])
    
    # Apply corrections with confidence awareness
    corrected_plate = fix_common_ocr_mistakes(best_plate, char_confidences)
    
    print(f"\nBefore correction: {best_plate}")
    print(f"After correction: {corrected_plate}")
    if char_confidences:
        print(f"Character confidences: {[f'{c:.2f}' for c in char_confidences[:len(best_plate)]]}")
    
    return corrected_plate

def process_multiple_plates(image_paths):
    results = {}
    
    if isinstance(image_paths, str):
        if os.path.isdir(image_paths):
            image_extensions = ['.jpg', '.jpeg', '.png', '.jfif', '.bmp', '.tiff', '.webp']
            image_paths = [
                str(p) for p in Path(image_paths).iterdir() 
                if p.suffix.lower() in image_extensions
            ]
        else:
            image_paths = [image_paths]
    
    for image_path in image_paths:
        print(f"\n{'='*60}")
        print(f"Processing: {os.path.basename(image_path)}")
        print(f"{'='*60}")
        plate_result = finalize_plate_id(image_path)
        filename = os.path.basename(image_path)
        results[filename] = plate_result
        print(f"\n{'='*60}")
        print(f"FINAL RESULT for {filename}: {plate_result}")
        print(f"{'='*60}\n")
    
    return results

# Main execution - accept command line argument or use default
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        # Default test image (for testing purposes)
        image_path = r"C:\Users\pc41.ANGROUP\Downloads\license_plate_BG5031825_2025-12-23T09-09-16_1_conf75.jpg"
    
    result = finalize_plate_id(image_path)
    print(f"\n{'='*60}")
    print(f"FINAL PLATE RESULT: {result}")
    print(f"{'='*60}")