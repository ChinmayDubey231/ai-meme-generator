import meme_generator
import os

def test_meme_creation():
    """Test basic meme generation"""
    generator = meme_generator.MemeGenerator()
    
    # Test with sample data
    result = generator.create_meme("default.png", "TOP TEXT", "BOTTOM TEXT")
    
    assert result is not None, "Meme generation failed"
    assert len(result) > 0, "Generated image is empty"
    print("✓ Meme creation test passed")

def test_huggingface_client():
    
    import ai_client
    
    # This will only work if API key is configured
    try:
        result = ai_client.generate_image("test poster")
        if result:
            print("✓ HuggingFace client test passed")
        else:
            print("⚠ HuggingFace client test failed (no result)")
    except Exception as e:
        print(f"⚠ HuggingFace client test failed: {e}")

if __name__ == "__main__":
    test_meme_creation()
    test_huggingface_client()
    print("All tests completed!")