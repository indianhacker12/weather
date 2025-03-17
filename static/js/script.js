document.addEventListener('DOMContentLoaded', () => {
    const weatherForm = document.getElementById('weather-form');
    const cityInput = document.getElementById('city-input');
    const weatherContainer = document.getElementById('weather-container');
    const errorContainer = document.getElementById('error-container');
    const initialLocationBtn = document.getElementById('initial-location-btn');

    // Add event listener to the initial location button
    if (initialLocationBtn) {
        initialLocationBtn.addEventListener('click', getCurrentLocation);
    }

    // Get user's location on page load
    getCurrentLocation();

    // Function to get current location
    function getCurrentLocation() {
        if (navigator.geolocation) {
            weatherContainer.innerHTML = '<div class="loading">Detecting your location...</div>';
            weatherContainer.classList.add('active');
            errorContainer.classList.remove('active');
            
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchWeatherByCoords(lat, lon);
                },
                error => {
                    console.error("Geolocation error:", error);
                    showError('Could not get your location. Please search manually.');
                    weatherContainer.classList.remove('active');
                }
            );
        } else {
            showError('Geolocation is not supported by your browser. Please search manually.');
        }
    }

    // Function to fetch weather by coordinates
    async function fetchWeatherByCoords(lat, lon) {
        try {
            // Create form data
            const formData = new FormData();
            formData.append('lat', lat);
            formData.append('lon', lon);
            
            // Send request to backend
            const response = await fetch('/weather/coords', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch weather data');
            }
            
            const weatherData = await response.json();
            displayWeatherData(weatherData);
            
        } catch (error) {
            showError(error.message);
            weatherContainer.classList.remove('active');
        }
    }

    weatherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const city = cityInput.value.trim();
        
        if (!city) {
            showError('Please enter a city name');
            return;
        }
        
        try {
            // Show loading state
            weatherContainer.innerHTML = '<div class="loading">Loading...</div>';
            weatherContainer.classList.add('active');
            errorContainer.classList.remove('active');
            
            // Create form data
            const formData = new FormData();
            formData.append('city', city);
            
            // Send request to backend
            const response = await fetch('/weather', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch weather data');
            }
            
            const weatherData = await response.json();
            displayWeatherData(weatherData);
            
        } catch (error) {
            showError(error.message);
            weatherContainer.classList.remove('active');
        }
    });
    
    function displayWeatherData(data) {
        const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
        
        weatherContainer.innerHTML = `
            <div class="weather-header">
                <h2>${data.city}, ${data.country}</h2>
                <p class="weather-description">${data.description}</p>
            </div>
            
            <div class="weather-main">
                <div class="temp">${Math.round(data.temperature)}°C</div>
                <div class="weather-icon">
                    <img src="${iconUrl}" alt="${data.description}">
                </div>
            </div>
            
            <div class="weather-details">
                <div class="weather-detail-item">
                    <i class="fas fa-temperature-high"></i>
                    <span>Feels like: ${Math.round(data.feels_like)}°C</span>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: ${data.humidity}%</span>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-wind"></i>
                    <span>Wind: ${data.wind_speed} m/s</span>
                </div>
            </div>
            <div class="location-button">
                <button id="get-location-btn" type="button">
                    <i class="fas fa-map-marker-alt"></i> Use My Location
                </button>
            </div>
        `;
        
        // Add event listener to the location button
        const locationBtn = document.getElementById('get-location-btn');
        if (locationBtn) {
            locationBtn.addEventListener('click', getCurrentLocation);
        }
        
        weatherContainer.classList.add('active');
    }
    
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.add('active');
    }
}); 