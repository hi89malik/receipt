import os
import json
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No GEMINI_API_KEY found in .env file")

genai.configure(api_key=api_key)

def clean_json_text(text):
    """
    Helper to strip markdown code blocks if the LLM includes them.
    Ex: removes ```json and ``` 
    """
    cleaned = text.replace("```json", "").replace("```", "").strip()
    return cleaned

async def analyze_receipt(image_bytes):
    try:
        # Use Gemini 1.5 Flash (Optimized for speed/cost)
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        # Convert raw bytes to a PIL Image
        image = Image.open(io.BytesIO(image_bytes))

        prompt = """
        Analyze this image of a grocery receipt. 
        Extract the food items. Ignore taxes, subtotals, and non-food items (like 'coupons' or 'fuel').
        
        For each item, estimate a 'shelf_life_days' (integer) based on general food safety.
        
        Return the result as a STRICT JSON list. 
        Do not add any conversational text before or after the JSON.
        
        Example format:
        [
            {"item": "Bananas", "shelf_life_days": 5, "category": "Produce", "quantity": 1},
            {"item": "Milk", "shelf_life_days": 7, "category": "Dairy", "quantity": 1}
        ]
        """

        # Generate the content
        response = model.generate_content([prompt, image])
        
        # Clean and Parse
        json_text = clean_json_text(response.text)
        data = json.loads(json_text)
        
        return data

    except Exception as e:
        print(f"Error processing receipt: {e}")
        return {"error": "Failed to process receipt", "details": str(e)}