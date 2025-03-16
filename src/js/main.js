let breweriesData = [];
let breweriesPerPage = 10;
let currentIndex = 0;
let map;

document.getElementById("state-selector").addEventListener("change", function (event) {
  const state = event.target.value; //selected state
  if (state) {
    fetchBreweriesByState(state); // fetch the breweries for the selected state 
  }
});

function setMap() {
  map = L.map("map").setView([37.8, -96], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function pinBreweries(breweries) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  breweries.forEach(brewery => {
    if (brewery.latitude && brewery.longitude) {
      const marker = L.marker([brewery.latitude, brewery.longitude]).addTo(map);
      marker.bindPopup(`<strong>${brewery.name}</strong><br>${brewery.city}, ${brewery.state}`);
    }
  });

  if (breweries.length > 0 && breweries[0].latitude && breweries[0].longitude) {
    map.setView([breweries[0].latitude, breweries[0].longitude], 7);
  }
}

/* Test collecting brewery data, add: by_state=california& after ? before per_page */
async function fetchBreweriesByState(state) {
  try {
    const response = await fetch(`https://api.openbrewerydb.org/v1/breweries?by_state=${state}&per_page=200`);
    const breweries = await response.json();
    console.log(breweries); // console log to check data

    currentIndex = 0;
    breweriesData = breweries; // store fetched breweries for pagination

    // Fetch weather data in parallel for all breweries with lat/lon
    const weatherPromises = breweries.map(async (brewery) => {
      if (brewery.latitude && brewery.longitude) {
        return fetchWeatherData(brewery.latitude, brewery.longitude);
      } else {
        return { detailedForecast: "No weather data to display", temperature: "N/A", temperatureUnit: "N/A" };
      }
    });

    // Wait for all weather data to be fetched and attach to breweries
    const weatherResults = await Promise.all(weatherPromises);
    breweries.forEach((brewery, index) => {
      brewery.weather = weatherResults[index];
    });

    // Display first breweries
    displayBreweryAndWeather();

    pinBreweries(breweries)
  } catch (error) {
    console.error("Error fetching breweries:", error);
  }
}

async function fetchWeatherData(latitude, longitude) {
  try {
    // Fetch weather data from Open-Meteo API
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const weatherData = await response.json();
    const temperature = weatherData.hourly.temperature_2m[0];

    return {
      detailedForecast: `The current temperature is ${temperature}°C`,
      temperature: temperature, // Temperature for the first hour (or closest available)
      temperatureUnit: "°C"
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      detailedForecast: "No weather data to display",
      temperature: "N/A",
      temperatureUnit: "N/A"
    };
  }
}

// display the combined brewery and weather data in the application
function displayBreweryAndWeather() {
  const container = document.getElementById("brewery-container");

  if (currentIndex === 0) {
    container.innerHTML = "";
  }

  const slicedBreweries = breweriesData.slice(currentIndex, currentIndex + breweriesPerPage);

  slicedBreweries.forEach(brewery => {
    const breweryElement = document.createElement("div");
    breweryElement.classList.add("brewery");

    // create the content for each brewery and weather info
    const name = document.createElement("h3");
    name.textContent = brewery.name;
    breweryElement.appendChild(name);

    const brewerySite = document.createElement("a");
    brewerySite.textContent = brewery.website_url;
    brewerySite.href = brewery.website_url;
    brewerySite.target = "_blank";
    brewerySite.classList.add("brewery-site");
    breweryElement.appendChild(brewerySite);

    const cityState = document.createElement("p");
    cityState.textContent = `${brewery.city}, ${brewery.state}`;
    breweryElement.appendChild(cityState);

    if (brewery.street) {
      const breweryStreet = document.createElement("p");
      breweryStreet.textContent = brewery.street;
      breweryElement.appendChild(breweryStreet);
    }

    if (brewery.weather) {
      const weather = document.createElement("p");
      weather.textContent = `Weather: ${brewery.weather.detailedForecast}`;
      breweryElement.appendChild(weather);
    }

    container.appendChild(breweryElement);
  });

  // update the index
  currentIndex += breweriesPerPage;

  updateLoadMoreBtn();
}

document.getElementById("load-more-btn").addEventListener("click", displayBreweryAndWeather);

function updateLoadMoreBtn() {
  // control the visibility of "load more" btn
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (currentIndex >= breweriesData.length) {
    loadMoreBtn.style.display = "none"; //hide btn when there are no more breweries to display
  } else {
    loadMoreBtn.style.display = "block"; // show btn when more breweries exist
  }
}


document.addEventListener("DOMContentLoaded", function () {
  setMap();
  updateLoadMoreBtn();
});