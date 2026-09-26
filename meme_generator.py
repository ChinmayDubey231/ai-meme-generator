# meme_generator.py

from PIL import Image, ImageDraw, UnidentifiedImageError
from io import BytesIO
from urllib.parse import urlparse
import ai_client
import os
import requests
from config import Config
from fonts import load_font


class TemplateError(ValueError):
    """Raised when a template name/URL is invalid or cannot be loaded."""


class MemeGenerator:
    def __init__(self, templates_path=None):
        if templates_path is None:
            templates_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                          "static", "images", "templates")
        self.templates_path = templates_path
        self.layouts = {
            'drake.jpg': {
                'top': {'pos': (0.75, 0.25), 'max_width_ratio': 0.45,
                        'max_height_ratio': 0.4, 'fill': 'black', 'stroke': None},
                'bottom': {'pos': (0.75, 0.75), 'max_width_ratio': 0.45,
                           'max_height_ratio': 0.4, 'fill': 'black', 'stroke': None}
            }
        }
        if not os.path.isdir(self.templates_path):
            print(f"Warning: Templates directory not found at '{self.templates_path}'")

    def list_local_templates(self):
        if not os.path.isdir(self.templates_path):
            return []
        return sorted(
            f for f in os.listdir(self.templates_path)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
        )

    def _load_template(self, template_name):
        if template_name.startswith(('http://', 'https://')):
            host = urlparse(template_name).hostname or ''
            if host not in Config.ALLOWED_IMAGE_HOSTS:
                raise TemplateError("Remote templates must come from imgflip.com")
            try:
                response = requests.get(template_name, timeout=Config.HTTP_TIMEOUT)
                response.raise_for_status()
            except requests.exceptions.RequestException:
                raise TemplateError("Could not download the template image")
            source = BytesIO(response.content)
        else:
            # basename() prevents path traversal outside the templates directory
            safe_name = os.path.basename(template_name)
            source = os.path.join(self.templates_path, safe_name)
            if not safe_name or not os.path.isfile(source):
                raise TemplateError(f"Template '{template_name}' not found")
        try:
            return Image.open(source).convert("RGBA")
        except (UnidentifiedImageError, OSError):
            raise TemplateError("Template is not a valid image")

    def create_meme(self, template_name, top_text, bottom_text, custom_texts=None):
        """Returns PNG bytes. Raises TemplateError for bad templates, None on other errors."""
        image = self._load_template(template_name)
        try:
            image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            draw = ImageDraw.Draw(image)

            local_filename = os.path.basename(template_name)
            self._add_text(draw, top_text.upper(), 'top', image.size, local_filename)
            self._add_text(draw, bottom_text.upper(), 'bottom', image.size, local_filename)

            for text_info in custom_texts or []:
                self._add_custom_text(draw, text_info, image.size)

            image = image.convert("RGB")
            img_byte_arr = BytesIO()
            image.save(img_byte_arr, format='PNG')
            return img_byte_arr.getvalue()

        except Exception as e:
            print(f"Error creating meme: {e}")
            return None

    def _add_custom_text(self, draw, text_info, image_size):
        text = str(text_info.get("text", "")).upper()
        if not text.strip():
            return

        width, height = image_size
        x = width * (_clamp(text_info.get("x", 50), 0, 100) / 100)
        y = height * (_clamp(text_info.get("y", 50), 0, 100) / 100)
        size_pct = _clamp(text_info.get("size", 7), 2, 30)
        font = load_font(height * size_pct / 100)

        wrapped_lines = self._wrap_text(text.strip(), font, width * 0.9)
        self._draw_lines(draw, wrapped_lines, font, x, y)

    def _draw_text_with_outline(self, draw, pos, text, font, fill='white', stroke='black'):
        if stroke is None:
            draw.text(pos, text, font=font, fill=fill)
            return
        outline = max(2, int(font.size / 15)) if hasattr(font, 'size') else 2
        draw.text(pos, text, font=font, fill=fill, stroke_width=outline, stroke_fill=stroke)

    def _wrap_text(self, text, font, max_width):
        lines = []
        if not text:
            return lines
        current_line = ""
        for word in text.split():
            test_line = f"{current_line} {word}".strip()
            if _text_width(font, test_line) <= max_width or not current_line:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        lines.append(current_line)
        return lines

    def _draw_lines(self, draw, lines, font, center_x, center_y, fill='white', stroke='black'):
        """Draw lines of text centered on (center_x, center_y)."""
        if not lines:
            return
        ascent, descent = font.getmetrics()
        line_height = ascent + descent
        line_spacing = max(2, int(line_height * 0.1))
        total_height = line_height * len(lines) + line_spacing * (len(lines) - 1)
        y = center_y - total_height / 2
        for line in lines:
            x = center_x - _text_width(font, line) / 2
            self._draw_text_with_outline(draw, (x, y), line, font, fill, stroke)
            y += line_height + line_spacing

    def _add_text(self, draw, text, position, image_size, template_name):
        if not text or not text.strip():
            return
        width, height = image_size
        layout = {'pos': (0.5, 0.1 if position == 'top' else 0.9), 'max_width_ratio': 0.9,
                  'max_height_ratio': 0.22, 'fill': 'white', 'stroke': 'black'}
        layout.update(self.layouts.get(template_name, {}).get(position, {}))

        max_text_width = width * layout['max_width_ratio']
        # Shrink the font until the text fits in the layout's box
        font_size = int(height / 10)
        while True:
            font = load_font(font_size)
            wrapped_lines = self._wrap_text(text.strip(), font, max_text_width)
            ascent, descent = font.getmetrics()
            fits_height = len(wrapped_lines) * (ascent + descent) <= height * layout['max_height_ratio']
            fits_width = all(_text_width(font, l) <= max_text_width for l in wrapped_lines)
            if (fits_height and fits_width) or font_size <= 12:
                break
            font_size = int(font_size * 0.9)

        center_x = width * layout['pos'][0]
        center_y = height * layout['pos'][1]
        # Keep top/bottom captions from spilling off the image edge
        block_height = len(wrapped_lines) * (ascent + descent)
        margin = height * 0.03
        center_y = min(max(center_y, block_height / 2 + margin), height - block_height / 2 - margin)
        self._draw_lines(draw, wrapped_lines, font, center_x, center_y,
                         layout['fill'], layout['stroke'])

    def generate_ai_poster(self, prompt):
        return ai_client.generate_image(prompt)


def _text_width(font, text):
    bbox = font.getbbox(text)
    return bbox[2] - bbox[0]


def _clamp(value, low, high):
    try:
        value = float(value)
    except (TypeError, ValueError):
        value = (low + high) / 2
    return max(low, min(high, value))
