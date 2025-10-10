# config.py

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # --- UPDATED: Use Hugging Face Token ---
    HUGGING_FACE_TOKEN = os.getenv('HUGGING_FACE_TOKEN')
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-secret-key')
    
    @classmethod
    def validate_config(cls):
        """Validate that required environment variables are set"""
        # --- UPDATED: Check for the new token ---
        if not cls.HUGGING_FACE_TOKEN:
            raise ValueError("HUGGING_FACE_TOKEN is required. Please run setup.py")
        return True