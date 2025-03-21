let breweriesData = []; // Empty array to store fetched breweries
let breweriesPerPage = 10; // Number of breweries displayed initially and on "load more"
let currentIndex = 0; // Index for pagination
let map; // Leaflet map

document.getElementById("state-selector").addEventListener("change", function (event) {
  const state = event.target.value; // State selected by user
  if (state) {
    fetchBreweriesByState(state); // Call function to fetch breweries for the selected state 
  }
});

/**
 * Add Leaflet map and set default view to the US
 */
function setMap() {
  map = L.map("map").setView([37.8, -96], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

/**
 * Add markers for selected breweries on the map.
 * Add popup on pin click with brewery name, city and state.
 * @param {Array<Object>} breweries - An array of brewery objects including latitude and longitude values
 */
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

  // Adjust map view to first brewery in the list
  if (breweries.length > 0 && breweries[0].latitude && breweries[0].longitude) {
    map.setView([breweries[0].latitude, breweries[0].longitude], 7);
  }
}

/**
 * Fetches breweries by selected state and stores them in an array for pagination.
 * @param {string} state - The state to fetch breweries from.
 */
async function fetchBreweriesByState(state) {
  try {
    const response = await fetch(`https://api.openbrewerydb.org/v1/breweries?by_state=${state}&per_page=150`);
    const breweries = await response.json();

    currentIndex = 0; // Reset pagination
    breweriesData = breweries; // Store fetched breweries for pagination

    // Parallel fetch weather data for breweries with lat/lon values or return message
    const weatherPromises = breweries.map(async (brewery) => {
      if (brewery.latitude && brewery.longitude) {
        return fetchWeatherData(brewery.latitude, brewery.longitude);
      } else {
        return { detailedForecast: "No weather data to display", temperature: "N/A", temperatureUnit: "N/A" };
      }
    });

    // Wait for all weather data to be fetched and attach to corresponding brewery
    const weatherResults = await Promise.all(weatherPromises);
    breweries.forEach((brewery, index) => {
      brewery.weather = weatherResults[index];
    });

    // Pin all breweries on the map
    pinBreweries(breweries)

    // Display first set of breweries to the screen
    displayBreweryAndWeather();
  } catch (error) {
    console.error("Error fetching breweries:", error);
  }
}

/**
 * Fetches weather data from Open-Meteo API based on brewery coordinates.
 * @param {number} latitude - The latitude of the brewery.
 * @param {number} longitude - The longitude of the brewery.
 * @returns A promise of weather details.
 */
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

/**
 * Creates elements to display the breweries and corresponding
 * weather data to the screen. 
 */
function displayBreweryAndWeather() {
  const container = document.getElementById("brewery-container"); // Get container for brewery info

  // Clear previous data on first brewery load
  if (currentIndex === 0) {
    container.innerHTML = "";
  }

  // Get a limited number of breweries (10, based on variable breweriesPerPage)
  const slicedBreweries = breweriesData.slice(currentIndex, currentIndex + breweriesPerPage);

  // Create elements and styles for each brewery to display to screen
  slicedBreweries.forEach(brewery => {
    const breweryElement = document.createElement("div");
    breweryElement.classList.add("brewery");

    const name = document.createElement("h3");
    name.textContent = brewery.name;
    breweryElement.appendChild(name);

    if (brewery.website_url) {
      const brewerySite = document.createElement("a");
      brewerySite.textContent = brewery.website_url;
      brewerySite.href = brewery.website_url;
      brewerySite.target = "_blank";
      brewerySite.classList.add("brewery-site");
      breweryElement.appendChild(brewerySite);
    } else {
      const brewerySite = document.createElement("p");
      brewerySite.textContent = "No website at the moment";
      brewerySite.style.fontStyle = "italic";
      breweryElement.appendChild(brewerySite);
    }

    const cityState = document.createElement("p");
    cityState.textContent = `${brewery.city}, ${brewery.state}`;
    breweryElement.appendChild(cityState);

    if (brewery.street) {
      const breweryStreet = document.createElement("p");
      breweryStreet.textContent = brewery.street;
      breweryElement.appendChild(breweryStreet);
    } else {
      const breweryStreet = document.createElement("p");
      breweryStreet.textContent = "No street name to display";
      breweryStreet.style.fontStyle = "italic";
      breweryElement.appendChild(breweryStreet);
    }

    if (brewery.weather) {
      const weather = document.createElement("p");
      weather.textContent = `${brewery.weather.detailedForecast} at ${brewery.name}`;
      weather.classList.add("weather");
      breweryElement.appendChild(weather);
    }

    container.appendChild(breweryElement);
  });

  // Update pagination index
  currentIndex += breweriesPerPage;

  updateLoadMoreBtn();
}

// Add click event to "Load More" button
document.getElementById("load-more-btn").addEventListener("click", displayBreweryAndWeather);

/**
 * Updates the visibility of the "Load More" button based on if more breweries exists or not.
 */
function updateLoadMoreBtn() {
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (currentIndex >= breweriesData.length) {
    loadMoreBtn.style.display = "none"; // Hide btn when there are no more breweries to display
  } else {
    loadMoreBtn.style.display = "block"; // Show btn when more breweries exist
  }
}


document.addEventListener("DOMContentLoaded", function () {
  setMap();
  updateLoadMoreBtn();
});