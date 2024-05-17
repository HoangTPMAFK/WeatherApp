"use strict";
const searchBtn = document.querySelector("#search-btn");
const mobileSearchBtn = document.querySelector("#mobile-search-btn");
const tempLabel = document.querySelector("#temp").querySelector("p");
const cityLabel = document.querySelector("#city").querySelector("p");
const humidityLabel = document.querySelector("#humidity-info").querySelector("span");
const windSpeedLabel = document.querySelector("#wind-speed-info").querySelector("span");
const weatherIcon = document.querySelector("#weather-icon").querySelector("img");
const feelLikeLabel = document.querySelector("#feel-like").querySelector("p");
const hourlyWeatherContainer = document.querySelector("#hourly-weather-overflow");
const dailyWeatherContainer = document.querySelector("#daily-weather-overflow");
const currentWeatherContainer = document.querySelector("#current-weather-info");
const headerBar = document.querySelector("header");
const initSearchBtn = document.querySelector("#init-search-button");
const initFrame = document.querySelector("#init-frame");
const graphToggleBtn = document.querySelector("#graph-toggle-btn");
const hourlyTempGraph = document.querySelector("#hourly-temperature-chart");
const dawnTime = document.querySelector("#dawn-container").querySelector("p");
const sunsetTime = document.querySelector("#sunset-container").querySelector("p");
let xValues = [""];
let maxYValue = -99;
let minYValue = 99;
let yValues = [,];
console.log(searchBtn);
console.log(mobileSearchBtn);
console.log(weatherIcon);
const apiOWKey = "06ef294c6616022fc66cff355be7ccbf";
let cityname = document.querySelector("#search-bar-field");
let cityname_mobile = document.querySelector("#mobile-search-bar-field");
let cityname_init = document.querySelector("#init-search-bar-field");
function displayTemp(temp) {
    tempLabel.textContent = temp + "°C";
}
function displayCity(cityName, countryID) {
    cityLabel.textContent = cityName + ", " + countryID;
}
function displayHumidity(humidity) {
    humidityLabel.textContent = humidity + "%";
}
function displayWindSpeed(windSpeed) {
    windSpeedLabel.textContent = windSpeed + " km/h";
}
function displayWeatherIcon(weather) {
    weatherIcon.src = "/build/images/" + weather.toLowerCase() + ".png";

}
function displayFeelLikeTemp(temp) {
    feelLikeLabel.textContent = "Feel like " + temp + "°C";
}
function displayHourlyWeather(lat, lon) {

}
function displayDawnTime(time) {
    dawnTime.textContent = time;
}
function displaySunsetTime(time) {
    sunsetTime.textContent = time;
}
function createGraph() {
    new Chart(hourlyTempGraph, {
        type: "line",
        data: {
          labels: xValues,
          datasets: [{
            fill: false,
            lineTension: 0,
            backgroundColor: "rgba(0,0,255,1.0)",
            borderColor: "rgba(7,5,255,0.7)",
            data: yValues
          }]
        },
        options: {
          legend: {display: false},
          scales: {
            yAxes: [{ticks: {min: Math.round(minYValue - 2), max: Math.round(maxYValue + 2)}}],
          }
        }
      });
      hourlyTempGraph.classList.toggle("hidden");
}
const getCurrentWeatherApi = (cityname) => fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityname.value}&appid=${apiOWKey}`)
    .then(jsonResult => {return jsonResult.json()})
    .then(data => {
        console.log(data);
        currentWeatherContainer.classList.remove("hidden");
        headerBar.classList.remove("hidden");
        initFrame.classList.add("hidden");
        let temp = Math.round(data.main.temp-272.15);
        let countryCode = data.sys.country;
        let windSpeed = Math.round(data.wind.speed * 3.6);
        let humidity = data.main.humidity;
        let weather = data.weather[0].main;
        let feelLikeTemp = Math.round(data.main.feels_like-272.15);
        let dawn = new Date(data.sys.sunrise*1000);
        let sunset = new Date(data.sys.sunset*1000);
        displayDawnTime("0" + dawn.getHours() + ":" + (dawn.getMinutes() >= 10 ? dawn.getMinutes() : "0" + dawn.getMinutes()));
        displaySunsetTime(sunset.getHours() + ":" + (sunset.getMinutes() >= 10 ? sunset.getMinutes() : "0" + sunset.getMinutes()));
        getGeocodingApi(cityname.value);
        console.log(temp);
        console.log(weather);
        displayTemp(Number(temp));
        displayWindSpeed(windSpeed);
        displayHumidity(humidity);
        displayWeatherIcon(weather);
        displayFeelLikeTemp(feelLikeTemp);
    })
    .catch(err => console.log(err));
const getGeocodingApi = (cityname) => fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityname}&appid=${apiOWKey}`)
    .then(resultJSON => {return resultJSON.json();})
    .then(data => {
        console.log(data[0]);
        const lat = data[0].lat;
        const lon = data[0].lon;
        const cityname = data[0].name;
        const countryCode = data[0].country;
        displayCity(cityname, countryCode);
        getHourlyWeatherInfo(lat, lon);
        getDailyWeatherInfo(lat, lon);
        console.log({lat, lon, cityname});
        return {lat, lon, cityname};
    })
    .catch(err => console.log(err));
const getHourlyWeatherInfo = (lat, lon) => {
    const timezone = String(Intl.DateTimeFormat().resolvedOptions().timeZone);
    timezone.replace(" ", "%2F");
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=${timezone}&forecast_days=3`)
        .then(result => {return result.json()})
        .then(data => {
            const d = new Date();
            let time = d.getFullYear() + "-";
            if (d.getMonth() + 1 < 10) {
                time = time + "0" + (d.getMonth() + 1) + "-"; 
            } else {
                time = time + (d.getMonth() + 1) + "-";
            }
            if (d.getDate() < 10) {
                time = time + "0" + d.getDate() + "T"; 
            } else {
                time = time + d.getDate() + "T";
            }
            if (d.getHours() < 10) {
                time = time + "0" + d.getHours() + ":"; 
            } else {
                time = time + d.getHours() + ":";
            }
            time = time + "00";
            const tempArray = [];
            const timeInDay = data.hourly.time;
            let i = 0;
            for (;i <= 23; i++) {
                if (String(timeInDay[i]) >= time) {
                    console.log(timeInDay[i]);
                    break;
                }
            }
            document.querySelector("#hourly-weather-section").classList.remove("hidden");
            while (hourlyWeatherContainer.lastChild) {
                hourlyWeatherContainer.lastChild.remove();
            }
            xValues = [""];
            yValues = [,];
            for (let j = 0; j < 12; j++) {
                const newDivs = document.createElement("div");
                newDivs.classList.add("w-20", "h-36", "bg-slate-100", "mx-2",  "flex-shrink-0", "text-white", "flex", "flex-col", "items-center");
                const hour = document.createElement("p");
                hour.style.color = "black";
                hour.textContent = timeInDay[i].split("T")[1];
                xValues.push(timeInDay[i].split("T")[1]);
                const weatherIcon = document.createElement("img");
                if ([0, 1, 2].indexOf(data.hourly.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/clear.png";
                } else if ([3].indexOf(data.hourly.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/clouds.png";
                } else if ([45, 48].indexOf(data.hourly.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/mist.png";
                } else if ([51, 53, 55, 56, 57].indexOf(data.hourly.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/drizzle.png";
                } else if ([61, 63, 65, 66, 67, 80, 81, 82].indexOf(data.hourly.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/rain.png";
                } else if ([71, 73, 75, 77, 85, 86].indexOf(data.hourly.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/snow.png";
                } else {
                    weatherIcon.src = "/build/images/storm.png";
                }
                weatherIcon.style.height = "60px";
                weatherIcon.classList.add("hover:scale-125");
                const temperatureP = document.createElement("p");
                temperatureP.style.fontSize = "24px";
                temperatureP.style.color = "black";
                temperatureP.style.textAlign = "center";
                console.log(Math.round(data.hourly.temperature_2m[i]));
                temperatureP.textContent = Math.round(data.hourly.temperature_2m[i]) + "°C";
                yValues.push(Math.round(data.hourly.temperature_2m[i]));
                if (data.hourly.temperature_2m[i] > maxYValue ) 
                    maxYValue = data.hourly.temperature_2m[i];
                if (data.hourly.temperature_2m[i] < minYValue) minYValue = data.hourly.temperature_2m[i];
                i++;
                newDivs.appendChild(hour);
                newDivs.appendChild(weatherIcon);
                newDivs.appendChild(temperatureP);
                hourlyWeatherContainer.append(newDivs);
            }
            xValues.push("");
            yValues.push();
            createGraph(xValues);
            console.log(data);
        })
        .catch(err => console.log(err));
}
const getDailyWeatherInfo = (lat, lon) => {
    const timezone = String(Intl.DateTimeFormat().resolvedOptions().timeZone);
    timezone.replace(" ", "%2F");
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max&timezone=${timezone}&forecast_days=7`)
        .then(resultJSON => {return resultJSON.json()})
        .then(data => {
            console.log(data);
            document.querySelector("#daily-weather-section").classList.remove("hidden");
            while (dailyWeatherContainer.lastChild) {
                dailyWeatherContainer.lastChild.remove();
            }
            for (let i = 0; i < 7; i++) {
                const newDivs = document.createElement("div");
                newDivs.classList.add("w-full", "h-24", "bg-slate-100", "my-2", "shrink-0", "flex", "flex-col", "items-center", "rounded-lg");
                const weatherContainer = document.createElement("div");
                weatherContainer.classList.add("w-full", "h-16", "shrink-0", "flex", "flex-row", "items-center", "justify-around", "rounded-lg");
                const dateInfo = document.createElement("div");
                dateInfo.classList.add("text-black");
                dateInfo.textContent = data.daily.time[i].split("-")[2] + "/" + data.daily.time[i].split("-")[1];
                const weatherIcon = document.createElement("img");
                weatherIcon.style.width = "60px";
                if ([0, 1, 2].indexOf(data.daily.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/clear.png";
                } else if ([3].indexOf(data.daily.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/clouds.png";
                } else if ([45, 48].indexOf(data.daily.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/mist.png";
                } else if ([51, 53, 55, 56, 57].indexOf(data.daily.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/drizzle.png";
                } else if ([61, 63, 65, 66, 67, 80, 81, 82].indexOf(data.daily.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/rain.png";
                } else if ([71, 73, 75, 77, 85, 86].indexOf(data.daily.weather_code[i]) != -1) {
                    weatherIcon.src = "/build/images/snow.png";
                } else {
                    weatherIcon.src = "/build/images/storm.png";
                }
                weatherIcon.classList.add("hover:scale-125");
                weatherContainer.append(weatherIcon);
                const tempText = document.createElement("div");
                const tempLabel = document.createElement("div");
                tempLabel.classList.add("text-black");
                tempLabel.textContent = "Temperature";
                const temp = document.createElement("div");
                tempText.classList.add("flex", "flex-col");
                temp.innerHTML = `<span class="text-xl md:text-2xl text-black">${Math.round(data.daily.temperature_2m_max[i])}°C</span> <span class="text-lg text-black opacity-90">${Math.round(data.daily.temperature_2m_min[i])}°C</span>`;
                tempText.append(tempLabel);
                tempText.append(temp);
                weatherContainer.append(tempText);

                const feelLikeTempText = document.createElement("div");
                const feelLikeLabel = document.createElement("div");
                feelLikeLabel.classList.add("text-black");
                feelLikeLabel.textContent = "Feel like";
                const feelLikeTemp = document.createElement("div");
                feelLikeTempText.classList.add("flex", "flex-col");
                feelLikeTemp.innerHTML = `<span class="text-xl md:text-2xl text-black">${Math.round(data.daily.apparent_temperature_max[i])}°C</span> <span class="text-lg text-black opacity-90">${Math.round(data.daily.apparent_temperature_min[i])}°C</span>`;
                feelLikeTempText.append(feelLikeLabel);
                feelLikeTempText.append(feelLikeTemp);
                weatherContainer.append(feelLikeTempText);

                const windSpeedText = document.createElement("div");
                const windSpeedLabel = document.createElement("div");
                windSpeedLabel.classList.add("text-black");
                windSpeedLabel.textContent = "Wind speed";
                const windSpeedTemp = document.createElement("div");
                windSpeedText.classList.add("flex", "flex-col");
                windSpeedTemp.innerHTML = `<span class="text-xl md:text-2xl text-black">${Math.round(data.daily.wind_speed_10m_max[i])}km/h</span>`;
                windSpeedText.append(windSpeedLabel);
                windSpeedText.append(windSpeedTemp);
                weatherContainer.append(windSpeedText);
                newDivs.append(dateInfo);
                newDivs.append(dateInfo);
                newDivs.append(weatherContainer);
                dailyWeatherContainer.append(newDivs);
            }
        })
        .catch(err => console.log(err));
}
const displayWeatherInfos = () => {
    getCurrentWeatherApi(cityname);
}
const displayWeatherInfosOnMobile = () => {
    getCurrentWeatherApi(cityname_mobile);
}
const displayWeatherInfosFirstTime = () => {
    getCurrentWeatherApi(cityname_init);
}
const toggleTempGraph = () => {
    document.querySelector("#hourly-temp-graph-container").classList.toggle("hidden");
}
searchBtn.addEventListener("click", displayWeatherInfos);
mobileSearchBtn.addEventListener("click", displayWeatherInfosOnMobile);
initSearchBtn.addEventListener("click", displayWeatherInfosFirstTime);
graphToggleBtn.addEventListener("click", toggleTempGraph);
const initApp = () => {
    const hamburgerBtn = document.querySelector("#hamburger-button");
    const mobileMenuBar = document.querySelector("#mobile-menu-sidebar");
    hamburgerBtn.addEventListener('click', () => {
        mobileMenuBar.classList.toggle("block");
        mobileMenuBar.classList.toggle("hidden");
    });
    mobileMenuBar.addEventListener('click', () => {
        mobileMenuBar.classList.toggle("block");
        mobileMenuBar.classList.toggle("hidden");
    });
}
document.addEventListener('DOMContentLoaded', initApp);