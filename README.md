🤖 AI Poster & Meme GeneratorA versatile web application built with Python and Flask that allows users to create both classic memes and unique, AI-generated posters. It features a simple and interactive web interface for all your creative needs.<p align="center"><img src="https://www.google.com/search?q=https://placehold.co/800x400/4F46E5/FFFFFF%3Ftext%3DProject%2BScreenshot%2BHere" alt="Project Screenshot"/></p><p align="center"><img src="https://img.shields.io/badge/Python-3.6+-blue.svg" alt="Python Version"><img src="https://img.shields.io/badge/Flask-2.0+-green.svg" alt="Flask Version"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></p>✨ Features🤖 AI Poster Generation: Leverages the power of the Stable Diffusion XL model through the Hugging Face API to transform any text prompt into a high-quality image.😂 Classic Meme Creation: Choose from a list of the most popular meme templates fetched live from the Imgflip API.✍️ Full Text Customization: Easily add and position top text, bottom text, and even multiple custom text boxes anywhere on your image.🖼️ Custom Template Builder: Don't see a template you like? Create your own from scratch by setting a canvas size, background color, and adding placeholder text.🚀 Simple & Lightweight: Built with a minimal footprint using Flask and the Pillow library for image manipulation, making it fast and easy to run.🔐 Secure Setup: Includes an interactive setup script to securely store your API keys in a .env file, keeping your secrets out of the code.🚀 Installation & SetupFollow these simple steps to get the application running locally.PrerequisitesPython 3.6+pip (Python package installer)1. Clone the RepositoryFirst, clone this repository to your local machine.git clone [https://github.com/ChinmayDubey231/ai-meme-generator.git](https://github.com/ChinmayDubey231/ai-meme-generator.git)
cd ai-meme-generator
2. Install DependenciesIt is highly recommended to use a Python virtual environment.# Create and activate a virtual environment
python -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt
3. Set Up Your API KeyThis project requires a Hugging Face API token for the AI features.Get a Token: Create a free account at huggingface.co and navigate to your Settings → Access Tokens to generate a new token.Run the Setup Script: This will create a .env file to store your key securely.python setup.py
4. Run the ApplicationOnce the setup is complete, start the Flask server.python app.py
You can now access the application by navigating to http://127.0.0.1:5000 in your web browser.🏗️ How It WorksBackend: app.py serves the frontend and provides API endpoints for all generation logic.Meme Logic: meme_generator.py handles all image manipulation using the Pillow library.AI Client: ai_client.py communicates with the Hugging Face API to turn prompts into images.Configuration: config.py loads your secret keys from the .env file created by setup.py.File Structureai-meme-generator/
├── app.py              # Main Flask application
├── setup.py            # Interactive setup script
├── config.py           # Configuration management
├── meme_generator.py   # Meme generation logic
├── ai_client.py        # Hugging Face API client
├── requirements.txt    # Python dependencies
├── .env                # Environment variables (created by setup)
├── static/             # Static assets (CSS, JS, images)
└── templates/          # HTML templates
🎯 UsageCreating MemesSelect "Create Meme" from the homepage.Choose from popular meme templates or create a custom one.Add top, bottom, or custom positioned text.Download your finished meme.Generating AI PostersSelect "AI Poster" from the homepage.Enter a detailed text prompt describing the image you want.Generate and download your unique AI artwork.🤝 ContributingContributions are welcome! Please feel free to submit a Pull Request.📝 LicenseThis project is licensed under the MIT License. See the LICENSE file for more details.📧 SupportIf you encounter any issues or have questions, please open an issue on the GitHub repository.
