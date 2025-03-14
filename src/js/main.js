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