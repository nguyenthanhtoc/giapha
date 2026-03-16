from PIL import Image, ImageDraw, ImageFont
import os

img_path = 'input.jpg'
output_path = 'grid_overlay.jpg'

img = Image.open(img_path)
width, height = img.size

draw = ImageDraw.Draw(img)

# Draw grid lines every 200 pixels
step = 200
for x in range(0, width, step):
    draw.line((x, 0, x, height), fill='red', width=2)
    # Add coordinates
    draw.text((x+5, 5), f"X={x}", fill='red')

for y in range(0, height, step):
    draw.line((0, y, width, y), fill='red', width=2)
    draw.text((5, y+5), f"Y={y}", fill='red')

img.save(output_path, 'JPEG', quality=95)
print(f"Saved grid overlay image: {output_path}")
