const API_KEY = 'API_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const weatherCard = document.getElementById('weatherCard');
const forecastSection = document.getElementById('forecastSection');
const forecastRow = document.getElementById('forecastRow');
const recentList = document.getElementById('recentList');

const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weatherIcon');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');

document.addEventListener('DOMContentLoaded', loadRecentSearches);

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

async function getWeatherData(city) {
    showLoading(true);
    hideError();
    hideWeatherDetails();

    try {
        const currentRes = await fetch(`${BASE_URL}weather?q=${city}&units=metric&appid=${API_KEY}`);
        if (!currentRes.ok) throw new Error('City not found. Please try again.');
        const currentData = await currentRes.json();

        const forecastRes = await fetch(`${BASE_URL}forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        saveToRecent(currentData.name);

        showLoading(false);
    } catch (error) {
        showLoading(false);
        showError(error.message);
    }
}

function displayCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = Math.round(data.main.temp);
    description.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    feelsLike.textContent = Math.round(data.main.feels_like);
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;
    pressure.textContent = data.main.pressure;

    weatherCard.style.display = 'block';
}

function displayForecast(data) {
    forecastRow.innerHTML = '';

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="day">${dayName}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather">
            <div class="forecast-temp">${Math.round(item.main.temp_max)}°C</div>
            <div class="forecast-low">${Math.round(item.main.temp_min)}°C</div>
        `;
        forecastRow.appendChild(forecastItem);
    });

    forecastSection.style.display = 'block';
}

function saveToRecent(city) {
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    searches = searches.filter(item => item.toLowerCase() !== city.toLowerCase());
    searches.unshift(city);

    if (searches.length > 5) searches.pop();

    localStorage.setItem('recentSearches', JSON.stringify(searches));
    renderRecentSearches(searches);
}

function loadRecentSearches() {
    const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    renderRecentSearches(searches);
}

function renderRecentSearches(searches) {
    recentList.innerHTML = '';
    searches.forEach(city => {
        const btn = document.createElement('div');
        btn.className = 'recent-item';
        btn.textContent = city;
        btn.addEventListener('click', () => {
            cityInput.value = city;
            getWeatherData(city);
        });
        recentList.appendChild(btn);
    });
}

function showLoading(isLoading) {
    loading.style.display = isLoading ? 'block' : 'none';
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function hideWeatherDetails() {
    weatherCard.style.display = 'none';
    forecastSection.style.display = 'none';
}