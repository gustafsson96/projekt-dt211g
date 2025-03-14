/* Fetch data from brewery API */

/* Fetch data from state API */

/* Function to handle state clicks */

/* Function to display/update side panel with information */

/* Function to handle hover effect on states, add/remove highlight class */

/*
Attach functions to map elements by eventlisteners
click --> handle state click
mouseover --> handleMouseOver (add class)
mouseout --> handleMouseOut (remove class)
*/

/* test function to style svg path elements */

/**
 * Style the SVG map by applying a default fill color to all paths.
 * This function listens for the 'load' event on the SVG object, ensuring the SVG is 
 * fully loaded before applying a fill color to each path element.
 */
function styleSvgMap() {
  const svgObject = document.getElementById('us-map');

  // Ensure the SVG map is loaded before styling is added
  svgObject.onload = () => {
    const svgDoc = svgObject.contentDocument;
    const paths = svgDoc.querySelectorAll('path');

    // Apply a fill color to each path in the SVG
    paths.forEach(path => {
      path.style.fill = '#72977a';
    });
  };
}

styleSvgMap();

document.getElementById("state-selector").addEventListener("change", function (event) {
  const state = event.target.value; //selected state
  if (state) {
    fetchBreweriesByState(state); // fetch the breweries for the selected state 
  }
});

/* Test collecting brewery data, add: by_state=california& after ? before per_page */
async function fetchBreweriesByState(state) {
  try {
    const response = await fetch(`https://api.openbrewerydb.org/v1/breweries?by_state=${state}&per_page=15`);
    const breweries = await response.json();
    console.log(breweries); // console log to check data

    // Fetch weather data in parallel for all breweries with lat/lon
    const weatherPromises = breweries.map(async (brewery) => {
      if (brewery.latitude && brewery.longitude) {
        return fetchWeatherData(brewery.latitude, brewery.longitude);
      } else {
        return { detailedForecast: "No weather data to display", temperature: "N/A", temperatureUnit: "N/A" };
      }
    });

    // Wait for all weather data to be fetched
    const weatherResults = await Promise.all(weatherPromises);

    // Attach weather data to breweries
    breweries.forEach((brewery, index) => {
      brewery.weather = weatherResults[index];
    });

    // Display breweries with weather
    displayBreweryAndWeather(breweries);
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
    const temperature = weatherData.hourly.temperature_2m[0]; // Get the first temperature reading (current or next hour)

    return {
      detailedForecast: `The current temperature is ${temperature}°C`, // You can add more details if you like
      temperature: temperature, // Temperature for the first hour (or closest available)
      temperatureUnit: "°C" // Celsius, as the Open-Meteo API provides data in Celsius by default
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
function displayBreweryAndWeather(breweries) {
  const container = document.getElementById("brewery-container");
  container.innerHTML = ""; // Clear previous content

  breweries.forEach(brewery => {
    const breweryElement = document.createElement("div");
    breweryElement.classList.add("brewery");

    // create the content for each brewery and weather info
    const name = document.createElement("h3");
    name.textContent = brewery.name;
    breweryElement.appendChild(name);

    const cityState = document.createElement("p");
    cityState.textContent = `${brewery.city}, ${brewery.state}`;
    breweryElement.appendChild(cityState);

    const brewerySite = document.createElement("p");
    cityState.textContent = `${brewery.website_url}`;
    breweryElement.appendChild(brewerySite);

    const weather = document.createElement("p");
    weather.textContent = `Weather: ${brewery.weather.detailedForecast}`;
    breweryElement.appendChild(weather);

    const temperature = document.createElement("p");
    temperature.textContent = `Temperature: ${brewery.weather.temperature} ${brewery.weather.temperatureUnit}`;
    breweryElement.appendChild(temperature);

    container.appendChild(breweryElement);
  });
}

