import cv2
import numpy as np
import os

img_path = 'input.jpg'
output_dir = 'temp_boxes'
os.makedirs(output_dir, exist_ok=True)

img = cv2.imread(img_path)
h, w = img.shape[:2]

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Apply Gaussian Blur to smooth before Edge detection
blurred = cv2.GaussianBlur(gray, (5, 5), 0)

# Apply Canny edge detection
edged = cv2.Canny(blurred, 50, 150)

# Find contours from Edge map
contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

boxes = []
for cnt in contours:
    x, y, bw, bh = cv2.boundingRect(cnt)
    # Dimensions bounding box sizing matches Family tree plate setup
    if 100 < bw < 400 and 20 < bh < 80:
        boxes.append((x, y, bw, bh))

# Sort boxes primarily by Y with a tolerance of 60px
sorted_boxes = sorted(boxes, key=lambda b: (b[1] // 60 * 60, b[0]))

print(f"Detected {len(sorted_boxes)} boxes with Canny.")

# Group into rows
rows = {}
for box in sorted_boxes:
    x, y, bw, bh = box
    row_idx = y // 60 * 60
    if row_idx not in rows:
        rows[row_idx] = []
    rows[row_idx].append(box)

box_index = 1
for row_idx in sorted(rows.keys()):
    row_boxes = sorted(rows[row_idx], key=lambda b: b[0])
    row_dir = os.path.join(output_dir, f"row_{row_idx}")
    os.makedirs(row_dir, exist_ok=True)
    
    for x, y, bw, bh in row_boxes:
        crop = img[max(0, y-2):min(h, y+bh+2), max(0, x-2):min(w, x+bw+2)]
        crop_name = f"box_{box_index}_X{x}_Y{y}.jpg"
        cv2.imwrite(os.path.join(row_dir, crop_name), crop)
        box_index += 1

print(f"Saved {box_index - 1} crops to {output_dir}")
