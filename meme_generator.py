# meme_generator.py

from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import ai_client
import os
import requests 
import io       

class MemeGenerator:
    def __init__(self, templates_path="static/images/templates/"):
        self.templates_path = templates_path
        self.layouts = {
            'drake.jpg': {
                'top': {'pos': (0.25, 0.25), 'max_width_ratio': 0.45},
                'bottom': {'pos': (0.25, 0.75), 'max_width_ratio': 0.45}
            }
        }
        if not os.path.isdir(self.templates_path):
            print(f"Warning: Templates directory not found at '{self.templates_path}'")

    def create_meme(self, template_name, top_text, bottom_text, custom_texts=None):
        try:
            image = None
            if template_name.startswith('http'):
                response = requests.get(template_name)
                response.raise_for_status()
                image_bytes = io.BytesIO(response.content)
                image = Image.open(image_bytes).convert("RGBA")
            else:
                template_path = os.path.join(self.templates_path, template_name)
                image = Image.open(template_path).convert("RGBA")

            if image is None:
                raise ValueError("Could not load image from template.")

            max_size = (1200, 1200)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            draw = ImageDraw.Draw(image)

            local_filename = os.path.basename(template_name)
            self._add_text(draw, top_text.upper(), 'top', image.size, local_filename)
            self._add_text(draw, bottom_text.upper(), 'bottom', image.size, local_filename)

            if custom_texts:
                for text_info in custom_texts:
                    self._add_custom_text(draw, text_info, image.size)
            
            image = image.convert("RGB")
            img_byte_arr = BytesIO()
            image.save(img_byte_arr, format='PNG')
            return img_byte_arr.getvalue()
            
        except Exception as e:
            print(f"Error creating meme: {e}")
            return None

    def _add_custom_text(self, draw, text_info, image_size):
        text = text_info.get("text", "").upper()
        if not text:
            return

        width, height = image_size
        x = width * (int(text_info.get("x", 50)) / 100)
        y = height * (int(text_info.get("y", 50)) / 100)
        font_size = int(text_info.get("size", height / 15))

        try:
            font = ImageFont.truetype("impact.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

        bbox = font.getbbox(text)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x -= text_width / 2
        y -= text_height / 2

        self._draw_text_with_outline(draw, (x, y), text, font)

    def _draw_text_with_outline(self, draw, pos, text, font):
        x, y = pos
        outline_thickness = 2
        for dx in range(-outline_thickness, outline_thickness + 1):
            for dy in range(-outline_thickness, outline_thickness + 1):
                if dx != 0 or dy != 0:
                    draw.text((x + dx, y + dy), text, font=font, fill='black')
        draw.text((x, y), text, font=font, fill='white')

    def _wrap_text(self, text, font, max_width):
        lines = []
        if not text: return lines
        words = text.split(' ')
        current_line = ""
        for word in words:
            test_line = f"{current_line} {word}".strip()
            bbox = font.getbbox(test_line)
            if bbox[2] - bbox[0] <= max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        lines.append(current_line)
        return lines

    def _add_text(self, draw, text, position, image_size, template_name):
        if not text: return
        width, height = image_size
        layout = {'pos': (0.5, 0.1 if position == 'top' else 0.9), 'max_width_ratio': 0.9}
        if template_name in self.layouts and position in self.layouts[template_name]:
            layout = self.layouts[template_name][position]
        font_size = int(height / 12)
        try:
            font = ImageFont.truetype("impact.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()
        max_text_width = width * layout['max_width_ratio']
        wrapped_lines = self._wrap_text(text.strip(), font, max_text_width)
        line_heights = [font.getbbox(line)[3] - font.getbbox(line)[1] for line in wrapped_lines]
        line_spacing = 5
        total_text_height = sum(line_heights) + line_spacing * (len(wrapped_lines) - 1)
        center_y = height * layout['pos'][1]
        y = center_y - (total_text_height / 2)
        for i, line in enumerate(wrapped_lines):
            line_width = font.getbbox(line)[2] - font.getbbox(line)[0]
            center_x = width * layout['pos'][0]
            x = center_x - (line_width / 2)
            self._draw_text_with_outline(draw, (x, y), line, font)
            y += line_heights[i] + line_spacing

    def generate_ai_poster(self, prompt):
        return ai_client.generate_image(prompt)