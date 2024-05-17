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
console.log(searchBtn);
console.log(mobileSearchBtn);
console.log(weatherIcon);
fetch("https://api.open-meteo.com/v1/forecast?latitude=16.0678&longitude=108.2208&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=Asia%2FBangkok&forecast_days=3")
    .then(result => {return result.json()})
    .then(data =>console.log(data))
    .catch();
const apiOWKey = "06ef294c6616022fc66cff355be7ccbf";
let cityname = document.querySelector("#search-bar-field");
let cityname_mobile = document.querySelector("#mobile-search-bar-field");
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
const getCurrentWeatherApi = (cityname) => fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityname.value}&appid=${apiOWKey}`)
    .then(jsonResult => {return jsonResult.json()})
    .then(data => {
        currentWeatherContainer.classList.remove("sm:hidden");
        let temp = Math.round(data.main.temp-272.15);
        let countryCode = data.sys.country;
        let windSpeed = Math.round(data.wind.speed * 3.6);
        let humidity = data.main.humidity;
        let weather = data.weather[0].main;
        let feelLikeTemp = Math.round(data.main.feels_like-272.15);
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
            hourlyWeatherContainer.classList.remove("hidden");
            hourlyWeatherContainer.classList.add("flex");
            while (hourlyWeatherContainer.lastChild) {
                hourlyWeatherContainer.lastChild.remove();
            }
            for (let j = 0; j < 12; j++) {
                const newDivs = document.createElement("div");
                newDivs.classList.add("w-20", "h-36", "bg-white", "mx-2",  "flex-shrink-0", "text-white", "flex", "flex-col", "items-center");
                // newDivs.style.width = "80px";
                // newDivs.style.height = "144px";
                // newDivs.style.backgroundColor = "white";
                // newDivs.style.flexShrink = "0";
                // newDivs.style.marginLeft = "8px";
                // newDivs.style.marginRight = "8px";
                // newDivs.style.display = "flex";
                // newDivs.style.flexDirection = "column";
                // newDivs.style.alignItems = "center";
                const hour = document.createElement("p");
                hour.style.color = "black";
                hour.textContent = timeInDay[i].split("T")[1];
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
                i++;
                newDivs.appendChild(hour);
                newDivs.appendChild(weatherIcon);
                newDivs.appendChild(temperatureP);
                hourlyWeatherContainer.append(newDivs);
            }
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
            dailyWeatherContainer.classList.remove("hidden");
            dailyWeatherContainer.classList.add("flex");
            while (dailyWeatherContainer.lastChild) {
                dailyWeatherContainer.lastChild.remove();
            }
            for (let i = 0; i < 7; i++) {
                const newDivs = document.createElement("div");
                newDivs.classList.add("w-full", "h-20", "bg-white", "mt-2", "shrink-0", "flex", "flex-row", "items-center", "justify-around");
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
                newDivs.append(weatherIcon);
                const tempText = document.createElement("div");
                const tempLabel = document.createElement("div");
                tempLabel.classList.add("text-black");
                tempLabel.textContent = "Temperature";
                const temp = document.createElement("div");
                tempText.classList.add("flex", "flex-col");
                temp.innerHTML = `<span class="text-xl md:text-2xl text-black">${Math.round(data.daily.temperature_2m_max[i])}°C</span> <span class="text-lg text-black opacity-90">${Math.round(data.daily.temperature_2m_min[i])}°C</span>`;
                tempText.append(tempLabel);
                tempText.append(temp);
                newDivs.append(tempText);

                const feelLikeTempText = document.createElement("div");
                const feelLikeLabel = document.createElement("div");
                feelLikeLabel.classList.add("text-black");
                feelLikeLabel.textContent = "Feel like";
                const feelLikeTemp = document.createElement("div");
                feelLikeTempText.classList.add("flex", "flex-col");
                feelLikeTemp.innerHTML = `<span class="text-xl md:text-2xl text-black">${Math.round(data.daily.apparent_temperature_max[i])}°C</span> <span class="text-lg text-black opacity-90">${Math.round(data.daily.apparent_temperature_min[i])}°C</span>`;
                feelLikeTempText.append(feelLikeLabel);
                feelLikeTempText.append(feelLikeTemp);
                newDivs.append(feelLikeTempText);

                const windSpeedText = document.createElement("div");
                const windSpeedLabel = document.createElement("div");
                windSpeedLabel.classList.add("text-black");
                windSpeedLabel.textContent = "Wind speed";
                const windSpeedTemp = document.createElement("div");
                windSpeedText.classList.add("flex", "flex-col");
                windSpeedTemp.innerHTML = `<span class="text-xl md:text-2xl text-black">${Math.round(data.daily.wind_speed_10m_max[i])}km/h</span>`;
                windSpeedText.append(windSpeedLabel);
                windSpeedText.append(windSpeedTemp);
                newDivs.append(windSpeedText);
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
searchBtn.addEventListener("click", displayWeatherInfos);
mobileSearchBtn.addEventListener("click", displayWeatherInfosOnMobile);