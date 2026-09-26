# ai_client.py
import requests
from config import Config


class AIGenerationError(Exception):
    """Raised when the image generation API fails, with a user-facing message."""


def generate_image(prompt: str):
    """
    Generates an image using the Hugging Face Inference API with Stable Diffusion.
    Returns the image bytes, or raises AIGenerationError.
    """
    token = Config.HUGGING_FACE_TOKEN
    if not token:
        raise AIGenerationError("Hugging Face token is not configured. Please run setup.py.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "image/png",
        # Block until a cold model has loaded instead of failing immediately
        "x-wait-for-model": "true",
    }
    payload = {"inputs": prompt}

    print(f"🤖 Sending prompt to Hugging Face: '{prompt}'...")

    try:
        response = requests.post(
            Config.HF_API_URL, headers=headers, json=payload, timeout=Config.AI_TIMEOUT
        )
    except requests.exceptions.Timeout:
        raise AIGenerationError("The AI service took too long to respond. Please try again.")
    except requests.exceptions.RequestException as e:
        print(f"❌ A network error occurred: {e}")
        raise AIGenerationError("Could not reach the AI service. Check your internet connection.")

    if response.status_code != 200:
        try:
            details = response.json().get("error", "No details provided.")
        except ValueError:
            details = response.text[:200]
        print(f"❌ Error from Hugging Face API: {response.status_code} - {details}")

        if response.status_code in (401, 403):
            raise AIGenerationError("Invalid Hugging Face token. Re-run setup.py with a valid token.")
        if response.status_code == 429:
            raise AIGenerationError("Rate limit reached on the AI service. Please wait and try again.")
        if response.status_code == 503 or "loading" in str(details).lower():
            raise AIGenerationError("The AI model is warming up. Please try again in a minute.")
        raise AIGenerationError(f"AI service error ({response.status_code}): {details}")

    if not response.headers.get("Content-Type", "").startswith("image/"):
        raise AIGenerationError("The AI service returned an unexpected response.")

    print("✅ Image generated successfully!")
    return response.content
