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

// function to fetch weather data for a given latitude and longitude from Weather.gov API
async function fetchWeatherData(latitude, longitude) {
  try {
    // Fetch weather data using brewery latitude and longitude
    const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`, {
      headers: {
        "User-Agent": "StateSips (jugu2402@student.miun.se)"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const pointData = await response.json();
    const forecastUrl = pointData.properties.forecast;

    // Fetch the actual weather
    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        "User-Agent": "StateSips (jugu2402@student.miun.se)"
      }
    });

    if (!forecastResponse.ok) {
      throw new Error(`HTTP error! Status: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Get today's weather (first period)
    const forecast = forecastData.properties.periods[0];

    return {
      detailedForecast: forecast.detailedForecast, // Detailed forecast text
      temperature: forecast.temperature, // Temperature for the day
      temperatureUnit: forecast.temperatureUnit // Temperature unit in °F or °C
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      detailedForecast: "No weather data to display",
      temperature: "N/A",
      temperatureUnit: "N/A"
    }; // Return fallback message if there's an error
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

    const weather = document.createElement("p");
    weather.textContent = `Weather: ${brewery.weather.detailedForecast}`;
    breweryElement.appendChild(weather);

    const temperature = document.createElement("p");
    temperature.textContent = `Temperature: ${brewery.weather.temperature} ${brewery.weather.temperatureUnit}`;
    breweryElement.appendChild(temperature);

    container.appendChild(breweryElement);
  });
}

