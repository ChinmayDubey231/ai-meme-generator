# config.py

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    HUGGING_FACE_TOKEN = os.getenv('HUGGING_FACE_TOKEN')
    HF_MODEL = os.getenv('HF_MODEL', 'stabilityai/stable-diffusion-xl-base-1.0')
    HF_API_URL = os.getenv(
        'HF_API_URL',
        f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}",
    )

    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG', '0').lower() in ('1', 'true', 'yes')

    # Network timeouts (seconds)
    HTTP_TIMEOUT = 15
    AI_TIMEOUT = 120

    # Remote template images may only be fetched from these hosts
    ALLOWED_IMAGE_HOSTS = {'i.imgflip.com', 'imgflip.com'}

    # Upper bounds to keep requests from exhausting memory
    MAX_TEMPLATE_DIMENSION = 2000
    MAX_TEXT_LENGTH = 200
    MAX_CUSTOM_TEXTS = 10
    MAX_PROMPT_LENGTH = 500

    @classmethod
    def validate_config(cls):
        """Validate that required environment variables are set"""
        if not cls.HUGGING_FACE_TOKEN:
            raise ValueError("HUGGING_FACE_TOKEN is required. Please run setup.py")
        return True
