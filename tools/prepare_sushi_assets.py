from pathlib import Path
import re
import shutil
from PIL import Image

root = Path(__file__).resolve().parent.parent
sushi_dir = root / 'SUSHI'
images_dir = root / 'images'
brands_dir = images_dir / 'brands'

images_dir.mkdir(exist_ok=True)
brands_dir.mkdir(exist_ok=True)


def norm_name(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-')


def remove_white_background(input_path: Path, output_path: Path, threshold: int = 245):
    img = Image.open(input_path).convert('RGBA')
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (255, 255, 255, 0)
    img.save(output_path)


# Build transparent logo asset used by the site
logo_candidates = [
    sushi_dir / 'Ninja Revolving logo.png',
    next((p for p in sushi_dir.rglob('Ninja Revolving logo.png') if p.is_file()), None),
]
logo_src = next((p for p in logo_candidates if p is not None and p.exists()), None)
if logo_src:
    remove_white_background(logo_src, images_dir / 'logo_alpha_final.png')

# Copy brand assets for delivery buttons if needed
for src in sushi_dir.joinpath('brands').glob('*'):
    if src.is_file() and not src.name.startswith('._'):
        shutil.copy2(src, brands_dir / src.name)

# All menu image sourcing now comes directly from the SUSHI folders.
# The copied images/menu and images/menu-cards directories are intentionally not used.
print('Using SUSHI folders as the menu image source of truth.')
print('Logo written to:', images_dir / 'logo_alpha_final.png')
