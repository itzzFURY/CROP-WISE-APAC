from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
import os
import json
import requests
import traceback
from datetime import datetime
import re

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate("./firebase_key.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://crop-wise-2407a-default-rtdb.asia-southeast1.firebasedatabase.app'
    })
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

# Weather API configuration - WeatherAPI.com (alternative to Google Weather)
WEATHER_API_KEY = "AIzaSyBMbvwLoSNrIcrZYNbeaXsN2DJuQsFpQ3I"  # Replace with your WeatherAPI.com key
WEATHER_API_URL = "https://weather.googleapis.com/v1/forecast/days:lookup?key=AIzaSyAde_iceQ2kl0829uazBPt36e5EtkCj-o0"

# Gemini API configuration - FIXED with correct model name and API version
GEMINI_API_KEY = "AIzaSyBauwaESwuSSWuKwmMk8m5PFefCoaJHrsY"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"

@app.route('/api/farm-data', methods=['POST'])
def save_farm_data():
    try:
        # Get data from request
        data = request.json
        print(f"Received farm data: {data}")
        
        # Validate required fields
        required_fields = ['userId', 'farmName', 'farmSize', 'location', 'soilType', 'yieldPerformance', 'cropHistory']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Ensure latitude and longitude are present
        if 'latitude' not in data or 'longitude' not in data:
            return jsonify({'error': 'Missing latitude or longitude coordinates'}), 400
        
        # Save data to Firebase Realtime Database
        try:
            ref = db.reference(f'/farms/{data["userId"]}')
            new_farm_ref = ref.push()
            new_farm_ref.set(data)
            print(f"Farm data saved with ID: {new_farm_ref.key}")
        except Exception as firebase_error:
            print(f"Firebase error: {firebase_error}")
            return jsonify({'error': f'Database error: {str(firebase_error)}'}), 500
        
        return jsonify({'success': True, 'id': new_farm_ref.key}), 201
    
    except Exception as e:
        print(f"Error saving farm data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<user_id>', methods=['GET'])
def get_farm_data(user_id):
    try:
        print(f"Getting farm data for user: {user_id}")
        # Get farm data for specific user
        ref = db.reference(f'/farms/{user_id}')
        data = ref.get()
        
        if data is None:
            print("No farm data found")
            return jsonify([]), 200
        
        # Convert to list format
        farm_list = [{'id': key, **value} for key, value in data.items()]
        print(f"Found {len(farm_list)} farm records")
        
        return jsonify(farm_list), 200
    
    except Exception as e:
        print(f"Error getting farm data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<farm_id>', methods=['DELETE'])
def delete_farm_data(farm_id):
    try:
        # Get user ID from request (you might need to adjust this based on your auth setup)
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        # Delete farm from Firebase
        ref = db.reference(f'/farms/{user_id}/{farm_id}')
        ref.delete()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"Error deleting farm: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<farm_id>', methods=['PUT'])
def update_farm_data(farm_id):
    try:
        # Get data from request
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        # Update farm in Firebase
        ref = db.reference(f'/farms/{user_id}/{farm_id}')
        ref.update(data)
        
        return jsonify({'success': True, 'id': farm_id}), 200
    except Exception as e:
        print(f"Error updating farm: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/crop-suggestions', methods=['POST'])
def get_crop_suggestions():
    try:
        # Get farm data from request
        farm_data = request.json
        print(f"Received request for crop suggestions: {farm_data}")
        
        # Ensure latitude and longitude are available and convert to float
        if 'latitude' not in farm_data or 'longitude' not in farm_data:
            return jsonify({'error': 'Missing latitude or longitude coordinates'}), 400
        
        try:
            # Convert latitude and longitude to float
            latitude = float(farm_data['latitude'])
            longitude = float(farm_data['longitude'])
            farm_data['latitude'] = latitude
            farm_data['longitude'] = longitude
        except ValueError:
            return jsonify({'error': 'Invalid latitude or longitude format. Must be numeric.'}), 400
        
        # Get weather data for the farm location
        weather_data = get_weather_data(latitude, longitude)
        print(f"Weather data: {weather_data}")
        
        # Generate crop suggestions using Gemini
        try:
            print("Generating crop suggestions with Gemini...")
            suggestions, analysis = call_gemini_api(farm_data, weather_data)
            print(f"Generated {len(suggestions)} crop suggestions")
        except Exception as ai_error:
            print(f"Error generating crop suggestions with Gemini: {ai_error}")
            traceback.print_exc()
            return jsonify({
                'error': str(ai_error),
                'suggestions': [],
                'weatherData': weather_data,
                'analysis': f"Error generating crop suggestions: {str(ai_error)}"
            }), 200
            
        result = {
            'suggestions': suggestions,
            'weatherData': weather_data,
            'analysis': analysis
        }
        
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

def get_default_weather():
    """Return default weather data when API fails"""
    return {
        'temperature': 25,
        'rainfall': 0,
        'humidity': 50,
        'season': get_season(datetime.now().month, 0),
        'forecast': 'No data available'
    }

def get_weather_data(latitude, longitude):
    """Get weather data using WeatherAPI.com"""
    try:
        print(f"Getting weather data for coordinates: {latitude}, {longitude}")
        
        # If using the default API key, fall back to OpenWeather
        if WEATHER_API_KEY == "YOUR_WEATHERAPI_KEY":
            return get_openweather_data(latitude, longitude)
        
        params = {
            'key': WEATHER_API_KEY,
            'q': f"{latitude},{longitude}",
            'aqi': 'no'
        }
        
        response = requests.get(WEATHER_API_URL, params=params)
        if response.status_code != 200:
            print(f"Weather API error: {response.status_code} - {response.text}")
            return get_openweather_data(latitude, longitude)
            
        data = response.json()
        
        # Extract relevant weather information
        weather = {
            'temperature': data['current']['temp_c'],
            'rainfall': data['current']['precip_mm'],  # Precipitation in mm
            'humidity': data['current']['humidity'],
            'season': get_season(datetime.now().month, float(latitude)),
            'forecast': data['current']['condition']['text']
        }
        
        return weather
    except Exception as e:
        print(f"Error getting weather data: {e}")
        traceback.print_exc()
        # Fall back to OpenWeather if WeatherAPI fails
        return get_openweather_data(latitude, longitude)

def get_openweather_data(latitude, longitude):
    """Fallback to OpenWeather API if WeatherAPI.com fails"""
    try:
        OPENWEATHER_API_KEY = "712e944f3af7fa9850a0c1a4bc1a00b9"  # Your existing OpenWeather API key
        OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"
        
        params = {
            'lat': latitude,
            'lon': longitude,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        
        response = requests.get(OPENWEATHER_API_URL, params=params)
        if response.status_code != 200:
            print(f"OpenWeather API error: {response.status_code} - {response.text}")
            return get_default_weather()
            
        data = response.json()
        
        # Extract relevant weather information
        weather = {
            'temperature': data['main']['temp'],
            'rainfall': data.get('rain', {}).get('1h', 0),  # Rainfall in last hour
            'humidity': data['main']['humidity'],
            'season': get_season(datetime.now().month, float(latitude)),
            'forecast': data['weather'][0]['description']
        }
        
        return weather
    except Exception as e:
        print(f"Error getting OpenWeather data: {e}")
        traceback.print_exc()
        return get_default_weather()

def get_season(month, latitude):
    """Determine season based on month and latitude"""
    # Northern hemisphere
    if latitude >= 0:
        if 3 <= month <= 5:
            return "Spring"
        elif 6 <= month <= 8:
            return "Summer"
        elif 9 <= month <= 11:
            return "Fall"
        else:
            return "Winter"
    # Southern hemisphere
    else:
        if 3 <= month <= 5:
            return "Fall"
        elif 6 <= month <= 8:
            return "Winter"
        elif 9 <= month <= 11:
            return "Spring"
        else:
            return "Summer"

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

Please provide 3-5 crop suggestions with the following details for each:
1. Crop Name
2. Confidence Rate (as a percentage)
3. Reasons for Selection (list at least 3 specific reasons why this crop is suitable)
4. Planting Time
5. Harvest Time
6. Expected Yield
7. Water Requirements
8. Recommended Fertilizers (list at least 2)
9. Pest Management Strategies (list at least 2)
10. Capital Required (estimated cost per acre)
11. Time to Harvest (in days/months)
12. Additional Notes or Considerations

Format your response as structured JSON data with the following format:
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

Ensure your response is properly formatted as valid JSON that can be parsed programmatically.
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
    
    # Extract the text from the response
    if 'candidates' in response_data and len(response_data['candidates']) > 0:
        if 'content' in response_data['candidates'][0] and 'parts' in response_data['candidates'][0]['content']:
            text = response_data['candidates'][0]['content']['parts'][0]['text']
            
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
                        # If still no JSON, return empty suggestions
                        return [], "Could not parse structured data from response"
                
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

@app.route('/api/saved-suggestions', methods=['POST'])
def save_suggestions():
    try:
        # Get data from request
        data = request.json
        print(f"Saving suggestions for farm: {data['farmId']}")
        
        # Validate required fields
        required_fields = ['farmId', 'suggestions', 'weatherData', 'analysis', 'timestamp']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Save data to Firebase Realtime Database
        try:
            ref = db.reference(f'/saved-suggestions/{data["farmId"]}')
            ref.set(data)
            print(f"Suggestions saved for farm ID: {data['farmId']}")
        except Exception as firebase_error:
            print(f"Firebase error: {firebase_error}")
            return jsonify({'error': f'Database error: {str(firebase_error)}'}), 500
        
        return jsonify({'success': True}), 201
    
    except Exception as e:
        print(f"Error saving suggestions: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Add this endpoint to get saved suggestions for a farm
@app.route('/api/saved-suggestions/<farm_id>', methods=['GET'])
def get_saved_suggestions(farm_id):
    try:
        print(f"Getting saved suggestions for farm: {farm_id}")
        # Get saved suggestions for specific farm
        ref = db.reference(f'/saved-suggestions/{farm_id}')
        data = ref.get()
        
        if data is None:
            print("No saved suggestions found")
            return jsonify({'error': 'No saved suggestions found'}), 404
        
        print(f"Found saved suggestions for farm: {farm_id}")
        return jsonify(data), 200
    
    except Exception as e:
        print(f"Error getting saved suggestions: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Simple endpoint to test if the API is working"""
    return jsonify({
        'status': 'ok',
        'message': 'API is working'
    })

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True)
