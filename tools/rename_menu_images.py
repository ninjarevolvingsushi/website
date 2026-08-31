from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CARD_DIR = ROOT / "images" / "menu-cards"
MENU_DIR = ROOT / "images" / "menu"
HTML_FILE = ROOT / "index.html"
EXTS = {".png", ".jpg", ".jpeg", ".webp"}

APPLY = "--apply" in sys.argv


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


# menu-item slug -> filename slugs that could hold that photo.
# Direction matters: the loop looks these up by MENU SLUG.
ALIAS_MAP: dict[str, list[str]] = {
    "avocado-maki": ["avocado"],
    "avocado-hand-roll": ["avocado"],
    "avocado-hand-roll-soy-paper": ["avocado"],
    "bulgogi-tofu-inari-gunkan": ["bulgogi-inari"],
    "california-roll": ["california"],
    "california-hand-roll": ["california"],
    "california-hand-roll-soy-paper": ["california"],
    "caterpillar-roll": ["caterpillar"],
    "cowboy-roll": ["cowboy"],
    "crab-meat-gunkan": ["crabmeat-gunkan"],
    "crabstick": ["crabstick-nigiri"],
    "crispy-squid": ["squid"],
    "crunch-ninja": ["cunch-ninja"],
    "cucumber-maki": ["cucumber-maki-roll"],
    "cucumber-hand-roll": ["cucumber-maki-roll"],
    "cucumber-hand-roll-soy-paper": ["cucumber-maki-roll"],
    "eel": ["eel-nigiri", "eel-nigiri-sushi"],
    "eel-hand-roll": ["eel-nigiri"],
    "eel-hand-roll-soy-paper": ["eel-nigiri"],
    "hokkido-scallop": ["scallops-nigiri"],
    "ikura-salmon-roe-gunkan": ["ikura-gunkan"],
    "inari-with-corn-salad-gunkan": ["corn-inari"],
    "inari-with-seaweed-salad-gunkan": ["seaweed-salad-inari"],
    "joe-pool-lake-roll": ["lake-joe-pool-roll", "lake-joe-pool"],
    "lion-king": ["lion-king-roll", "loin-king-roll"],
    "louisian-roll": ["louisiana-roll"],
    "mango-tango": ["mango-tango-roll"],
    "matcha-daifuku-red-bean": ["matcha-daifuku"],
    "miami-beach": ["miami-beach-roll"],
    "ninja-cucumber-salad": ["cucumber-salad"],
    "octopus": ["octopus-nigiri", "octopus-nigiri-sushi"],
    "premium-american-beef": ["premium-beef-nigiri"],
    "premium-american-beef-gunkan": ["premium-beef-gunkan"],
    "red-bean-daifuku": ["daifuku"],
    "salmon": ["salmon-nigiri"],
    "salmon-maki": ["salmon-maki-roll"],
    "salmon-toro": ["toro-nigiri"],
    "scallop-crunch": ["scallop-crunch-roll"],
    "seared-beef-with-yakiniku-sauce": ["yakiniku-beef"],
    "seared-eel-with-miso-cream-cheese": ["eel-with-miso"],
    "seared-salmon-with-japanese-mayo": ["seared-salmon"],
    "seared-scallop-with-japanese-mayo": ["seared-scallops-nigiri"],
    "sexy-veggie": ["sexy-veggies-roll"],
    "shrimp": ["shrimp-nigiri"],
    "shrimp-tempura-roll": ["shrimp-tempura"],
    "shrimp-tempura-handroll": ["shrimp-tempura"],
    "shrimp-tempura-hand-roll-soy-paper": ["shrimp-tempura"],
    "spicy-popcorn-shrimp-roll": ["popcorn-shrimp"],
    "spider-roll": ["spider"],
    "spider-hand-roll": ["spider"],
    "spider-hand-roll-soy-paper": ["spider"],
    "squid": ["squid"],
    "sweet-shrimp-red-shrimp": ["sweet-shrimp-nigiri"],
    "tuna": ["tuna-nigiri"],
    "tuna-gunkan": ["tuna-inari"],
    "umami-oil-hokkido-octopus-gunkan": ["octopus-gunkan"],
    "umami-oil-salmon": ["umami-oil-slamon", "umami-salmon"],
    "umami-oil-seared-beef": ["umami-oil-beef"],
    "umami-sesame-patagonian-scallops-gunkan": ["scallops-gunkan"],
    "yuzu-cheese-cake": ["yuzu-chessecake"],
    "yuzu-jalapeno-sweet-shrimp": ["sweet-shrimp-with-yuzu"],
    "yuzu-jalapeno-tuna": ["tuna-with-yuzu"],
}


def main() -> int:
    if not HTML_FILE.exists():
        print(f"ERROR: {HTML_FILE} not found. Run this from the project root.")
        return 1
    if not CARD_DIR.exists():
        print(f"ERROR: {CARD_DIR} not found.")
        return 1

    html = HTML_FILE.read_text(encoding="utf-8")
    menu_names = re.findall(r'n:\s*"([^"]+)"', html)
    required = sorted({slugify(n) for n in menu_names if slugify(n)})

    cards: dict[str, Path] = {}
    for f in sorted(CARD_DIR.iterdir()):
        if f.suffix.lower() in EXTS:
            cards.setdefault(slugify(f.stem), f)

    MENU_DIR.mkdir(parents=True, exist_ok=True)

    matched, missing = [], []
    for slug in required:
        src = cards.get(slug)
        if src is None:
            for alias in ALIAS_MAP.get(slug, []):
                src = cards.get(slugify(alias))
                if src is not None:
                    break
        if src is None:
            missing.append(slug)
            continue

        dst = MENU_DIR / f"{slug}{src.suffix.lower()}"
        matched.append((src.name, dst.name))
        if APPLY and not dst.exists():
            shutil.copy2(src, dst)

    used = {src_name for src_name, _ in matched}
    unused = sorted(f.name for k, f in cards.items() if f.name not in used)

    mode = "COPIED" if APPLY else "WOULD COPY (dry run)"
    print(f"Menu items on the site : {len(required)}")
    print(f"Photos in menu-cards   : {len(cards)}")
    print(f"{mode:<22} : {len(matched)}")
    print(f"Still missing a photo   : {len(missing)}\n")

    for src, dst in matched:
        print(f"  {src}  ->  images/menu/{dst}")

    if missing:
        print(f"\n--- {len(missing)} MENU ITEMS WITH NO PHOTO ---")
        for m in missing:
            print(f"  {m}")

    if unused:
        print(f"\n--- {len(unused)} PHOTOS NOT USED BY ANY MENU ITEM ---")
        print("(add an ALIAS_MAP entry if one of these belongs to a menu item)")
        for u in unused:
            print(f"  {u}")

    if not APPLY:
        print("\nNothing was changed. Re-run with --apply to copy the files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
