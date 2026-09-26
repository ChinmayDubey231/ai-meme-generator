# fonts.py

from functools import lru_cache
from PIL import ImageFont

# Tried in order. Impact is the classic meme font; the rest are bold sans-serif
# fonts commonly available on Windows, macOS and Linux (including Heroku/Render).
MEME_FONTS = [
    "impact.ttf",
    "Impact.ttf",
    "/Library/Fonts/Impact.ttf",
    "/System/Library/Fonts/Supplemental/Impact.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Impact.ttf",
    "arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]

REGULAR_FONTS = [
    "arial.ttf",
    "Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
]


@lru_cache(maxsize=128)
def load_font(size, bold=True):
    """Return a scalable font of the given size, falling back gracefully."""
    size = max(1, int(size))
    for path in (MEME_FONTS if bold else REGULAR_FONTS):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    # Pillow >= 10.1 ships a scalable default font; older versions ignore size.
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()
