from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

# OpenWeatherMap API key - you'll need to get your own from https://openweathermap.org/api
API_KEY = "c582535d330def2781cb8cdf58f54acc"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather', methods=['POST'])
def get_weather():
    city = request.form.get('city')
    
    if not city:
        return jsonify({'error': 'Please provide a city name'}), 400
    
    # Make request to OpenWeatherMap API
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'City not found or API error'}), 404
    
    data = response.json()
    
    # Extract relevant weather information
    weather_data = extract_weather_data(data)
    
    return jsonify(weather_data)

@app.route('/weather/coords', methods=['POST'])
def get_weather_by_coords():
    lat = request.form.get('lat')
    lon = request.form.get('lon')
    
    if not lat or not lon:
        return jsonify({'error': 'Please provide latitude and longitude'}), 400
    
    # Make request to OpenWeatherMap API
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Location not found or API error'}), 404
    
    data = response.json()
    
    # Extract relevant weather information
    weather_data = extract_weather_data(data)
    
    return jsonify(weather_data)

def extract_weather_data(data):
    """Extract relevant weather information from API response"""
    return {
        'city': data['name'],
        'country': data['sys']['country'],
        'temperature': data['main']['temp'],
        'feels_like': data['main']['feels_like'],
        'humidity': data['main']['humidity'],
        'description': data['weather'][0]['description'],
        'icon': data['weather'][0]['icon'],
        'wind_speed': data['wind']['speed']
    }

if __name__ == '__main__':
    app.run(debug=True) 