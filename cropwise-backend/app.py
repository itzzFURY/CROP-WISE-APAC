from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
import os
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin SDK
# Replace with your Firebase service account key path
cred = credentials.Certificate("./firebase_key.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://crop-wise-2407a-default-rtdb.asia-southeast1.firebasedatabase.app/'
})

@app.route('/api/farm-data', methods=['POST'])
def save_farm_data():
    try:
        # Get data from request
        data = request.json
        
        # Validate required fields
        required_fields = ['userId', 'farmName', 'farmSize', 'location', 
                          'soilType', 'yieldPerformance', 'cropHistory']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Save data to Firebase Realtime Database
        ref = db.reference(f'/farms/{data["userId"]}')
        new_farm_ref = ref.push()
        new_farm_ref.set(data)
        
        return jsonify({'success': True, 'id': new_farm_ref.key}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/farm-data/<user_id>', methods=['GET'])
def get_farm_data(user_id):
    try:
        # Get farm data for specific user
        ref = db.reference(f'/farms/{user_id}')
        data = ref.get()
        
        if data is None:
            return jsonify([]), 200
        
        # Convert to list format
        farm_list = [{'id': key, **value} for key, value in data.items()]
        
        return jsonify(farm_list), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
