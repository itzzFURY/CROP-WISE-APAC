from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import re
import traceback
import os
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
import uuid
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Firebase configuration - using environment variables
def initialize_firebase():
    """Initialize Firebase with credentials from environment or service account"""
    try:
        # For Google Cloud Run, use default credentials
        if os.getenv('GOOGLE_CLOUD_PROJECT'):
            # Running on Google Cloud - use default service account
            firebase_admin.initialize_app(options={
                'databaseURL': os.getenv('FIREBASE_DATABASE_URL', '********'),
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', '***********')
            })
        else:
            # Local development - use service account key file
            firebase_key_path = os.getenv('FIREBASE_KEY_PATH', './firebase_key.json')
            if os.path.exists(firebase_key_path):
                cred = credentials.Certificate(firebase_key_path)
                firebase_admin.initialize_app(cred, {
                    'databaseURL': os.getenv('FIREBASE_DATABASE_URL', '********'),
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', '**********')
                })
            else:
                raise Exception("Firebase key file not found for local development")
        
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        raise

# Initialize Firebase
initialize_firebase()

# API configuration using environment variables
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"

WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

# Validate required environment variables
def validate_environment():
    """Validate that all required environment variables are set"""
    required_vars = ['GEMINI_API_KEY', 'WEATHER_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise Exception(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    print("All required environment variables are set")

# Validate environment on startup
validate_environment()

# Helper Functions
def get_weather_data(latitude, longitude):
    """Get current weather data for a location"""
    try:
        params = {
            'lat': latitude,
            'lon': longitude,
            'appid': WEATHER_API_KEY,
            'units': 'metric'
        }
        
        response = requests.get(WEATHER_API_URL, params=params)
        
        if response.status_code != 200:
            print(f"Weather API error: {response.status_code}")
            return get_default_weather()
        
        data = response.json()
        
        temperature = data['main']['temp']
        humidity = data['main']['humidity']
        rainfall = 0
        if 'rain' in data and '3h' in data['rain']:
            rainfall = data['rain']['3h']
        
        month = datetime.now().month
        if 3 <= month <= 5:
            season = "Spring"
        elif 6 <= month <= 8:
            season = "Summer"
        elif 9 <= month <= 11:
            season = "Fall"
        else:
            season = "Winter"
        
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
    prompt = f"""
You are an agricultural expert AI assistant. Based on the following farm data and weather information, suggest the best crops to plant.

FARM DATA:
- Farm Size: {farm_data.get('farmSize')} acres
- Location: {farm_data.get('location')}
- Soil Type: {farm_data.get('soilType')}
- Previous Yield Performance: {farm_data.get('yieldPerformance')}
- Crop History: {farm_data.get('cropHistory')}

WEATHER DATA:
- Current Temperature: {weather_data['temperature']}°C
- Rainfall: {weather_data['rainfall']} mm
- Humidity: {weather_data['humidity']}%
- Season: {weather_data['season']}
- Weather Condition: {weather_data.get('forecast', 'Unknown')}

Please provide 3-5 crop suggestions with detailed information for each crop including confidence rate, reasons for selection, planting time, harvest time, expected yield, water requirements, fertilizers, pest management, capital required, and time to harvest.

Respond with a valid JSON object containing "suggestions" array and "analysis" string.
"""

    headers = {"Content-Type": "application/json"}
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }
    
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.status_code}")
    
    response_data = response.json()
    
    if 'candidates' in response_data and len(response_data['candidates']) > 0:
        if 'content' in response_data['candidates'][0]:
            text = response_data['candidates'][0]['content']['parts'][0]['text']
            
            try:
                # Extract JSON from response
                json_match = re.search(r'```(?:json)?\s*({\s*"suggestions"[\s\S]*?})\s*```', text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    json_match = re.search(r'({[\s\S]*"suggestions"[\s\S]*})', text)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        json_str = text.strip()
                
                # Clean up JSON
                json_str = re.sub(r',\s*}', '}', json_str)
                json_str = re.sub(r',\s*]', ']', json_str)
                
                data = json.loads(json_str)
                suggestions = data.get('suggestions', [])
                analysis = data.get('analysis', "Analysis not available")
                
                # Ensure all required fields are present
                for suggestion in suggestions:
                    if 'reasonsForSelection' not in suggestion:
                        suggestion['reasonsForSelection'] = []
                    if 'fertilizers' not in suggestion:
                        suggestion['fertilizers'] = []
                    if 'pestManagement' not in suggestion:
                        suggestion['pestManagement'] = []
                    
                    for field in ['cropName', 'plantingTime', 'harvestTime', 'expectedYield', 
                                'waterRequirements', 'capitalRequired', 'timeToHarvest', 'additionalNotes']:
                        if field not in suggestion:
                            suggestion[field] = ""
                    
                    if 'confidence' not in suggestion:
                        suggestion['confidence'] = 70
                
                return suggestions, analysis
                
            except Exception as e:
                print(f"Error parsing JSON: {e}")
                return [], f"Error parsing response: {str(e)}"
    
    return [], "Could not extract text from Gemini response"

# API Routes
@app.route('/api/farm-data', methods=['POST'])
def save_farm_data():
    try:
        farm_data = request.json
        
        required_fields = ['userId', 'farmName', 'farmSize', 'location', 'soilType', 'yieldPerformance', 'cropHistory']
        for field in required_fields:
            if field not in farm_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        if 'id' not in farm_data:
            farm_data['id'] = str(uuid.uuid4())
        
        if 'timestamp' not in farm_data:
            farm_data['timestamp'] = datetime.now().isoformat()
        
        # Save to Firebase Realtime Database
        ref = db.reference(f'/farms/{farm_data["userId"]}/{farm_data["id"]}')
        ref.set(farm_data)
        
        return jsonify({'id': farm_data['id'], 'message': 'Farm data saved successfully'}), 201
    
    except Exception as e:
        print(f"Error saving farm data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<user_id>', methods=['GET'])
def get_farm_data(user_id):
    try:
        ref = db.reference(f'/farms/{user_id}')
        farms = ref.get()
        
        if farms is None:
            return jsonify([]), 200
        
        farm_list = []
        for farm_id, farm_data in farms.items():
            farm_data['id'] = farm_id
            farm_list.append(farm_data)
        
        return jsonify(farm_list), 200
    
    except Exception as e:
        print(f"Error getting farm data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/crop-suggestions', methods=['POST'])
def get_crop_suggestions():
    try:
        farm_data = request.json
        crop_count = int(farm_data.get('cropCount', 1))
        
        latitude = farm_data.get('latitude')
        longitude = farm_data.get('longitude')
        
        if not latitude or not longitude:
            latitude = 28.6139  # Default coordinates
            longitude = 77.2090
        
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (ValueError, TypeError):
            latitude = 28.6139
            longitude = 77.2090
        
        weather_data = get_weather_data(latitude, longitude)
        suggestions, analysis = call_gemini_api(farm_data, weather_data)
        
        result = {
            'suggestions': suggestions,
            'weatherData': weather_data,
            'analysis': analysis
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error in crop suggestions: {e}")
        return jsonify({
            'error': str(e),
            'suggestions': [],
            'weatherData': get_default_weather(),
            'analysis': f"An error occurred: {str(e)}"
        }), 200

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
