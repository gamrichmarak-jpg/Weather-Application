const form = document.querySelector("form");
const search = document.querySelector("#search");

const container = document.querySelector(".container");
const cityName = container.querySelector(".city-name");
const date = container.querySelector(".date");
const sunIcon = container.querySelector(".sun-icon");
const currentTemperature = container.querySelector(".temperature");
const searchSuggestion = form.querySelector('.search-suggestion');

let city = "";
let debounceTimer;

// SEARCH SUGGESTION FEATURE 
form.addEventListener("input", (event) => {
  event.preventDefault();

  weatherObj.weatherCity_data = null;
  weatherObj.weather_data = null;

  searchSuggestion.innerHTML = "";
  clearTimeout(debounceTimer);

  weatherObj.requestId++;
  const currentRequest = weatherObj.requestId;

  if (container.classList.contains('active')) noResult();
  if (search.value.length < 4) return;

   debounceTimer = setTimeout( async () => {
   try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search.value}&count=5`);

    if (response.ok === false) {
      throw new Error ("Sorry searching your input gets a bad response!");
    }
    const data = await response.json();
   
    if (currentRequest !== weatherObj.requestId) return;

    if (!data.results?.length) {
      noResult();
      return;
    }
    weatherObj.cityResponse = response;
    weatherObj.weatherCity_data = data;
    
    renderSuggestion();

    } catch(error){
      if (currentRequest !== weatherObj.requestId) return;
      console.log(error);
      return;
    }
   }, 400);
})

function renderSuggestion() {
 weatherObj.weatherCity_data.results.forEach((theCity, index) => {

   const getCountryName = new Intl.DisplayNames(['en'], {type: 'region'});
   const country_name = theCity.country_code ? getCountryName.of(theCity.country_code) : "Unknown";

    const suggestion = document.createElement('li');
    suggestion.className = "suggestion";
    suggestion.textContent = `${theCity.name}, ${theCity.admin1 ? theCity.admin1+"," : ""} ${theCity.country ? theCity.country : country_name}`;

    suggestion.addEventListener("click", () => {
      longLat.longitude = theCity.longitude;
      longLat.latitude = theCity.latitude;
      longLat.position = index;
      fetchCity = false;
      fetchWeatherData();
    })

    searchSuggestion.appendChild(suggestion);
    })
 searchSuggestion.classList.add('active-suggestion');
}

let fetchCity;
// FORM SUBMISSION 
form.addEventListener("submit", (event) => {
   event.preventDefault();

   city = search.value;
   fetchCity = true;
   fetchWeatherData(city);
})

// RETRY BUTTON 
const retyBtn = document.querySelector('.retry-btn');

retyBtn.addEventListener("click", () => {
  city = search.value;
  fetchCity = true;
  fetchWeatherData(city);
});

let countryName = null;

const weatherObj = {
   cityResponse: "",
   weather_Response: "",
   weatherCity_data: "",
   weather_data: "",
   runId: 0,
   requestId:0
}
const longLat = {
  longitude: "",
  latitude: "",
  position: ""
}
// WEATHER REQUEST API CALL 
async function fetchWeatherData(city) {
  searchSuggestion.classList.remove('active-suggestion');

  if (container.classList.contains('active')) noResult();
  if (main.classList.contains('error')) errorFunction();

  weatherObj.runId++;
  const currentRequest = weatherObj.runId;
  try {
    loading(true);

    if (fetchCity === true) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);

    if (response.ok === false) {
    throw new Error ("We got a bad respose from city response");
  }

    const data = await response.json();

    if (currentRequest !== weatherObj.runId) return;

    if (!data.results?.length) {
      noResult();
      return;
    }

   longLat.latitude = data.results[0].latitude;
   longLat.longitude = data.results[0].longitude;

   weatherObj.cityResponse = response;
   weatherObj.weatherCity_data = data;
   longLat.position = 0;
  }

  const getCountryName = new Intl.DisplayNames(['en'], {type: 'region'});
  countryName = weatherObj.weatherCity_data.results[longLat.position].country_code ? getCountryName.of(weatherObj.weatherCity_data.results[longLat.position].country_code) : "Unknown";

  const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${longLat.latitude}&longitude=${longLat.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,is_day,weather_code`);

  if (weatherResponse.ok === false) {
    throw new Error ("We have a bad weather data response!");
  }
   const weatherData = await weatherResponse.json();

   if (currentRequest !== weatherObj.runId) return;

   weatherObj.weather_Response = weatherResponse;
   weatherObj.weather_data = weatherData;

     } catch (error) {
      if (currentRequest !== weatherObj.runId) return;
      console.log(error);
      errorFunction();
      return;
     } finally {
      if (currentRequest !== weatherObj.runId) return;
      loading(false);
     }

     if (currentRequest !== weatherObj.runId) return;
     if (!weatherObj.weatherCity_data) return;
     if (!weatherObj.weather_data) return;

     searchSuggestion.classList.remove('active-suggestion');
     selectedDay.removeAttribute('data-date');
     isOn = null;
     currentWeather();   
   }

   const mainDisplay = document.querySelector('.main-display');
   const dailyForecast_parent = document.querySelector('.daily-forecast-container');
   const hourlyLoading = document.querySelector('.hourly-forecast');

   //  LOADING STATE UI FUNCTION
   function loading(data) {
    if (data === false) {
      mainDisplay.classList.remove('loading');
      dailyForecast_parent.classList.remove('loading');
      hourlyLoading.classList.remove('loading');
    } else {
      searchSuggestion.classList.remove('active-suggestion');

      mainDisplay.classList.add('loading');
      dailyForecast_parent.classList.add('loading');
      hourlyLoading.classList.add('loading');
      apparentValue.textContent = "—";
      humidityValue.textContent = "—";
      windValue.textContent = "—";
      precipitationValue.textContent = "—";
      selectedDay.textContent = "—";
    }
   }
  // NO RESULT STATE UI FUNCTION 
   function noResult() {
    searchSuggestion.classList.remove('active-suggestion');
    container.classList.contains('active') ? container.classList.remove('active') : container.classList.add('active');
   }

   const main = document.querySelector('main');
   
  // ERROR STATE UI FUNCTION 
   function errorFunction() {
    searchSuggestion.classList.remove('active-suggestion');
    main.classList.contains('error') ? main.classList.remove('error') : main.classList.add('error');
   }

   const apparentValue = container.querySelector(".degree");
   const humidityValue = container.querySelector(".percentage");
   const windValue = container.querySelector(".mph");
   const precipitationValue = container.querySelector(".in");
 
  // CURRENT WEATHER UI DISPLAY 
  function currentWeather() {

    if (!weatherObj.weather_data) return;

    const temperature_unit = temperature_Unit_Converter();
    const windSpeed_unit = windSpeed_Unit_Converter();
    const precipitationUnit = precipitation_Unit_Converter();

    cityName.textContent = `${weatherObj.weatherCity_data.results[longLat.position].name}, ${weatherObj.weatherCity_data.results[longLat.position].country ? weatherObj.weatherCity_data.results[longLat.position].country : countryName}`;
    date.textContent = new Date().toLocaleString(["en-US"], { weekday: "long", year: "numeric", month: "short", day: "numeric" });

    currentTemperature.textContent = `${Math.round(temperature_unit)}°`;
    
    const iconObject = icons();

    const weatherCode = weatherObj.weather_data.current.weather_code;
    sunIcon.src = iconObject[weatherCode];

    // ADDITIONAL WEATHER METRICS/IMPERIAL DISPLAY
    apparentValue.textContent = `${Math.round(weatherObj.weather_data.current.apparent_temperature)}°`;
    humidityValue.textContent = `${Math.round(weatherObj.weather_data.current.relative_humidity_2m)}%`;
    windValue.textContent = `${Math.round(windSpeed_unit.value)} ${windSpeed_unit.text}`;
    precipitationValue.textContent = `${Math.round(precipitationUnit.value)} ${precipitationUnit.text}`;
    
    dailyForecastFunction();
    weekDayList();
}

const unitsBtn = document.querySelector(".units");
const unitsContainer = document.querySelector("ul");
const temperatureCelcius = unitsContainer.querySelector(".temperature-celcius");
const temperatureFahrenheit = unitsContainer.querySelector('.temperature-fahrenheit');
const kilometerUnit = unitsContainer.querySelector(".kilometer-unit");
const milesUnit = unitsContainer.querySelector(".miles-unit");
const millimeters = unitsContainer.querySelector(".millimeters");
const inches = unitsContainer.querySelector('.inches');
const imperialBtn = unitsContainer.querySelector(".imperial-btn");

const celciusCheckmark = temperatureCelcius.querySelector(".celcius-checkmark");
const fahrenheitCheckmark = temperatureFahrenheit.querySelector(".fahrenheit-checkmark");
const kmCheckmark = kilometerUnit.querySelector(".km-checkmark");
const milesCheckmark = milesUnit.querySelector(".miles-checkmark");
const mmCheckmark = millimeters.querySelector(".mm-checkmark");
const inchesCheckmark = inches.querySelector(".inches-checkmark");

function defaultCheckmark() {
  celciusCheckmark.classList.add('checkmark');
  kmCheckmark.classList.add('checkmark');
  mmCheckmark.classList.add("checkmark");

  temperatureCelcius.classList.add('active-units');
  kilometerUnit.classList.add('active-units');
  millimeters.classList.add('active-units');
}

defaultCheckmark();

// UNIT DROPDOWN 
unitsBtn.addEventListener("click", () => {
  unitsContainer.classList.add('isActive');
})
document.addEventListener('click', (event) => {
  if (!event.target.closest('.units')) unitsContainer.classList.remove('isActive');
})

const unitState = {
  tempState: "Celsius",
  windSpeed_state: "km/h",
  precipitation: "mm"
}

// CELCIUS BUTTON 
temperatureCelcius.addEventListener("click", () => {
  unitState.tempState = "Celsius";
  fahrenheitCheckmark.classList.remove("checkmark");
  temperatureFahrenheit.classList.remove("active-units");

  celciusCheckmark.classList.add("checkmark");
  temperatureCelcius.classList.add("active-units");
  currentWeather();
})
// FAHRENHEIT BUTTON 
temperatureFahrenheit.addEventListener("click", () => {
  unitState.tempState = "Fahrenheit";
  celciusCheckmark.classList.remove("checkmark");
  temperatureCelcius.classList.remove("active-units");

  fahrenheitCheckmark.classList.add("checkmark");
  temperatureFahrenheit.classList.add("active-units");
  currentWeather();
})

// TEMPERATURE UNIT CONVERTER
function temperature_Unit_Converter() {

  const value = weatherObj.weather_data.current.temperature_2m;
  
   if (unitState.tempState === "Celsius") {
    return value;
   } else {
    return value * 9/5 + 32;
  }
}

kilometerUnit.addEventListener("click", () => {
  unitState.windSpeed_state = "km/h";
  milesCheckmark.classList.remove("checkmark");
  milesUnit.classList.remove("active-units");

  kmCheckmark.classList.add("checkmark");
  kilometerUnit.classList.add("active-units");  
  currentWeather();
})

milesUnit.addEventListener("click", () => {
  unitState.windSpeed_state = "mph";
  kmCheckmark.classList.remove("checkmark");
  kilometerUnit.classList.remove("active-units");

  milesCheckmark.classList.add("checkmark");
  milesUnit.classList.add("active-units");
  currentWeather();
})
// WIND SPEED UNIT CONVERTER 
function windSpeed_Unit_Converter() {
  const value = weatherObj.weather_data.current.wind_speed_10m;

  if (unitState.windSpeed_state === "km/h") {
    return {
      value: value,
      text: "km/h"
    }
  } else {
    return {
      value: value * 0.621371,
      text: "mph"
    } 
  }
}

// MILLIMETERS UNIT BUTTON 
millimeters.addEventListener("click", () => {
  unitState.precipitation = "mm";
  inchesCheckmark.classList.remove("checkmark");
  inches.classList.remove('active-units')

  mmCheckmark.classList.add("checkmark");
  millimeters.classList.add("active-units");
  currentWeather();
})

// INCHES UNIT BUTTON 
inches.addEventListener("click", () => {
  unitState.precipitation = "in";
  mmCheckmark.classList.remove('checkmark');
  millimeters.classList.remove("active-units");

  inchesCheckmark.classList.add("checkmark");
  inches.classList.add("active-units");
  currentWeather();
})
// PRECIPITATION UNIT CONVERTER 
function precipitation_Unit_Converter() {
  const value = weatherObj.weather_data.current.precipitation;

  if (unitState.precipitation === "mm") {
    return {
      value: value,
      text: "mm"
    }
  } else {
    return {
      value: value / 25.4,
      text: "in"
    }
  }
}

let unitSystem = "metrics"
imperialBtn.addEventListener("click", () => {

  if (unitSystem === "metrics") {
      unitSystem = "imperial";
      unitState.tempState = "Fahrenheit";
      unitState.windSpeed_state = "mph";
      unitState.precipitation = "in";
      imperialBtn.textContent = "Switch to Metrics";

      celciusCheckmark.classList.remove("checkmark");
      kmCheckmark.classList.remove("checkmark");
      mmCheckmark.classList.remove('checkmark');
      temperatureCelcius.classList.remove('active-units');
      kilometerUnit.classList.remove('active-units');
      millimeters.classList.remove("active-units");

      fahrenheitCheckmark.classList.add('checkmark');
      milesCheckmark.classList.add('checkmark');
      inchesCheckmark.classList.add('checkmark');
      temperatureFahrenheit.classList.add("active-units");
      milesUnit.classList.add("active-units");
      inches.classList.add('active-units');

  } else if (unitSystem === "imperial") {
      unitSystem = "metrics";
      unitState.tempState = "Celsius";
      unitState.windSpeed_state = "km/h";
      unitState.precipitation = "mm";
      imperialBtn.textContent = "Switch to Imperial";

      fahrenheitCheckmark.classList.remove('checkmark');
      milesCheckmark.classList.remove('checkmark');
      inchesCheckmark.classList.remove('checkmark');
      temperatureFahrenheit.classList.remove("active-units");
      milesUnit.classList.remove("active-units");
      inches.classList.remove('active-units');

      celciusCheckmark.classList.add('checkmark')
      kmCheckmark.classList.add("checkmark")
      mmCheckmark.classList.add('checkmark')
      temperatureCelcius.classList.add('active-units');
      kilometerUnit.classList.add('active-units');
      millimeters.classList.add("active-units");
  }
  currentWeather();
})

// WEATHER CODE ICONS OBJECT
function icons() {
  return {
        0: "icon-sunny.webp",

        1: "icon-partly-cloudy.webp",
        2: "icon-partly-cloudy.webp",

        3: "icon-overcast.webp",

        45: "icon-fog.webp",
        48: "icon-fog.webp",

        51: "icon-drizzle.webp",
        53: "icon-drizzle.webp",
        55: "icon-drizzle.webp",
        56: "icon-drizzle.webp",
        57: "icon-drizzle.webp",

        61: "icon-rain.webp",
        63: "icon-rain.webp",
        65: "icon-rain.webp",
        66: "icon-rain.webp",
        67: "icon-rain.webp",
        80: "icon-rain.webp",
        81: "icon-rain.webp",
        82: "icon-rain.webp",

        71: "icon-snow.webp",
        73: "icon-snow.webp",
        75: "icon-snow.webp",
        77: "icon-snow.webp",
        85: "icon-snow.webp",
        86: "icon-snow.webp",

        95: "icon-storm.webp",
        96: "icon-storm.webp",
        99: "icon-storm.webp"
    };
}

const dailyForecastContainer = container.querySelector(".daily-forecast");

// DAILY FORECAST CARDS 
function dailyForecastFunction() {

  dailyForecastContainer.innerHTML = "";

  weatherObj.weather_data.daily.time.forEach((date, index) => {
  const unit =  dailyForecast_Unit_Converter(index);

    const dayCard = document.createElement("div");
    const dayName = document.createElement("span");
    const icon = document.createElement("img");
    const tempParent = document.createElement("div");
    const tempMax = document.createElement("span");
    const tempMin = document.createElement("span");

    dayCard.classList.add("day-card");
    dayName.classList.add("day-name");
    icon.classList.add("day-card-icons");
    tempParent.classList.add("temp-max-min-parent");
    tempMax.classList.add("temp-max");
    tempMin.classList.add("temp-min");

    dayName.textContent = new Date(date).toLocaleDateString("en-US", {weekday: "short"});

    const iconObject = icons();
    const weatherCode = weatherObj.weather_data.daily.weather_code[index];
    icon.src = iconObject[weatherCode];

    tempMax.textContent = `${Math.round(unit.max)}°`;
    tempMin.textContent = `${Math.round(unit.min)}°`;

    dailyForecastContainer.appendChild(dayCard);
    dayCard.appendChild(dayName);
    dayCard.appendChild(icon);
    dayCard.appendChild(tempParent);
    tempParent.appendChild(tempMax);
    tempParent.appendChild(tempMin);
  });
}
// DAILY FORECAST UNIT CONVERTER 
function dailyForecast_Unit_Converter(index) {
 const maximum_temp = weatherObj.weather_data.daily.temperature_2m_max[index];
 const minimum_temp = weatherObj.weather_data.daily.temperature_2m_min[index];

    if (unitState.tempState === "Celsius") {
    return {
      max: maximum_temp,
      min: minimum_temp
    }
   } else {
    return {
      max: maximum_temp * 9/5 + 32,
      min: minimum_temp * 9/5 + 32
    } 
  }
}

const weekDropdown = container.querySelector(".week-dropdown");
const selectedDay = weekDropdown.querySelector(".selected-day");
const ul = container.querySelector("ul");

// SEVEN DAYS LIST AND DATE ATTRIBUTIONS   (SEVEN DAYS HOURLY CARDS BUTTONS FEATURE)
function weekDayList() {

  ul.innerHTML = "";
  weatherObj.weather_data.daily.time.forEach((dates, index) => {

  const weekday = new Date(dates).toLocaleString("en-US", {weekday: "long"});
  const list = document.createElement("li");
  list.classList.add("weekdays");

  list.textContent = weekday;
  list.dataset.date = dates;

  ul.appendChild(list);

  if (index === 0) {
  list.classList.add("active-theme");
  activeState = list;
}

 if (isOn === list.dataset.date) {
    activeState.classList.remove("active-theme");
    list.classList.add("active-theme");
    activeState = list;
}
  })

  selectionHourlyCards();

  if (selectedDay.dataset.date !== undefined) {  //RUNS WHEN USER CLICKS ON A DAY AND CHANGE THE DEGREE UNIT// 
  const date = new Date();
  const currentDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart("2", "0")}-${String(date.getDate()).padStart("2", "0")}`;
  
  const userClicksCall = filterDate(selectedDate);
  const startingPosition = 15;
  selectedDay.dataset.date === currentDate ? defaultHourlyCards() : render(userClicksCall, startingPosition);
  return;
  } 
  defaultHourlyCards();
};

// DROPDOWN TOGGLE 
weekDropdown.addEventListener("click", () => {
  ul.classList.add("active");
});
// OUTSIDE CLICK DROPDOWN CLOSE 
document.addEventListener("click", (event) => {
  if (!event.target.closest('.week-dropdown')) ul.classList.remove("active");
})

let activeState = null;
let isOn = null;
let selectedDate;
// 7 DAYS CALLBACK AND SAVE THE FILTERED ARRAY ORIGINAL INDEXES
function selectionHourlyCards() {
  const listItems = ul.querySelectorAll(".weekdays");

  listItems.forEach((li) => {
    li.addEventListener("click", (event) => {

    selectedDay.textContent = event.target.textContent;
    selectedDay.dataset.date = event.target.dataset.date;

    if (activeState !== null) activeState.classList.remove("active-theme");
  
    event.target.classList.add("active-theme");

    isOn = event.target.dataset.date;
    activeState = event.target;
     
    selectedDate = weatherObj.weather_data.hourly.time.filter(el => el.includes(selectedDay.dataset.date));
      
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart("2", "0")}-${String(date.getDate()).padStart("2", "0")}`;

    const userClicksCall = filterDate(selectedDate);
    const startingPosition = 15;

    selectedDay.dataset.date === currentDate ? defaultHourlyCards() : render(userClicksCall, startingPosition);
 });
   });
  }

  const eightHours_card = container.querySelectorAll('.eight-hours-card');
 
// 8 HOURS HOURLY CARD RENDER 
function render(orgIndexes, startingPosition) {

  eightHours_card.forEach(element => {
   element.style.visibility = "hidden";
});

  const eightHours = orgIndexes.slice(startingPosition, startingPosition + 8);
   
  eightHours.forEach((el, index) => {

    const temperature_unit = hourlyForecast_unitConverter(el);
    const card = eightHours_card[index];

    const eightHours_icon = card.querySelector(".eight-hours-icon");
    const eightHours_time = card.querySelector(".time");
    const eightHours_temperature = card.querySelector(".eight-hours-temperature");

    const iconObject = icons();
    const weatherIcon = weatherObj.weather_data.hourly.weather_code[el];

    eightHours_icon.src = iconObject[weatherIcon];
    eightHours_time.textContent = new Date(weatherObj.weather_data.hourly.time[el]).toLocaleString("en-US", {hour: "numeric", hour12: true});
    eightHours_temperature.textContent = `${Math.round(temperature_unit)}°`;
    card.style.visibility = "visible";
  })
}

function hourlyForecast_unitConverter(el) {
  const value = weatherObj.weather_data.hourly.temperature_2m[el];

    if (unitState.tempState === "Celsius") {
    return value;
   } else {
    return value * 9/5 + 32;
   }
}
 // DEFAULT 8 HOURS CARDS 
function defaultHourlyCards() {

  const date = new Date();
  const realDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart("2", "0")}-${String(date.getDate()).padStart("2", "0")}`;

  selectedDay.textContent = new Date().toLocaleString("en-US", {weekday: "long"});
  
  const startingPositon = date.getHours();

  const currentDate = weatherObj.weather_data.hourly.time.filter(el => el.includes(realDate));

  const defaultCall = filterDate(currentDate);
  render(defaultCall, startingPositon);
}

// SAVED THE ORIGINAL INDEXES OF FILTERED FUNCTION 
function filterDate(date) {

  const orgIndexes = [];
  
  weatherObj.weather_data.hourly.time.forEach((hour, index) => {

    if (date.includes(hour)) {
      orgIndexes.push(index);
    }
 })
  
  return orgIndexes;
}