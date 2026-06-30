import os
from PIL import Image
import numpy as np

def process_logo(input_path, output_png, favicon_path):
    # Ensure public dir exists
    os.makedirs(os.path.dirname(output_png), exist_ok=True)
    
    # Load image
    img = Image.open(input_path).convert("RGBA")
    
    # We will create a mask of the background.
    # Convert image to numpy array
    arr = np.array(img)
    
    # Background is white or near-white.
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # A simple threshold is making pixels where r>240, g>240, b>240 transparent.
    is_bg = (r > 240) & (g > 240) & (b > 240)
    
    # Make them transparent
    arr[is_bg, 3] = 0
    
    # Recreate image
    out_img = Image.fromarray(arr, 'RGBA')
    
    # Crop the image to bounding box of non-transparent pixels
    bbox = out_img.getbbox()
    if bbox:
        out_img = out_img.crop(bbox)
        
    # Save logo.png
    out_img.save(output_png, format="PNG")
    print(f"Saved {output_png} (Size: {out_img.size})")
    
    # Save favicon.png (32x32)
    # We want to keep aspect ratio, so we'll use thumbnail or resize
    favicon = out_img.copy()
    favicon.thumbnail((32, 32), Image.Resampling.LANCZOS)
    
    # Favicon usually wants a square. Let's create a 32x32 transparent square and paste it in the center.
    fav_square = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    offset = ((32 - favicon.width) // 2, (32 - favicon.height) // 2)
    fav_square.paste(favicon, offset)
    
    fav_square.save(favicon_path, format="PNG")
    print(f"Saved {favicon_path} (Size: {fav_square.size})")

if __name__ == "__main__":
    input_jpg = r"C:\Users\TUSHAR MAGAR\.gemini\antigravity-ide\brain\bba4e771-bd12-4ef7-ae3d-dd1daf5e7f98\media__1782542923915.jpg"
    out_logo = r"c:\Users\TUSHAR MAGAR\Downloads\bridgeai\frontend\public\logo.png"
    out_favicon = r"c:\Users\TUSHAR MAGAR\Downloads\bridgeai\frontend\public\favicon.png"
    process_logo(input_jpg, out_logo, out_favicon)
