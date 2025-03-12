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

/* Leaflet TEST */

document.addEventListener("DOMContentLoaded", () => {
    // Create a map centered on the US
    const map = L.map('map', {
        center: [37.8, -96],
        zoom: 3,
        maxBounds: [
            [24.396308, -125.0], // Southwest corner (bottom-left)
            [49.384358, -66.93457] // Northeast corner (top-right)
        ],
        maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
});