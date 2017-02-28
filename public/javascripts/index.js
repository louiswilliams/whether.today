var $currentLocation, $whether;

$(document).ready(function() {
  $currentLocation = $("#location");
  $whether = $("#whether");

  getLocation();
});

function onPosition(position) {
  console.log("Position:", position);
}

function onError(error) {
  console.log("Error:", error);
}

function getLocation() {
  if (navigator.geolocation) {
   	navigator.geolocation.getCurrentPosition(onPosition, onError);
  } else {
    $currentLocation.html("Geolocation not available");
  }
}
