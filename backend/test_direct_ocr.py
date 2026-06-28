import asyncio
from app.services.ocr import _analyze_with_gemini_vision
import os

async def main():
    try:
        print("Starting test...")
        # create a dummy image to test with
        dummy_img = "test_img.png"
        from PIL import Image
        img = Image.new('RGB', (60, 30), color = 'red')
        img.save(f"uploads/{dummy_img}")
        
        result = await _analyze_with_gemini_vision(dummy_img)
        print("Result:", result)
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
