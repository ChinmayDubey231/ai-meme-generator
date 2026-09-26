# app.py

from flask import Flask, render_template, request, jsonify, send_file
from meme_generator import MemeGenerator, TemplateError
from ai_client import AIGenerationError
import template_generator
import config
import io
import time
import requests

Config = config.Config

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024  # JSON payloads only; reject huge bodies

meme_gen_instance = MemeGenerator()

try:
    Config.validate_config()
    print("✓ Configuration validated successfully")
except ValueError as e:
    print(f"❌ Configuration error: {e}")

# Imgflip's list changes rarely; cache it to avoid hitting their API on every click
_TEMPLATE_CACHE = {'data': None, 'fetched_at': 0}
TEMPLATE_CACHE_TTL = 60 * 60


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _int_in_range(value, default, low, high):
    try:
        value = int(float(value))
    except (TypeError, ValueError):
        value = default
    return max(low, min(high, value))


def _text(value, limit=Config.MAX_TEXT_LENGTH):
    return str(value or '')[:limit]


def _png_response(image_data, filename):
    return send_file(io.BytesIO(image_data), mimetype='image/png', download_name=filename)


@app.route('/')
def index():
    return render_template('index.html', local_templates=meme_gen_instance.list_local_templates())


@app.route('/fetch_templates')
def fetch_templates():
    now = time.time()
    if _TEMPLATE_CACHE['data'] and now - _TEMPLATE_CACHE['fetched_at'] < TEMPLATE_CACHE_TTL:
        return jsonify(_TEMPLATE_CACHE['data'])
    try:
        response = requests.get("https://api.imgflip.com/get_memes", timeout=Config.HTTP_TIMEOUT)
        response.raise_for_status()
        data = response.json()
    except (requests.exceptions.RequestException, ValueError):
        return jsonify({"error": "Could not reach Imgflip. Please try again later."}), 502
    if not data.get("success"):
        return jsonify({"error": "Failed to fetch memes from Imgflip"}), 502
    memes = [
        {k: m.get(k) for k in ('id', 'name', 'url', 'width', 'height', 'box_count')}
        for m in data["data"]["memes"]
    ]
    _TEMPLATE_CACHE.update(data=memes, fetched_at=now)
    return jsonify(memes)


@app.route('/generate_template', methods=['POST'])
def generate_template():
    data = _json_body()
    max_dim = Config.MAX_TEMPLATE_DIMENSION
    width = _int_in_range(data.get('width'), 800, 50, max_dim)
    height = _int_in_range(data.get('height'), 600, 50, max_dim)
    background_color = _text(data.get('background_color') or '#FFFFFF', 32)
    text_boxes = []
    for box in (data.get('text_boxes') or [])[:Config.MAX_CUSTOM_TEXTS]:
        if not isinstance(box, dict):
            continue
        text_boxes.append({
            'text': _text(box.get('text')),
            'x': _int_in_range(box.get('x'), 10, 0, width),
            'y': _int_in_range(box.get('y'), 10, 0, height),
            'font_size': _int_in_range(box.get('font_size'), 30, 6, 300),
            'color': _text(box.get('color') or '#CCCCCC', 32),
        })
    image_data = template_generator.create_template(width, height, background_color, text_boxes)
    if image_data is None:
        return jsonify({'error': 'Failed to generate template. Check the colors are valid.'}), 400
    return _png_response(image_data, 'template.png')


@app.route('/generate_meme', methods=['POST'])
def generate_meme():
    data = _json_body()
    template = _text(data.get('template'), 500)
    top_text = _text(data.get('top_text'))
    bottom_text = _text(data.get('bottom_text'))
    custom_texts = [
        {**t, 'text': _text(t.get('text'))}
        for t in (data.get('custom_texts') or [])[:Config.MAX_CUSTOM_TEXTS]
        if isinstance(t, dict)
    ]

    if not template:
        return jsonify({'error': 'Template is required'}), 400

    try:
        image_data = meme_gen_instance.create_meme(template, top_text, bottom_text, custom_texts)
    except TemplateError as e:
        return jsonify({'error': str(e)}), 400

    if image_data is None:
        return jsonify({'error': 'Failed to generate meme'}), 500

    return _png_response(image_data, 'meme.png')


@app.route('/generate_poster', methods=['POST'])
def generate_poster():
    prompt = _text(_json_body().get('prompt'), Config.MAX_PROMPT_LENGTH).strip()
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    try:
        image_data = meme_gen_instance.generate_ai_poster(prompt)
    except AIGenerationError as e:
        return jsonify({'error': str(e)}), 502
    return _png_response(image_data, 'poster.png')


@app.errorhandler(413)
def payload_too_large(_):
    return jsonify({'error': 'Request is too large'}), 413


@app.route('/health')
def health_check():
    try:
        Config.validate_config()
        return jsonify({'status': 'healthy', "huggingface_configured": True})
    except ValueError:
        return jsonify({'status': 'unhealthy', "huggingface_configured": False}), 500


if __name__ == '__main__':
    app.run(debug=Config.DEBUG)
