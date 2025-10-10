# setup.py
import os
import secrets

def setup_environment():
    """Helper script to set up environment variables for Hugging Face."""
    print("🔧 AI Meme Generator Setup (Hugging Face)")
    print("-" * 30)
    
    env_file = '.env'
    if os.path.exists(env_file):
        overwrite = input(f"⚠️ '{env_file}' already exists. Overwrite? (y/n): ").lower()
        if overwrite != 'y':
            print("Setup cancelled.")
            return

    hf_token = input("Enter your Hugging Face API Token: ").strip()
    
    if not hf_token:
        print("❌ No API token provided. Setup cancelled.")
        return
        
    secret_key = input("Enter a Flask secret key (or press Enter to generate): ").strip()
    if not secret_key:
        secret_key = secrets.token_hex(16)
        print(f"Generated secret key: {secret_key}")

    with open(env_file, 'w') as f:
        f.write(f"HUGGING_FACE_TOKEN={hf_token}\n")
        f.write(f"SECRET_KEY={secret_key}\n")
    
    print(f"\n✅ '.env' file created successfully!")

if __name__ == '__main__':
    setup_environment()