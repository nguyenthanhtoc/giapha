from PIL import Image
import os

img_path = 'input.jpg'
output_dir = 'temp_crops'

os.makedirs(output_dir, exist_ok=True)

img = Image.open(img_path)
width, height = img.size

# Split into 10 horizontal bands
num_bands = 10
band_height = height // num_bands

for i in range(num_bands):
    top = i * band_height
    bottom = (i + 1) * band_height if i < num_bands - 1 else height
    
    cropped = img.crop((0, top, width, bottom))
    cropped.save(f'{output_dir}/band_{i+1}.jpg', 'JPEG', quality=100)
    print(f"Saved band_{i+1}.jpg")
