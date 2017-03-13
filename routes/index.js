var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var router = express.Router();

var conf = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'conf.json'), 'utf8'));

function clothesFromTemp(fahrenheit) {
  var result = "";
  if (fahrenheit > 67) {
    result += "a T-shirt";
  } else if (fahrenheit > 52) {
    result += "a light jacket/sweater";
  } else if (fahrenheit > 42) {
    result += "a jacket/light coat";
  } else if (fahrenheit > 30) {
    result += "a heavy jacket/coat"; 
  } else {
    result += "a heavy coat";
  }      
  return result;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'What should you wear?' });
});

/* Get info for location */
router.post('/api/getinfo', function(req, res) {
  var latitude, longitude, cityId;
  if (req.body.cityId) {
    cityId = parseInt(req.body.cityId);
  } else {
    latitude = parseFloat(req.body.latitude);
    longitude = parseFloat(req.body.longitude);
  }

  var path = "/data/2.5/weather?APPID=" + conf.weatherApiKey;
  if (isFinite(cityId)) {
    path = path + "&id=" + cityId;
  } else if (isFinite(latitude) && isFinite(longitude)) {
    path = path + "&lat=" + latitude + "&lon=" + longitude;
  } else {
    return res.status(400).send({ message: "(latitude and longitude) or (cityId) fields are required" });
  }

  http.get({
    host: "api.openweathermap.org",
    path: path,
  }, function (apiRes) {
    var data = '';
    apiRes.on('data', function (chunk) {
      data += chunk;
    });
    apiRes.on('end', function() {

      data = JSON.parse(data);
      console.log(data);
      var fahrenheit = (9/5 * data.main.temp) - 459.67;
      var windSpeed  = data.wind.speed * 2.23694;

      var feelsLike = fahrenheit;
      if (fahrenheit < 50 && windSpeed > 3) {
        feelsLike = 35.74
                  + (0.6215*fahrenheit)
                  - (35.75 * Math.pow(windSpeed, 0.16))
                  + (0.4275 * fahrenheit * Math.pow(windSpeed, 0.16));
      }
 
      var result =  "";
      var weatherCode = data.weather[0].id;
      var group = Math.floor(weatherCode/100);

      
      if (weatherCode == 800) { // Clear skies
        result = "Clear skies. Wear " + clothesFromTemp(feelsLike) + ".";

     } else if (weatherCode >= 200 && weatherCode < 600) { // Rain
        result = "It's raining. Wear "
               + clothesFromTemp(feelsLike)
               + " with an umbrella/raincoat."; 
      } else if (weatherCode >= 600 && weatherCode < 700) { // Snow
        result = "It's snowing. Wear "
               + clothesFromTemp(feelsLike) 
               + " with boots. Consider a raincoat.";
      } else if (weatherCode > 800 && weatherCode < 900) { // Clouds
        result = "It's cloudy. Wear " + clothesFromTemp(feelsLike) + ".";
      }

     var sendBack = {
        temp: fahrenheit,
        windSpeed: windSpeed,
        feelsLike: feelsLike,
        location: data.name + ", " + data.sys.country,
        cityId: data.id,
        description: data.weather[0].description,
        result: result
      }
      res.send(sendBack);
    });
    apiRes.on('error', function(err){ 
      console.log(err);
      res.status(500).send({error: err});
    });
  });



});


module.exports = router;
