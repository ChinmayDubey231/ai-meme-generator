<h1 align="center">
  🎨 AI Poster & Meme Generator
</h1>

<p align="center">
  <strong>A powerful web application that combines AI-powered poster creation with classic meme generation</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.6+-blue?style=for-the-badge&logo=python" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-2.0+-green?style=for-the-badge&logo=flask" alt="Flask Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Stable%20Diffusion-XL-orange?style=for-the-badge" alt="Stable Diffusion">
</p>

<p align="center">
  <img width="600" src="https://via.placeholder.com/600x300/4F46E5/FFFFFF?text=AI+Poster+%26+Meme+Generator" alt="Project Banner">
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
- 🐍 Python 3.6 or higher
- 📦 pip package manager

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ai-poster-meme-generator.git
cd ai-poster-meme-generator

# 2. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
🔑 API Configuration
bash
# 4. Run the setup wizard
python setup.py
💡 Get your API key: Visit Hugging Face → Settings → Access Tokens

🎯 Launch Application
bash
# 5. Start the server
python app.py
🌐 Open your browser and navigate to: http://127.0.0.1:5000

📁 Project Structure
text
ai-poster-meme-generator/
├── 🐍 app.py                 # Main Flask application
├── ⚙️ setup.py              # Interactive setup wizard
├── 🔧 config.py             # Configuration manager
├── 🎭 meme_generator.py     # Meme creation engine
├── 🤖 ai_client.py          # Hugging Face API client
├── 📋 requirements.txt      # Dependencies list
├── 🔐 .env                  # Secure environment variables
├── 🎨 static/
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   └── images/              # Assets and icons
└── 📄 templates/
    ├── base.html            # Main template
    ├── index.html           # Homepage
    ├── meme.html            # Meme creator
    └── ai_poster.html       # AI generator
🎮 How to Use
Creating Memes 🎭
Select "Create Meme" from the dashboard

Choose from trending templates or upload your own

Customize with text, emojis, and effects

Download or share your masterpiece

Generating AI Posters 🤖
Click "AI Poster Generator"

Describe your vision in the prompt box

Adjust settings (optional)

Generate and watch the AI work its magic

Save your unique artwork

Building Custom Templates 🎨
Access the template builder

Set canvas dimensions and background

Add placeholder text elements

Save as reusable template

🔧 Technical Details
Built With
Technology	Purpose	Version
Flask	Web Framework	2.0+
Pillow	Image Processing	Latest
Requests	API Communication	Latest
Python-dotenv	Environment Management	Latest
APIs Integrated
🤗 Hugging Face - Stable Diffusion XL for AI image generation

🖼️ Imgflip - Live meme template database

🐛 Troubleshooting
Common Issues
Problem	Solution
ModuleNotFoundError	Run pip install -r requirements.txt
API Key Error	Re-run python setup.py with valid token
Port Already in Use	Use python app.py --port 5001
Image Generation Fails	Check internet connection and API quota
Debug Mode
bash
# Enable debug mode for detailed logs
python app.py --debug
🤝 Contributing
We love contributions! Here's how you can help:

🍴 Fork the repository

🌿 Create a feature branch (git checkout -b amazing-feature)

💾 Commit your changes (git commit -m 'Add amazing feature')

📤 Push to the branch (git push origin amazing-feature)

🔁 Open a Pull Request

Development Setup
bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
python -m pytest

# Code formatting
black .
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Hugging Face for providing the Stable Diffusion XL API

Imgflip for their comprehensive meme template API

Flask community for excellent documentation

Pillow maintainers for robust image processing

📞 Support
Need help? Here are your options:

📧 Email: support@yourdomain.com

🐛 Issues: GitHub Issues

💬 Discussions: GitHub Discussions

📚 Documentation: Wiki

<div align="center">
⭐ Don't forget to star this repository if you find it useful!
Made with ❤️ and ☕ by [Your Name]

<p align="center"> <img src="https://img.shields.io/github/stars/yourusername/ai-poster-meme-generator?style=social" alt="GitHub stars"> <img src="https://img.shields.io/github/forks/yourusername/ai-poster-meme-generator?style=social" alt="GitHub forks"> <img src="https://img.shields.io/github/watchers/yourusername/ai-poster-meme-generator?style=social" alt="GitHub watchers"> </p></div> ```
