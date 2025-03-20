# State Sips

Link to the live site can be found here: **[State Sips](https://projectdt211g.netlify.app)**

## Description
State Sips is a project created as an interactive webb application that allows users to explore breweries across the United States. The app collects data from two different APIs to display relevant brewery information.

Users can select a state from a dropdown list to display the breweries available in that state. The breweries will show up both pinned on a map and as individual cards with information about name, state, city, street, link to website and current weather information (temperature in Celsius).

## API Mashup

* **[Open Brewery DB API:](openbrewerydb)** Fetches necessary brewery details.
* **[Open-Meteo API:](https://open-meteo.com)** Fetches weather data for a specific brewery location using its latitude and longitude.

## Tools Used

* HTML for structure.
* SCSS for styling.
* JavaScript to create all main functionality and API mashup.
* Leaflet to render a map and pin breweries. 

## Deployment
The application has been deployed to the web using **[Netlify](https://www.netlify.com)**. It is updated automatically when changes/updates are pushed to the main branch.