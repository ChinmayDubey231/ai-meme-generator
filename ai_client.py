# ai_client.py
import requests
import os
from config import Config

# We'll use a popular Stable Diffusion model from the Hugging Face Hub
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

def generate_image(prompt: str):
    """
    Generates an image using the Hugging Face Inference API with Stable Diffusion.
    """
    token = Config.HUGGING_FACE_TOKEN
    if not token:
        raise ValueError("Hugging Face token is not configured. Please run setup.py.")

    headers = {"Authorization": f"Bearer {token}"}
    payload = {"inputs": prompt}

    print(f"🤖 Sending prompt to Hugging Face: '{prompt}'...")
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload)

        # --- UPDATED: More robust error handling ---
        if response.status_code != 200:
            error_message = f"Status Code: {response.status_code}"
            
            # Safely try to decode the JSON error message
            try:
                error_details = response.json().get("error", "No details provided.")
                error_message += f" - {error_details}"
            except requests.exceptions.JSONDecodeError:
                # If the response isn't JSON, show the raw text instead
                error_message += f" - Raw response: {response.text[:200]}" # Limit to 200 chars

            print(f"❌ Error from Hugging Face API: {error_message}")

            if "is currently loading" in error_message:
                print("⏳ The model is loading, this can take up to a minute. Please try again shortly.")
            return None
        
        print("✅ Image generated successfully!")
        return response.content

    except requests.exceptions.RequestException as e:
        print(f"❌ A network error occurred: {e}")
        return None