# template_generator.py

from PIL import Image, ImageDraw
from io import BytesIO
from fonts import load_font

def create_template(width, height, background_color, text_boxes):
    """
    Creates a blank meme template and returns it as bytes.

    Args:
        width (int): The width of the template image.
        height (int): The height of the template image.
        background_color (str): The background color of the template.
        text_boxes (list): A list of dictionaries, each defining a text box.
                             e.g., [{'text': '...', 'x': 10, 'y': 10, ...}]
    
    Returns:
        bytes: The generated image in PNG format as bytes, or None on error.
    """
    try:
        img = Image.new('RGB', (width, height), color=background_color)
        draw = ImageDraw.Draw(img)

        for box in text_boxes:
            text = box.get('text', '')
            x = int(box.get('x', 10))
            y = int(box.get('y', 10))
            font_size = int(box.get('font_size', 30))
            color = box.get('color', '#CCCCCC')
            font = load_font(font_size, bold=False)
            draw.text((x, y), text, font=font, fill=color)

        # Save image to a byte stream
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='PNG')
        return img_byte_arr.getvalue()

    except Exception as e:
        print(f"Error creating template: {e}")
        return None