import os
import json
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No GEMINI_API_KEY found in .env file")

genai.configure(api_key=api_key)

def clean_json_text(text):
    """
    Clean the response text to ensure we get valid JSON.
    Removes markdown formatting like ```json ... ```
    """
    cleaned = text.replace("```json", "").replace("```", "").strip()
    return cleaned

async def analyze_receipt(image_bytes):
    try:
        # UPDATED: Using Gemini 3 Flash Preview (Released Dec 2025)
        # This model has "Thinking" capabilities for better reasoning.
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        image = Image.open(io.BytesIO(image_bytes))

        # --- REFINED PROMPT FOR PRECISION ---
        prompt = """
        You are an expert Food Safety & Inventory Specialist. 
        Analyze this grocery receipt image and extract food items.

        RULES:
        1. Identify the specific product (e.g., convert "FV ICE COFF" to "French Vanilla Iced Coffee").
        2. Determine the STORAGE LOCATION: 'Pantry', 'Fridge', or 'Freezer'.
        3. Estimate 'shelf_life_days' based on UNOPENED safety guidelines.
           - CRITICAL: If an item is commonly refrigerated (like Milk, Juice, Iced Coffee jugs), assume it is PERISHABLE.
           - Be conservative. If unsure, choose the safer (shorter) date.
           - Context Clues: 
             * 'FV ICE COFF' ($10+) is likely a refrigerated jug -> 14 days (Fridge).
             * 'COKE' is shelf stable -> 180 days (Pantry).
             * 'CHOC' is shelf stable -> 365 days (Pantry).
        4. Categorize broadly (Produce, Dairy, Snacks, Beverages, Meat, Bakery).
        5. Ignore taxes, fees (like 'NY DEP FEE'), and non-food items.

        Return strictly a JSON list. No markdown, no conversational text.
        
        Example Output Format:
        [
            {
                "item": "French Vanilla Iced Coffee",
                "category": "Dairy/Beverage",
                "storage": "Fridge",
                "shelf_life_days": 14,
                "reasoning": "Refrigerated coffee creamer/drink, expires quickly."
            },
            {
                "item": "Potato Chips",
                "category": "Snacks",
                "storage": "Pantry",
                "shelf_life_days": 90,
                "reasoning": "Fried shelf-stable snack."
            }
        ]
        """

        response = model.generate_content([prompt, image])
        
        json_text = clean_json_text(response.text)
        data = json.loads(json_text)
        
        return data

    except Exception as e:
        print(f"Error processing receipt: {e}")
        # Return a safe error object so the frontend doesn't crash
        return [{"item": "Error parsing receipt", "category": "Error", "shelf_life_days": 0, "storage": "None"}]
