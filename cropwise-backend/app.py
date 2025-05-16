from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import requests
import re
import traceback
import os
import firebase_admin
from firebase_admin import credentials, db, storage
from datetime import datetime
import uuid
import tempfile
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Firebase configuration
cred = credentials.Certificate("./firebase_key.json")  
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://crop-wise-2407a-default-rtdb.asia-southeast1.firebasedatabase.app',
    'storageBucket': 'crop-wise-2407a.firebasestorage.app'
})

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyBauwaESwuSSWuKwmMk8m5PFefCoaJHrsY"  
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"

# Weather API configuration
WEATHER_API_KEY = "712e944f3af7fa9850a0c1a4bc1a00b9"  
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

def debug_crop_suggestions_request(farm_data, crop_count, weather_data, response_data):
    """Log detailed debug information for crop suggestions request"""
    with open('crop_debug.log', 'a') as f:
        f.write(f"\n\n=== DEBUG LOG {datetime.now().isoformat()} ===\n")
        f.write(f"FARM DATA: {json.dumps(farm_data, indent=2)}\n\n")
        f.write(f"CROP COUNT: {crop_count}\n\n")
        f.write(f"WEATHER DATA: {json.dumps(weather_data, indent=2)}\n\n")
        
        if isinstance(response_data, dict):
            f.write(f"RESPONSE DATA KEYS: {list(response_data.keys())}\n\n")
            f.write(f"SUGGESTIONS COUNT: {len(response_data.get('suggestions', []))}\n\n")
            f.write(f"ANALYSIS: {response_data.get('analysis', 'None')}\n\n")
            if 'cropCombinations' in response_data:
                f.write(f"CROP COMBINATIONS COUNT: {len(response_data.get('cropCombinations', []))}\n\n")
        else:
            f.write(f"RESPONSE DATA TYPE: {type(response_data)}\n\n")

# Helper Functions
def get_weather_data(latitude, longitude):
    """Get current weather data for a location"""
    try:
        # Call OpenWeatherMap API
        params = {
            'lat': latitude,
            'lon': longitude,
            'appid': WEATHER_API_KEY,
            'units': 'metric'  # Use metric units (Celsius)
        }
        
        response = requests.get(WEATHER_API_URL, params=params)
        
        if response.status_code != 200:
            print(f"Weather API error: {response.status_code} - {response.text}")
            return get_default_weather()
        
        data = response.json()
        
        # Extract relevant weather information
        temperature = data['main']['temp']
        humidity = data['main']['humidity']
        
        # Get rainfall if available (past 3 hours)
        rainfall = 0
        if 'rain' in data and '3h' in data['rain']:
            rainfall = data['rain']['3h']
        
        # Determine season based on month
        month = datetime.now().month
        if 3 <= month <= 5:
            season = "Spring"
        elif 6 <= month <= 8:
            season = "Summer"
        elif 9 <= month <= 11:
            season = "Fall"
        else:
            season = "Winter"
        
        # Get weather condition
        weather_condition = data['weather'][0]['description'] if 'weather' in data and len(data['weather']) > 0 else "Unknown"
        
        return {
            'temperature': temperature,
            'rainfall': rainfall,
            'humidity': humidity,
            'season': season,
            'forecast': weather_condition
        }
    
    except Exception as e:
        print(f"Error getting weather data: {e}")
        return get_default_weather()

def get_default_weather():
    """Return default weather data if API call fails"""
    return {
        'temperature': 25,
        'rainfall': 10,
        'humidity': 60,
        'season': "Unknown",
        'forecast': "Unknown"
    }


def call_gemini_api(farm_data, weather_data):
    """Call the Gemini API to generate crop suggestions"""
    # Create a detailed prompt for the AI
    prompt = f"""
You are an agricultural expert AI assistant. Based on the following farm data and weather information, suggest the best crops to plant.

FARM DATA:
- Farm Size: {farm_data.get('farmSize')} acres
- Location: {farm_data.get('location', f"Lat: {farm_data.get('latitude')}, Long: {farm_data.get('longitude')}")}
- Soil Type: {farm_data.get('soilType')}
- Previous Yield Performance: {farm_data.get('yieldPerformance')}
- Crop History: {farm_data.get('cropHistory')}

WEATHER DATA:
- Current Temperature: {weather_data['temperature']}°C
- Rainfall: {weather_data['rainfall']} mm
- Humidity: {weather_data['humidity']}%
- Season: {weather_data['season']}
- Weather Condition: {weather_data.get('forecast', 'Unknown')}

YOUR TASK:
Please provide 3-5 crop suggestions with the following details for each:
1. Crop Name
2. Confidence Rate (as a percentage)
3. Reasons for Selection (list at least 3 specific reasons)
4. Planting Time
5. Harvest Time
6. Expected Yield
7. Water Requirements
8. Recommended Fertilizers (list at least 2)
9. Pest Management Strategies (list at least 2)
10. Capital Required (estimated cost per acre)
11. Time to Harvest (in days/months)
12. Additional Notes or Considerations

Also provide a brief overall analysis of the farm conditions and potential.

RESPONSE FORMAT:
You must respond with a valid JSON object containing the following fields:
{{
  "suggestions": [
    {{
      "cropName": "Crop Name",
      "confidence": 85,
      "reasonsForSelection": ["Reason 1", "Reason 2", "Reason 3"],
      "plantingTime": "Best planting time",
      "harvestTime": "Expected harvest time",
      "expectedYield": "Expected yield per acre",
      "waterRequirements": "Water needs",
      "fertilizers": ["Fertilizer 1", "Fertilizer 2"],
      "pestManagement": ["Strategy 1", "Strategy 2"],
      "capitalRequired": "Estimated cost per acre",
      "timeToHarvest": "Time from planting to harvest",
      "additionalNotes": "Any additional information"
    }}
  ],
  "analysis": "Brief overall analysis of the farm conditions"
}}

Your response must be a properly formatted JSON object that can be parsed programmatically.
DO NOT include any text before or after the JSON.
Ensure your JSON has no trailing commas.
"""

    
    print("Sending prompt to Gemini API:", prompt[:500] + "...")

    # Call Gemini API
    headers = {
        "Content-Type": "application/json",
    }
    
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }
    
    # Add API key as a query parameter
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"Gemini API error: {response.status_code} - {response.text}")
        raise Exception(f"Gemini API returned status code {response.status_code}: {response.text}")
    
    response_data = response.json()
    
    # Extract the text from the response - updated for the new API structure
    if 'candidates' in response_data and len(response_data['candidates']) > 0:
        if 'content' in response_data['candidates'][0] and 'parts' in response_data['candidates'][0]['content']:
            text = response_data['candidates'][0]['content']['parts'][0]['text']
            
            # Save the raw response for debugging
            with open('gemini_response_single.txt', 'w') as f:
                f.write(text)
            
            # Try to parse JSON from the response
            try:
                # Look for JSON in the text
                json_match = re.search(r'```(?:json)?\s*({\s*"suggestions"[\s\S]*?})\s*```', text, re.DOTALL)
                
                if json_match:
                    json_str = json_match.group(1)
                else:
                    # If no JSON code block, try to find JSON object directly
                    json_match = re.search(r'({[\s\S]*"suggestions"[\s\S]*})', text)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        # Try to parse the entire text as JSON
                        json_str = text.strip()
                
                # Clean up the JSON string
                json_str = json_str.replace('\n', ' ').replace('\r', '')
                json_str = re.sub(r',\s*}', '}', json_str)  # Remove trailing commas
                json_str = re.sub(r',\s*]', ']', json_str)  # Remove trailing commas in arrays
                
                data = json.loads(json_str)
                
                # Extract suggestions and analysis
                suggestions = data.get('suggestions', [])
                analysis = data.get('analysis', "Analysis not available")
                
                # Ensure all required fields are present in each suggestion
                for suggestion in suggestions:
                    # Add empty arrays for missing list fields
                    if 'reasonsForSelection' not in suggestion:
                        suggestion['reasonsForSelection'] = []
                    if 'fertilizers' not in suggestion:
                        suggestion['fertilizers'] = []
                    if 'pestManagement' not in suggestion:
                        suggestion['pestManagement'] = []
                    
                    # Add empty strings for missing text fields
                    for field in ['cropName', 'plantingTime', 'harvestTime', 'expectedYield', 
                                'waterRequirements', 'capitalRequired', 'timeToHarvest', 'additionalNotes']:
                        if field not in suggestion:
                            suggestion[field] = ""
                    
                    # Ensure confidence is a number
                    if 'confidence' not in suggestion:
                        suggestion['confidence'] = 70
                    elif not isinstance(suggestion['confidence'], (int, float)):
                        try:
                            suggestion['confidence'] = int(suggestion['confidence'].replace('%', ''))
                        except:
                            suggestion['confidence'] = 70
                
                return suggestions, analysis
                
            except Exception as e:
                print(f"Error parsing JSON from Gemini response: {e}")
                print(f"Response text: {text}")
                return [], f"Error parsing response: {str(e)}"
    
    return [], "Could not extract text from Gemini response"

def call_gemini_api_with_combinations(farm_data, weather_data, crop_count):
    """Call the Gemini API to generate crop suggestions with combinations"""
    # Create a detailed prompt for the AI
    prompt = f"""
You are an agricultural expert AI assistant. Based on the following farm data and weather information, suggest the best crops to plant. The farmer wants to grow {crop_count} different crops on their farm.

FARM DATA:
- Farm Size: {farm_data.get('farmSize')} acres
- Location: {farm_data.get('location', f"Lat: {farm_data.get('latitude')}, Long: {farm_data.get('longitude')}")}
- Soil Type: {farm_data.get('soilType')}
- Previous Yield Performance: {farm_data.get('yieldPerformance')}
- Crop History: {farm_data.get('cropHistory')}

WEATHER DATA:
- Current Temperature: {weather_data['temperature']}°C
- Rainfall: {weather_data['rainfall']} mm
- Humidity: {weather_data['humidity']}%
- Season: {weather_data['season']}
- Weather Condition: {weather_data.get('forecast', 'Unknown')}

YOUR TASK:
1. First, provide exactly {crop_count} individual crop suggestions with the following details for each:
   a. Crop Name
   b. Confidence Rate (as a percentage)
   c. Reasons for Selection (list at least 3 specific reasons why this crop is suitable)
   d. Planting Time
   e. Harvest Time
   f. Expected Yield
   g. Water Requirements
   h. Recommended Fertilizers (list at least 2)
   i. Pest Management Strategies (list at least 2)
   j. Capital Required (estimated cost per acre)
   k. Time to Harvest (in days/months)
   l. Additional Notes or Considerations

2. Then, suggest at least 2 optimal combinations of these {crop_count} crops, including:
   a. Which crops work well together
   b. What percentage of the farm area should be allocated to each crop
   c. Why these crops are compatible
   d. Planting sequence recommendations
   e. Crop rotation benefits
   f. Any additional notes for optimal results

RESPONSE FORMAT:
You must respond with a valid JSON object containing the following fields:
{{
  "suggestions": [
    {{
      "cropName": "Crop Name",
      "confidence": 85,
      "reasonsForSelection": ["Reason 1", "Reason 2", "Reason 3"],
      "plantingTime": "Best planting time",
      "harvestTime": "Expected harvest time",
      "expectedYield": "Expected yield per acre",
      "waterRequirements": "Water needs",
      "fertilizers": ["Fertilizer 1", "Fertilizer 2"],
      "pestManagement": ["Strategy 1", "Strategy 2"],
      "capitalRequired": "Estimated cost per acre",
      "timeToHarvest": "Time from planting to harvest",
      "additionalNotes": "Any additional information"
    }}
  ],
  "analysis": "Brief overall analysis of the farm conditions",
  "cropCombinations": [
    {{
      "crops": [
        {{"cropName": "Crop 1", "percentage": 60}},
        {{"cropName": "Crop 2", "percentage": 40}}
      ],
      "compatibilityScore": 85,
      "compatibilityReasons": ["Reason 1", "Reason 2", "Reason 3"],
      "plantingSequence": "Recommended planting sequence",
      "rotationBenefits": "Benefits of rotating these crops",
      "additionalNotes": "Any additional information"
    }}
  ]
}}

Your response must be a properly formatted JSON object that can be parsed programmatically.
DO NOT include any text before or after the JSON.
Ensure your JSON has no trailing commas.
"""

    
    print("Sending prompt to Gemini API:", prompt[:500] + "...")

    # Call Gemini API
    headers = {
        "Content-Type": "application/json",
    }
    
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 4096,  # Increased token limit for combinations
        }
    }
    
    # Add API key as a query parameter
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"Gemini API error: {response.status_code} - {response.text}")
        raise Exception(f"Gemini API returned status code {response.status_code}: {response.text}")
    
    response_data = response.json()
    
    # Extract the text from the response - updated for the new API structure
    if 'candidates' in response_data and len(response_data['candidates']) > 0:
        if 'content' in response_data['candidates'][0] and 'parts' in response_data['candidates'][0]['content']:
            text = response_data['candidates'][0]['content']['parts'][0]['text']
            
            # Save the raw response for debugging
            with open('gemini_response_combinations.txt', 'w') as f:
                f.write(text)
            
            # Try to parse JSON from the response
            try:
                # Look for JSON in the text - try different patterns
                json_match = re.search(r'```(?:json)?\s*({\s*"suggestions"[\s\S]*?})\s*```', text, re.DOTALL)
                
                if json_match:
                    json_str = json_match.group(1)
                else:
                    # If no JSON code block, try to find JSON object directly
                    json_match = re.search(r'({[\s\S]*"suggestions"[\s\S]*})', text)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        # Try to parse the entire text as JSON
                        json_str = text.strip()
                
                # Clean up the JSON string
                json_str = json_str.replace('\n', ' ').replace('\r', '')
                json_str = re.sub(r',\s*}', '}', json_str)  # Remove trailing commas
                json_str = re.sub(r',\s*]', ']', json_str)  # Remove trailing commas in arrays
                
                data = json.loads(json_str)
                
                # Extract suggestions, analysis, and crop combinations
                suggestions = data.get('suggestions', [])
                analysis = data.get('analysis', "Analysis not available")
                crop_combinations = data.get('cropCombinations', [])
                
                # Ensure all required fields are present in each suggestion
                for suggestion in suggestions:
                    # Add empty arrays for missing list fields
                    if 'reasonsForSelection' not in suggestion:
                        suggestion['reasonsForSelection'] = []
                    if 'fertilizers' not in suggestion:
                        suggestion['fertilizers'] = []
                    if 'pestManagement' not in suggestion:
                        suggestion['pestManagement'] = []
                    
                    # Add empty strings for missing text fields
                    for field in ['cropName', 'plantingTime', 'harvestTime', 'expectedYield', 
                                'waterRequirements', 'capitalRequired', 'timeToHarvest', 'additionalNotes']:
                        if field not in suggestion:
                            suggestion[field] = ""
                    
                    # Ensure confidence is a number
                    if 'confidence' not in suggestion:
                        suggestion['confidence'] = 70
                    elif not isinstance(suggestion['confidence'], (int, float)):
                        try:
                            suggestion['confidence'] = int(suggestion['confidence'].replace('%', ''))
                        except:
                            suggestion['confidence'] = 70
                
                # Ensure all required fields are present in each crop combination
                for combination in crop_combinations:
                    # Add empty arrays for missing list fields
                    if 'compatibilityReasons' not in combination:
                        combination['compatibilityReasons'] = []
                    if 'crops' not in combination:
                        combination['crops'] = []
                    
                    # Add empty strings for missing text fields
                    for field in ['plantingSequence', 'rotationBenefits', 'additionalNotes']:
                        if field not in combination:
                            combination[field] = ""
                    
                    # Ensure compatibility score is a number
                    if 'compatibilityScore' not in combination:
                        combination['compatibilityScore'] = 70
                    elif not isinstance(combination['compatibilityScore'], (int, float)):
                        try:
                            combination['compatibilityScore'] = int(combination['compatibilityScore'].replace('%', ''))
                        except:
                            combination['compatibilityScore'] = 70
                    
                    # Ensure crop percentages add up to 100%
                    total_percentage = sum(crop.get('percentage', 0) for crop in combination['crops'])
                    if total_percentage != 100 and total_percentage > 0:
                        # Adjust percentages proportionally
                        for crop in combination['crops']:
                            if 'percentage' in crop:
                                crop['percentage'] = round((crop['percentage'] / total_percentage) * 100)
                
                return suggestions, analysis, crop_combinations
                
            except Exception as e:
                print(f"Error parsing JSON from Gemini response: {e}")
                print(f"Response text: {text}")
                return [], f"Error parsing response: {str(e)}", []
    
    return [], "Could not extract text from Gemini response", []

def generate_chatbot_response(message, context):
    """Generate a response from the chatbot using Gemini"""
    # Create a prompt for the chatbot
    prompt = f"""
You are CropWise Assistant, an agricultural expert AI chatbot. You help farmers understand crop suggestions and provide farming advice.

CONTEXT INFORMATION:
{context}

USER QUESTION:
{message}

Please provide a helpful, informative response to the user's question based on the context information provided. 
If you don't know the answer or if the question is outside the scope of the provided context, politely say so and suggest what information might help you answer better.

Your response should be conversational, friendly, and easy to understand for farmers. Use bullet points or numbered lists when appropriate to make information clear.
"""

    # Call Gemini API
    headers = {
        "Content-Type": "application/json",
    }
    
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1024,
        }
    }
    
    # Add API key as a query parameter
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"Gemini API error: {response.status_code} - {response.text}")
        return "I'm sorry, I encountered an error while processing your question. Please try again."
    
    response_data = response.json()
    
    # Extract the text from the response - updated for the new API structure
    if 'candidates' in response_data and len(response_data['candidates']) > 0:
        if 'content' in response_data['candidates'][0] and 'parts' in response_data['candidates'][0]['content']:
            text = response_data['candidates'][0]['content']['parts'][0]['text']
            return text
    
    return "I'm sorry, I couldn't generate a response. Please try asking in a different way."

# API Routes
@app.route('/api/farm-data', methods=['POST'])
def save_farm_data():
    try:
        # Get data from request
        farm_data = request.json
        print(f"Received farm data: {farm_data}")
        
        # Validate required fields
        required_fields = ['userId', 'farmName', 'farmSize', 'location', 'soilType', 'yieldPerformance', 'cropHistory']
        for field in required_fields:
            if field not in farm_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Generate a unique ID for the farm if not provided
        if 'id' not in farm_data:
            farm_data['id'] = str(uuid.uuid4())
        
        # Add timestamp if not provided
        if 'timestamp' not in farm_data:
            farm_data['timestamp'] = datetime.now().isoformat()
        
        # Save data to Firebase Realtime Database
        try:
            ref = db.reference(f'/farms/{farm_data["userId"]}/{farm_data["id"]}')
            ref.set(farm_data)
            print(f"Farm data saved with ID: {farm_data['id']}")
        except Exception as firebase_error:
            print(f"Firebase error: {firebase_error}")
            return jsonify({'error': f'Database error: {str(firebase_error)}'}), 500
        
        return jsonify({'id': farm_data['id'], 'message': 'Farm data saved successfully'}), 201
    
    except Exception as e:
        print(f"Error saving farm data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<user_id>', methods=['GET'])
def get_farm_data(user_id):
    try:
        print(f"Getting farm data for user: {user_id}")
        # Get all farms for specific user
        ref = db.reference(f'/farms/{user_id}')
        farms = ref.get()
        
        if farms is None:
            print("No farms found")
            return jsonify([]), 200
        
        # Convert to list format
        farm_list = []
        for farm_id, farm_data in farms.items():
            # Ensure farm_data has an id field
            farm_data['id'] = farm_id
            farm_list.append(farm_data)
        
        print(f"Found {len(farm_list)} farms")
        
        return jsonify(farm_list), 200
    
    except Exception as e:
        print(f"Error getting farm data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<farm_id>', methods=['PUT'])
def update_farm_data(farm_id):
    try:
        # Get data from request
        farm_data = request.json
        print(f"Updating farm data for ID: {farm_id}")
        
        # Validate required fields
        required_fields = ['userId', 'farmName', 'farmSize', 'location', 'soilType', 'yieldPerformance', 'cropHistory']
        for field in required_fields:
            if field not in farm_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Update timestamp
        farm_data['timestamp'] = datetime.now().isoformat()
        
        # Save data to Firebase Realtime Database
        try:
            ref = db.reference(f'/farms/{farm_data["userId"]}/{farm_id}')
            ref.update(farm_data)
            print(f"Farm data updated for ID: {farm_id}")
        except Exception as firebase_error:
            print(f"Firebase error: {firebase_error}")
            return jsonify({'error': f'Database error: {str(firebase_error)}'}), 500
        
        return jsonify({'id': farm_id, 'message': 'Farm data updated successfully'}), 200
    
    except Exception as e:
        print(f"Error updating farm data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<farm_id>', methods=['DELETE'])
def delete_farm_data(farm_id):
    try:
        # Get user ID from query parameter
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'Missing userId parameter'}), 400
        
        print(f"Deleting farm data for ID: {farm_id}, User ID: {user_id}")
        
        # Delete data from Firebase Realtime Database
        try:
            ref = db.reference(f'/farms/{user_id}/{farm_id}')
            ref.delete()
            print(f"Farm data deleted for ID: {farm_id}")
            
            # Also delete any saved suggestions for this farm
            suggestions_ref = db.reference(f'/saved-suggestions/{farm_id}')
            suggestions_ref.delete()
            print(f"Saved suggestions deleted for farm ID: {farm_id}")
            
        except Exception as firebase_error:
            print(f"Firebase error: {firebase_error}")
            return jsonify({'error': f'Database error: {str(firebase_error)}'}), 500
        
        return jsonify({'id': farm_id, 'message': 'Farm data deleted successfully'}), 200
    
    except Exception as e:
        print(f"Error deleting farm data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/crop-suggestions', methods=['POST'])
def get_crop_suggestions():
    try:
        # Get farm data from request
        farm_data = request.json
        print(f"Received request for crop suggestions: {farm_data}")
        
        # Get crop count (default to 1 if not provided)
        crop_count = int(farm_data.get('cropCount', 1))
        print(f"Requested crop count: {crop_count}")
        
        # Ensure latitude and longitude are available
        latitude = farm_data.get('latitude')
        longitude = farm_data.get('longitude')
        
        if not latitude or not longitude:
            print("Missing latitude/longitude, checking location string for coordinates")
            # Try to extract coordinates from location string if available
            location = farm_data.get('location', '')
            if location:
                # Simple regex to try to extract coordinates from location string
                coord_match = re.search(r'(-?\d+\.?\d*),\s*(-?\d+\.?\d*)', location)
                if coord_match:
                    latitude = float(coord_match.group(1))
                    longitude = float(coord_match.group(2))
                    farm_data['latitude'] = latitude
                    farm_data['longitude'] = longitude
                    print(f"Extracted coordinates from location: {latitude}, {longitude}")
        
        # If we still don't have coordinates, use default values
        if not latitude or not longitude:
            print("Using default coordinates")
            latitude = 28.6139  # Default to Delhi, India coordinates
            longitude = 77.2090
            farm_data['latitude'] = latitude
            farm_data['longitude'] = longitude
        
        # Convert to float if they're strings
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (ValueError, TypeError):
            print(f"Invalid coordinates, using defaults. Latitude: {latitude}, Longitude: {longitude}")
            latitude = 28.6139
            longitude = 77.2090
        
        # Get weather data for the farm location
        weather_data = get_weather_data(latitude, longitude)
        print(f"Weather data: {weather_data}")
        
        # Generate crop suggestions using Gemini
        try:
            print(f"Generating crop suggestions with Gemini for {crop_count} crops...")
            if crop_count > 1:
                suggestions, analysis, crop_combinations = call_gemini_api_with_combinations(farm_data, weather_data, crop_count)
                print(f"Generated {len(suggestions)} crop suggestions and {len(crop_combinations)} combinations")
                
                result = {
                    'suggestions': suggestions,
                    'weatherData': weather_data,
                    'analysis': analysis,
                    'cropCombinations': crop_combinations
                }
            else:
                suggestions, analysis = call_gemini_api(farm_data, weather_data)
                print(f"Generated {len(suggestions)} crop suggestions")
                
                result = {
                    'suggestions': suggestions,
                    'weatherData': weather_data,
                    'analysis': analysis
                }
            
            # Log detailed debug information
            debug_crop_suggestions_request(farm_data, crop_count, weather_data, result)
                
        except Exception as ai_error:
            print(f"Error generating crop suggestions with Gemini: {ai_error}")
            traceback.print_exc()
            return jsonify({
                'error': str(ai_error),
                'suggestions': [],
                'weatherData': weather_data,
                'analysis': f"Error generating crop suggestions: {str(ai_error)}"
            }), 200
            
        if not suggestions or len(suggestions) == 0:
            print("WARNING: No suggestions were generated!")
            
        print("Successfully generated crop suggestions")
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error in crop suggestions: {e}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'suggestions': [],
            'weatherData': get_default_weather(),
            'analysis': f"An error occurred: {str(e)}"
        }), 200

@app.route('/api/saved-suggestions/<farm_id>', methods=['GET'])
def get_saved_suggestions(farm_id):
    try:
        print(f"Getting saved suggestions for farm: {farm_id}")
        # Get saved suggestions for specific farm
        ref = db.reference(f'/saved-suggestions/{farm_id}')
        suggestions = ref.get()
        
        if suggestions is None:
            print("No saved suggestions found")
            return jsonify(None), 200
        
        print(f"Found saved suggestions for farm: {farm_id}")
        
        return jsonify(suggestions), 200
    
    except Exception as e:
        print(f"Error getting saved suggestions: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/saved-suggestions', methods=['POST'])
def save_suggestions():
    try:
        # Get data from request
        data = request.json
        print(f"Saving suggestions for farm: {data.get('farmId')}")
        
        # Validate required fields
        if 'farmId' not in data:
            return jsonify({'error': 'Missing farmId field'}), 400
        
        # Save data to Firebase Realtime Database
        try:
            ref = db.reference(f'/saved-suggestions/{data["farmId"]}')
            ref.set(data)
            print(f"Suggestions saved for farm: {data['farmId']}")
        except Exception as firebase_error:
            print(f"Firebase error: {firebase_error}")
            return jsonify({'error': f'Database error: {str(firebase_error)}'}), 500
        
        return jsonify({'farmId': data['farmId'], 'message': 'Suggestions saved successfully'}), 201
    
    except Exception as e:
        print(f"Error saving suggestions: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        # Get data from request
        data = request.json
        print("Received chatbot request")
        
        # Validate required fields
        if 'message' not in data:
            return jsonify({'error': 'Missing message field'}), 400
        
        message = data['message']
        context = data.get('context', '')
        
        # Generate response using Gemini
        response = generate_chatbot_response(message, context)
        
        return jsonify({'response': response}), 200
    
    except Exception as e:
        print(f"Error in chatbot: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'response': "I'm sorry, I encountered an error. Please try again."}), 200

@app.route('/api/chat-history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    try:
        print(f"Getting chat history for user: {user_id}")
        # Get chat history for specific user
        ref = db.reference(f'/chat-history/{user_id}')
        data = ref.get()
        
        if data is None:
            print("No chat history found")
            return jsonify([]), 200
        
        # Convert to list format
        chat_history = data.get('chatHistory', [])
        print(f"Found {len(chat_history)} chat messages")
        
        return jsonify(chat_history), 200
    
    except Exception as e:
        print(f"Error getting chat history: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat-history/<user_id>', methods=['POST'])
def save_chat_history(user_id):
    try:
        # Get data from request
        data = request.json
        print(f"Saving chat history for user: {user_id}")
        
        # Validate required fields
        if 'chatHistory' not in data:
            return jsonify({'error': 'Missing chatHistory field'}), 400
        
        # Save data to Firebase Realtime Database
        try:
            ref = db.reference(f'/chat-history/{user_id}')
            ref.set(data)
            print(f"Chat history saved for user: {user_id}")
        except Exception as firebase_error:
            print(f"Firebase error: {firebase_error}")
            return jsonify({'error': f'Database error: {str(firebase_error)}'}), 500
        
        return jsonify({'success': True}), 201
    
    except Exception as e:
        print(f"Error saving chat history: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)