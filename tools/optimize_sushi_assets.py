from pathlib import Path
from PIL import Image, ImageOps

root = Path(r'.\SUSHI')
allowed = {'.png', '.jpg', '.jpeg', '.bmp', '.tif', '.tiff'}
count = 0
skipped = []
for p in sorted(root.rglob('*')):
    if not p.is_file() or p.suffix.lower() not in allowed:
        continue
    if p.name.startswith('._'):
        continue
    try:
        with Image.open(p) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode in ('RGBA', 'LA', 'P', 'RGBa'):
                rgb = img.convert('RGBA')
            else:
                rgb = img.convert('RGB')
            w, h = rgb.size
            max_dim = 600
            scale = min(1.0, max_dim / max(w, h))
            if scale < 1.0:
                rgb = rgb.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)
            out = p.with_suffix('.webp')
            rgb.save(out, 'WEBP', quality=25, method=6, optimize=True, lossless=False)
            count += 1
    except Exception as e:
        skipped.append(f'{p}: {e}')
print(f'REENCODED={count}')
print(f'SKIPPED={len(skipped)}')
for item in skipped[:10]:
    print(item)
