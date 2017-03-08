var $location, $weather, $forecast;

var storageAvailable = false;
if (typeof(Storage) !== "undefined") {
  storageAvailable = true;
}

$(document).ready(function() {
  $location = $("#location");
  $weather = $("#weather");
  $forecast = $("#forecast");

  $location.html("Getting location...");

  var cityId = sessionStorage.getItem("cityId");
  if (storageAvailable && cityId) {
    console.log("Session data available");
    onPosition({
      cityId: cityId
    });
  } else {
    getLocation();
  }
});

function onPosition(position) {
  console.log("Position:", position);

  $location.html("Getting weather information...");
  // $location.html("(" + position.coords.latitude + ", " + position.coords.longitude + ")");

  var postObj = {};
  if (position.cityId) {
    postObj.cityId = position.cityId
  } else if (position.coords) {
    postObj.latitude = position.coords.latitude;
    postObj.longitude = position.coords.longitude;
  }

  $.post("api/getinfo", postObj, function (data) {
    if (data.error) {
      $weather.html("Error getting weather info: ", JSON.stringify(data.error));
    } else {
      console.log("result", data);
      $forecast.html(data.result);

      $weather.html("It's " + data.temp.toFixed(1) + " &deg;F, " + data.description +  ", " + data.windSpeed.toFixed(1) + " MPH winds.");
      $location.html(data.location);

    if (storageAvailable) {
      sessionStorage.setItem("cityId", data.cityId);
    }
      
    }
  });
}

function onError(error) {
  console.log("Error:", error);
  $location.html("Error getting location: " + error.message);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onPosition, onError);
  } else {
    $location.html("Geolocation not available");
  }
}
