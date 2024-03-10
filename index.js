// Declare global variables
let map;
let infoWindow;
let radiusCircle;
let rating = 0;
let userLocation;
const markers = []; // Array to store markers

// DOM element references
const citySelector = document.getElementById("citySelector");
const categorySelector = document.getElementById("categorySelector");
const areaSelector = document.getElementById("areaSelector");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");
const searchByName = document.getElementById("searchByName");
const suggestions = document.getElementById("suggestions");
const starRarting = document.getElementById("starRarting");
const priceSlider = document.getElementById("priceSlider");
const radiusSlider = document.getElementById("radiusSlider");
const radiusOutput = document.getElementById("radiusOutput");
const priceOutput = document.getElementById("priceOutput");
const openAtWeekendsCheckbox = document.getElementById("isOpenInWeekends");

// Function to handle autocomplete search
const autoCompleteSearch = (event) => {
  suggestions.innerHTML = ``;
  const inputValue = event.target.value;
  if (inputValue.length) {
    const matchingValues = attractions.filter((value) =>
      value.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    matchingValues.forEach((value) => {
      suggestions.innerHTML = suggestions.innerHTML + `<li>${value.name}</li>`;
    });
  }
};

// Function to handle selection from autocomplete suggestions
const onAutoCompleteSelect = (event) => {
  if (event.target.tagName === "LI") {
    searchByName.value = event.target.textContent;
    suggestions.innerHTML = ``;
  }
};

// Function to handle radius change
const onRadiusChange = (event) => {
  if (event.target.value) {
    radiusCircle.setRadius(+event.target.value * 1000);
  }
};

// Function to populate selector elements
const populateSelector = (element, object) => {
  Object.values(object).forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.innerHTML = item;
    element.appendChild(option);
  });
};

// Function to generate content string for info window
const generateContentString = ({
  name,
  description,
  location,
  phone,
  image,
  website,
  category,
  rating,
  price,
  openAtWeekend,
}) => {
  const contentString =
    '<div id="content">' +
    `<h1 style="text-align:center;" >${name}</h1>` +
    '<div style="display:flex;justify-content:center;"  id="Image content">' +
    `<img src=${image}>` +
    "</div>" +
    '<div style="padding:10px;" id="bodyContent">' +
    "<p>" +
    "<b>" +
    "Description - " +
    "</b>" +
    `${description}` +
    "</p>" +
    "<p>" +
    "<b>" +
    "Location - " +
    "</b>" +
    `${location}` +
    "</p>" +
    "<p>" +
    "<b>" +
    "Phone Number - " +
    "</b>" +
    `${phone}` +
    "</p>" +
    "<p>" +
    "<b>" +
    "Rating - " +
    "</b>" +
    "People who visited this attraction gave it a rating of " +
    `${rating}` +
    " stars out of 5" +
    "</p>" +
    "<p>" +
    "<b>" +
    "Category - " +
    "</b>" +
    `${category}` +
    "</p>" +
    "<p>" +
    "<b>" +
    "Regular Price - " +
    "</b>" +
    `${price}` +
    "₪" +
    "</p>" +
    "<p>" +
    "<b>" +
    "Open On Weekends - " +
    "</b>" +
    `${openAtWeekend}` +
    "</p>" +
    "<p>" +
    "<b>" +
    "Website Link - " +
    "</b>" +
    `<a href=${website}>Click here to check the attraction website</a>` +
    "</div>" +
    "</div>";
  return contentString;
};

// Function to clear markers from the map
const clearMarkers = () => {
  markers.forEach((marker) => {
    marker.setMap(null);
  });
};

// Function to clear all filters
const clearFilters = () => {
  // Clear all input values and selections
  citySelector.value = "";
  categorySelector.value = "";
  areaSelector.value = "";
  searchByName.value = "";
  suggestions.innerHTML = "";
  openAtWeekendsCheckbox.checked = false;
  radiusOutput.value = "Max Radius From Your Home";
  priceOutput.value = "Max Price";
  priceSlider.value = 0;
  radiusSlider.value = 0;
  rating = 0;
  // Clear radius circle
  radiusCircle.setRadius(null);
  // Remove checked star class from all star elements
  Object.values(starRarting.children).forEach((star, i) => {
    star.classList.remove("checkedStar");
  });
  // Retrieve attractions based on cleared filters
  getAttractions();
};

// Function to check if attraction falls within valid radius
const isValidRadius = ({ lat, lng }) => {
  const radius = +radiusSlider.value / 100;
  if (!userLocation || !radius) return true;

  const latDistance = Math.pow(lat - userLocation.lat, 2);
  const lngDistance = Math.pow(lng - userLocation.lng, 2);
  const distance = Math.sqrt(latDistance + lngDistance);

  return distance <= radius;
};

// Function to get attractions based on applied filters
const getAttractions = () => {
  clearMarkers(); // Clear existing markers

  // Get filter values
  const location = citySelector.value;
  const area = areaSelector.value;
  const attractionsName = searchByName.value;
  const price = priceSlider.value;
  const category = categorySelector.value;
  const isOpenAtweekends = openAtWeekendsCheckbox.checked;

  // Filter attractions based on applied filters
  attractions.forEach((attraction) => {
    const isNotValidAttraction =
      !isValidRadius(attraction.position) ||
      (+price && price < attraction.price) ||
      (isOpenAtweekends && !attraction.openAtWeekend) ||
      (rating && rating > attraction.rating) ||
      (category && category !== attraction.category) ||
      (location && location !== attraction.location) ||
      (area && area !== attraction.area) ||
      (attractionsName && attractionsName !== attraction.name);
    if (isNotValidAttraction) return;

    // Create marker for valid attractions
    const marker = new google.maps.Marker({
      map,
      position: attraction.position,
      title: attraction.name,
      icon: {
        url: attraction.icon,
        scaledSize: new google.maps.Size(25, 25),
      },
    });
    markers.push(marker); // Push marker to markers array

    // Add click event listener to marker to display info window
    marker.addListener("click", () => {
      infoWindow.setContent(generateContentString(attraction));
      infoWindow.open({
        map,
        anchor: marker,
      });
    });
  });
};

// Function to initialize the map
const initMap = () => {
  const israelLocation = { lat: 31.5, lng: 35.32813184265719 }; // Default location for map center

  // Get map element
  const mapElement = document.getElementById("map");

  // Initialize Google Map
  map = new google.maps.Map(mapElement, {
    zoom: 8,
    center: israelLocation, // Set default center
  });

  // Initialize info window
  infoWindow = new google.maps.InfoWindow();

  // Initialize radius circle
  radiusCircle = new google.maps.Circle({
    map: map,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    strokeColor: "#FF0000",
    fillOpacity: 0.35,
    radius: 0,
  });

  // Get attractions based on applied filters
  getAttractions();
};

// Event listeners

// Add event listener to star rating elements
Object.values(starRarting.children).forEach((star, i) => {
  const handleOnClick = () => {
    rating = i + 1;

    // Add checked star class to stars up to the clicked star
    // and remove checked star class from stars after the clicked star
    Object.values(starRarting.children).forEach((star, i) => {
      if (rating >= i + 1) {
        star.classList.add("checkedStar");
      } else {
        star.classList.remove("checkedStar");
      }
    });
  };
  star.addEventListener("click", handleOnClick);
});

// Get user's current location and update radius circle center
window.navigator.geolocation.getCurrentPosition((response) => {
  const { latitude, longitude } = response.coords;
  userLocation = { lat: latitude, lng: longitude };
  radiusCircle.setCenter(userLocation);
});

// Populate selector elements with initial options
populateSelector(citySelector, cities);
populateSelector(categorySelector, categories);
populateSelector(areaSelector, areas);

// Event listeners for search and clear buttons, radius change, autocomplete search, and selection
searchButton.addEventListener("click", getAttractions);
clearButton.addEventListener("click", clearFilters);
radiusSlider.addEventListener("click", onRadiusChange);
searchByName.addEventListener("input", autoCompleteSearch);
suggestions.addEventListener("click", onAutoCompleteSelect);

// Function to initialize the map for Google Maps API callback
window.initMap = initMap;
