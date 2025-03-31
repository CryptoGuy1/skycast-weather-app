const apiKey = "a32ac803ccbd43fe198f987e19849874"; // Replace with your OpenWeatherMap API key
let isMetric = true;
let darkMode = false;
let forecastChart;

const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");
const toggleDarkMode = document.getElementById("toggleDarkMode");

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

      const dates = [], temps = [];
      Object.keys(daily).slice(0, 6).forEach(date => {
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
        dates.push(date);
        temps.push(temp);
      });

      updateChart(dates, temps);
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
  triggerBackgroundAnimation(weatherMain);
}

function updateLocalTime(offset) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const localTime = new Date(utc + 1000 * offset);
  document.getElementById("localTime").textContent = `Local Time: ${localTime.toLocaleTimeString()}`;
}

function updateChart(labels, temps) {
  const ctx = document.getElementById("forecastChart").getContext("2d");
  if (forecastChart) forecastChart.destroy();
  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `Temperature (°${isMetric ? "C" : "F"})`,
        data: temps,
        borderColor: "#f67280",
        backgroundColor: "rgba(246, 114, 128, 0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function triggerBackgroundAnimation(type) {
  const container = document.getElementById("animation-container");
  container.innerHTML = "";
  if (type === "rain") {
    for (let i = 0; i < 100; i++) {
      const drop = document.createElement("div");
      drop.className = "raindrop";
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
      container.appendChild(drop);
    }
  } else if (type === "snow") {
    for (let i = 0; i < 80; i++) {
      const flake = document.createElement("div");
      flake.className = "snowflake";
      flake.style.left = `${Math.random() * 100}vw`;
      flake.style.animationDuration = `${Math.random() * 3 + 2}s`;
      flake.style.opacity = Math.random();
      container.appendChild(flake);
    }
  }
}

// Event Listeners
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

toggleDarkMode.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark");
});
