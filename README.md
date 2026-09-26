<h1 align="center">
  🎨 AI Poster & Meme Generator
</h1>

<p align="center">
  <strong>A powerful web application that combines AI-powered poster creation with classic meme generation</strong>
</p>
<p align="center">
  <a href="https://youtu.be/E0MY3KX-C8I" target="_blank">
    <img src="https://img.youtube.com/vi/E0MY3KX-C8I/hqdefault.jpg" alt="AI Meme Generator Demo" width="600"/>
  </a>
  <br>
  <em>Click the image to watch the full demo on YouTube</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-2.0+-green?style=for-the-badge&logo=flask" alt="Flask Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Stable%20Diffusion-XL-orange?style=for-the-badge" alt="Stable Diffusion">
</p>

## ✨ **Features**

<div align="center">

| 🤖 AI Magic | 🎭 Meme Master | 🎨 Custom Creator |
|-------------|----------------|-------------------|
| **AI Poster Generation** with Stable Diffusion XL | **Classic Meme Templates** from Imgflip API | **Full Text Customization** with drag & drop |
| Transform text prompts into stunning visuals | Popular meme formats always up-to-date | Position text anywhere on your image |

</div>

### 🚀 **Key Highlights**

- **🖼️ Custom Template Builder** - Create your own canvas with custom sizes and backgrounds
- **⚡ Lightweight & Fast** - Built with Flask and Pillow for optimal performance
- **🔒 Secure Setup** - Interactive configuration with environment variable protection
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices


## 🛠️ **Quick Start**

### **Prerequisites**
- 🐍 Python 3.8 or higher
- 📦 pip package manager

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/ChinmayDubey231/ai-meme-generator.git
cd ai-meme-generator

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt
```

### **🔑 API Configuration**

```bash
# 4. Run the setup wizard (writes a .env file)
python setup.py
```

💡 Get your API key: [Hugging Face → Settings → Access Tokens](https://huggingface.co/settings/tokens)

Optional environment variables (in `.env` or your host's settings):

| Variable | Default | Purpose |
|----------|---------|---------|
| `HUGGING_FACE_TOKEN` | — | **Required** for AI posters |
| `SECRET_KEY` | dev key | Flask secret key |
| `HF_MODEL` | `stabilityai/stable-diffusion-xl-base-1.0` | Any text-to-image model on Hugging Face |
| `HF_API_URL` | Hugging Face router URL for `HF_MODEL` | Override the inference endpoint entirely |
| `FLASK_DEBUG` | `0` | Set to `1` for auto-reload and debug pages (local only) |

### **🎯 Launch Application**

```bash
# 5. Start the server
python app.py
```

🌐 Open your browser at **http://127.0.0.1:5000**

For production, the included `Procfile` runs `gunicorn app:app`.

## 📁 **Project Structure**

```text
ai-meme-generator/
├── app.py                 # Flask routes and input validation
├── meme_generator.py      # Meme rendering (text layout, wrapping, outlines)
├── template_generator.py  # Blank custom template builder (/generate_template)
├── ai_client.py           # Hugging Face API client
├── fonts.py               # Cross-platform font loading with fallbacks
├── config.py              # Configuration and limits
├── setup.py               # Interactive setup wizard
├── test_app.py            # Test suite (pytest)
├── requirements.txt
├── Procfile               # Production server command
├── static/
│   ├── css/style.css
│   ├── js/script.js
│   └── images/templates/  # Local meme templates (auto-listed in the UI)
└── templates/
    └── index.html
```

## 🎮 **How to Use**

**Creating Memes 🎭**
1. Pick a template from the dropdown, or click **Load Templates** to browse and search 100 popular Imgflip templates.
2. Type your top and bottom text. Long captions are wrapped and shrunk to fit automatically.
3. Optionally click **Add Text Box** to place extra captions anywhere, with their own size.
4. Click **Generate Meme** and download the result.

**Generating AI Posters 🤖**
1. Describe your image in the prompt box.
2. Click **Generate Poster**. The first request can take up to a minute while the model warms up.

**Adding Your Own Templates 🖼️**

Drop any `.jpg`, `.png` or `.webp` image into `static/images/templates/` and it appears in the dropdown on the next page load.

## 🔧 **Technical Details**

| Technology | Purpose |
|------------|---------|
| Flask | Web framework |
| Pillow | Image processing |
| Requests | API communication |
| python-dotenv | Environment management |
| Gunicorn | Production server |

**APIs Integrated**
- 🤗 **Hugging Face** - Stable Diffusion XL for AI image generation
- 🖼️ **Imgflip** - Live meme template database (cached for an hour)

## 🧪 **Running Tests**

```bash
pip install pytest
python -m pytest
```

The tests run offline; the Hugging Face API is mocked.

## 🐛 **Troubleshooting**

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| "Invalid Hugging Face token" | Re-run `python setup.py` with a valid token |
| "The AI model is warming up" | Wait a minute and try again |
| Port 5000 already in use | `flask --app app run --port 5001` |
| Captions look plain | Install the Impact font; otherwise a bold fallback font is used |

## 🤝 **Contributing**

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin amazing-feature`)
5. 🔁 Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Hugging Face for providing the Stable Diffusion XL API
- Imgflip for their comprehensive meme template API
- The Flask and Pillow communities

## 📞 **Support**

- 📧 Email: chinmaydubey231@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/ChinmayDubey231/ai-meme-generator/issues)

<div align="center">

⭐ Don't forget to star this repository if you find it useful!

Made with ❤️ and ☕ by Chinmay Dubey

</div>
