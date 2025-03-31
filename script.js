const apiKey = "a32ac803ccbd43fe198f987e19849874"; // Replace with your actual OpenWeatherMap API key
let isMetric = true;

const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");

function fetchWeather(city) {
  const unit = isMetric ? "metric" : "imperial";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) {
        alert("City not found!");
        return;
      }

      updateWeather(data);
      updateLocalTime(data.timezone);
      fetchForecast(data.coord.lat, data.coord.lon);
    });
}

function fetchWeatherByCoords(lat, lon) {
  const unit = isMetric ? "metric" : "imperial";
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
    .then(response => response.json())
    .then(data => {
      updateWeather(data);
      updateLocalTime(data.timezone);
      fetchForecast(lat, lon);
    });
}

function fetchForecast(lat, lon) {
  const unit = isMetric ? "metric" : "imperial";
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
    .then(res => res.json())
    .then(data => {
      const forecastContainer = document.getElementById("forecastContainer");
      forecastContainer.innerHTML = "";

      const daily = {};
      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = item;
      });

      Object.keys(daily).slice(0, 5).forEach(date => {
        const weather = daily[date];
        const icon = weather.weather[0].icon;
        const temp = Math.round(weather.main.temp);
        const card = `
          <div class="forecast-card">
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" />
            <p>${temp}°${isMetric ? "C" : "F"}</p>
          </div>
        `;
        forecastContainer.innerHTML += card;
      });
    });
}

function updateWeather(data) {
  document.getElementById("location").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°${isMetric ? "C" : "F"}`;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("wind").textContent = `${Math.round(data.wind.speed)} ${isMetric ? "km/h" : "mph"}`;

  const weatherMain = data.weather[0].main.toLowerCase();
  const iconMap = {
    clear: "clear.png",
    clouds: "cloud.png",
    rain: "rain.png",
    snow: "snow.png",
    thunderstorm: "storm.png",
    drizzle: "drizzle.png",
    mist: "mist.png"
  };
  const matchedIcon = iconMap[weatherMain] || "clear.png";
  document.getElementById("weatherIcon").src = `images/${matchedIcon}`;
  document.body.className = weatherMain;
}

function updateLocalTime(offset) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const localTime = new Date(utc + 1000 * offset);
  document.getElementById("localTime").textContent = `Local Time: ${localTime.toLocaleTimeString()}`;
}

searchBtn.addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;
  fetchWeather(city);
});

geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

unitToggle.addEventListener("click", () => {
  isMetric = !isMetric;
  const city = document.getElementById("location").textContent.split(",")[0];
  if (city) fetchWeather(city);
});
