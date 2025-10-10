# app.py

from flask import Flask, render_template, request, jsonify, send_file
from meme_generator import MemeGenerator
import template_generator 
import config
import io
import requests

app = Flask(__name__)
app.secret_key = config.Config.SECRET_KEY

meme_gen_instance = MemeGenerator()

try:
    config.Config.validate_config()
    print("✓ Configuration validated successfully")
except ValueError as e:
    print(f"❌ Configuration error: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_templates')
def fetch_templates():
    try:
        response = requests.get("https://api.imgflip.com/get_memes")
        response.raise_for_status()
        data = response.json()
        if data.get("success"):
            return jsonify(data["data"]["memes"])
        else:
            return jsonify({"error": "Failed to fetch memes from Imgflip"}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_template', methods=['POST'])
def generate_template():
    data = request.json
    width = data.get('width', 800)
    height = data.get('height', 600)
    background_color = data.get('background_color', '#FFFFFF')
    text_boxes = data.get('text_boxes', [])
    image_data = template_generator.create_template(width, height, background_color, text_boxes)
    if image_data is None:
        return jsonify({'error': 'Failed to generate template'}), 500
    return send_file(io.BytesIO(image_data), mimetype='image/png')

@app.route('/generate_meme', methods=['POST'])
def generate_meme():
    data = request.json
    template = data.get('template')
    top_text = data.get('top_text', '')
    bottom_text = data.get('bottom_text', '')
    custom_texts = data.get('custom_texts', [])

    if not template:
        return jsonify({'error': 'Template is required'}), 400

    image_data = meme_gen_instance.create_meme(template, top_text, bottom_text, custom_texts)

    if image_data is None:
        return jsonify({'error': 'Failed to generate meme'}), 500

    return send_file(io.BytesIO(image_data), mimetype='image/png')

@app.route('/generate_poster', methods=['POST'])
def generate_poster():
    prompt = request.json.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    image_data = meme_gen_instance.generate_ai_poster(prompt)
    if image_data is None:
        return jsonify({'error': 'Failed to generate poster'}), 500
    return send_file(io.BytesIO(image_data), mimetype='image/png')

@app.route('/health')
def health_check():
    try:
        config.Config.validate_config()
        return jsonify({'status': 'healthy', "huggingface_configured": True})
    except ValueError:
        return jsonify({'status': 'unhealthy', "huggingface_configured": False}), 500

if __name__ == '__main__':
    app.run(debug=True)