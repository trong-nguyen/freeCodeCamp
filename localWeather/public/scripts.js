$(document).ready(function() {
  var model = {
    temperature: 32,
    unit: "US",
    place: "undefined"
  };

  var weatherIcons = {
    "clear-day": "day-sunny", 
    "clear-night": "night-clear",
    "rain": "rain", 
    "snow": "snow",
    "sleet": "sleet",
    "wind": "windy", 
    "fog": "fog", 
    "cloudy": "cloudy", 
    "partly-cloudy-day": "day-cloudy-high",
    "partly-cloudy-night": "night-partly-cloudy"
  };

  var geocoder = new google.maps.Geocoder;

  function updateUnit() {
    var t;
    if(model.unit === "US") {
      t = String(model.temperature.toPrecision(2)) + "°F";
      $("#switch-unit").text("(°C)");
    } else {
      t = String(((model.temperature - 32) * 5 / 9).toPrecision(2)) + "°C";
      $("#switch-unit").text("(°F)");
    }
    $("#weather-temp").html(t);
  }

  $("#switch-unit").on("click", function() {
    if(model.unit === "US") {
      model.unit = "SI";
    } else {
      model.unit = "US";
    }
    updateUnit();
  });

  function getWeatherIcon(desc) {
    return "wi wi-" + weatherIcons[desc];
  }


  function getRandomLatLng() {
    return new Promise(function (resolve, reject) {
      // var lat_bound = [20, 64];
      // var lng_bound = [-161, -68];

      var lat_bound = [62-10, 62+10];
      var lng_bound = [-119-10, -119+10];
      resolve({
        lat: Math.random() * (lat_bound[1] - lat_bound[0]) + lat_bound[0],
        lng: Math.random() * (lng_bound[1] - lng_bound[0]) + lng_bound[0]
      });
    });
  }

  function getCurrentLatLng() {
    return new Promise(function (resolve, reject) {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          resolve(latlng);
        });
      } else {
        reject(Error("Location service not available"));
      }
    });
  }

  function getPlace(latlng) {
    function extractRoughLocation (results) {
      if (results.length !== 0) {
        if (results[0]) {
          var prefectures = results[0].address_components.filter(function (x) {
            return x.types[0] === 'administrative_area_level_2';
          });
          if (prefectures.length !== 0) {
            return prefectures[0].long_name;
          } else {
            return results[0].formatted_address;
          }
        }
      }
      
      return 'Unknown location (Probably exotic) latlng: ' + String(latlng) ;
    }

    return new Promise(function (resolve, reject) {
      geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
          resolve({
            place: extractRoughLocation(results)
          });
        } else {
          reject(Error('Geocoder failed due to ' + status));
        }
      });
    });
  }

  function getWeather(latlng) {
    return new Promise(function (resolve, reject) {
      var API_KEY = "3f9bbfee1603c55e88252473c5548f1c";
      var cors = "https://crossorigin.me/";
      var lat = latlng.lat;
      var lng = latlng.lng;
      var url = cors + "https://api.darksky.net/forecast/" + API_KEY + "/" + lat + "," + lng;
      $.getJSON(url, function(data){
        var current = data.currently;

        resolve({
          temperature: current.temperature,
          unit: 'US',
          summary: current.summary,
          icon: current.icon
        });
      });
    });
  }

  function updateDisplay(model) {
    $("#weather-icon").addClass(getWeatherIcon(model.icon));
    $("#weather-summary").text(model.summary);
    $("#weather-location").text(model.place);
    updateUnit();
  }

  function updateModel(values) {
    values.forEach(function (value) {
      $.extend(model, value);
    });

    return model;
  }

  // getRandomLatLng()
  getCurrentLatLng()
    .then(function(res) {
      return Promise.all([
        getPlace(res),
        getWeather(res)
        ]);
    })
    .then(function(res) {
      var model = updateModel(res);
      updateDisplay(model);
    })
    .catch(function(error) {
      console.log(error);
    });
});