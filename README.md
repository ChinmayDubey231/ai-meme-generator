AI Poster & Meme Generator
A versatile web application built with Python and Flask that allows users to create both classic memes and unique, AI-generated posters. It features a simple and interactive web interface for all your creative needs.

https://img.shields.io/badge/Python-3.6+-blue.svg
https://img.shields.io/badge/Flask-2.0+-green.svg
https://img.shields.io/badge/License-MIT-yellow.svg

✨ Features
🤖 AI Poster Generation: Leverages the power of the Stable Diffusion XL model through the Hugging Face API to transform any text prompt into a high-quality image.

😂 Classic Meme Creation: Choose from a list of the most popular meme templates fetched live from the Imgflip API.

✍️ Full Text Customization: Easily add and position top text, bottom text, and even multiple custom text boxes anywhere on your image.

🖼️ Custom Template Builder: Don't see a template you like? Create your own from scratch by setting a canvas size, background color, and adding placeholder text.

🚀 Simple & Lightweight: Built with a minimal footprint using Flask and the Pillow library for image manipulation, making it fast and easy to run.

🔐 Secure Setup: Includes an interactive setup script to securely store your API keys in a .env file, keeping your secrets out of the code.

🚀 Installation & Setup
Follow these simple steps to get the application running locally.

Prerequisites
Python 3.6+

pip (Python package installer)

1. Clone the Repository
   First, clone this repository to your local machine.

bash
git clone <your-repo-url>
cd <project-directory-name> 2. Install Dependencies
It is highly recommended to use a Python virtual environment to keep dependencies isolated.

bash

# Create and activate a virtual environment

python -m venv venv

# On Windows

venv\Scripts\activate

# On macOS/Linux

source venv/bin/activate

# Install the required packages

pip install -r requirements.txt 3. Set Up Your API Key
This project requires a Hugging Face API token for the AI poster generation feature.

Get a Token: Create a free account at huggingface.co and navigate to your Settings → Access Tokens to generate a new token.

Run the Setup Script: Execute the setup.py script and follow the prompts. It will ask for your Hugging Face token and create a .env file to store it securely.

bash
python setup.py 4. Run the Application
Once the setup is complete, you can start the Flask server.

bash
python app.py
You can now access the application by navigating to http://127.0.0.1:5000 in your web browser.

🏗️ How It Works
Backend Architecture
Backend: The Flask application (app.py) serves the frontend and provides API endpoints for generating content.

Meme Logic: The meme_generator.py class handles all image manipulation using the Pillow library, from adding text to fetching templates.

AI Client: ai_client.py is responsible for communicating with the Hugging Face API, sending prompts, and receiving the generated image data.

Configuration: The config.py file loads your secret keys from the .env file, which is created by setup.py.

File Structure
text
ai-poster-meme-generator/
├── app.py # Main Flask application
├── setup.py # Interactive setup script
├── config.py # Configuration management
├── meme_generator.py # Meme generation logic
├── ai_client.py # Hugging Face API client
├── requirements.txt # Python dependencies
├── .env # Environment variables (created by setup)
├── static/ # Static assets (CSS, JS, images)
└── templates/ # HTML templates
🎯 Usage
Creating Memes
Select "Create Meme" from the homepage

Choose from popular meme templates or create a custom one

Add top text, bottom text, or custom positioned text

Download your finished meme

Generating AI Posters
Select "AI Poster" from the homepage

Enter a detailed text prompt describing the image you want

Adjust generation parameters if needed

Generate and download your unique AI artwork

🔧 Configuration
The application uses environment variables for configuration. The .env file contains:

HUGGINGFACE_API_KEY: Your Hugging Face API token for AI image generation

📝 License
This project is licensed under the MIT License. See the LICENSE file for more details.

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📧 Support
If you encounter any issues or have questions, please open an issue on the GitHub repository.
