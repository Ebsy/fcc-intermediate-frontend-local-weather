var apikey = '17ed1c127b77ec0f2585f9f6c704fc49';

var apicall = 'http://api.openweathermap.org/data/2.5/weather?q=[INPUT]&appid=' + apikey + '&units=metric';
var autoapicall = 'http://api.openweathermap.org/data/2.5/weather' + '?lat=[LAT]&lon=[LON]&appid=' + apikey + '&units=metric';
var url;

var temperature, tempMin, tempMax;
var tempFahr, tempMinFahr, tempMaxFahr;

$(document).ready(function() {
  $('#results').hide();

  if (!apikey) {
    $('.loader').html('<h1>ERROR: No API Key Found. Please see console.</h1>');
    throw new Error('No API Key found. Get one at http://openweathermap.org');
  }

  // Randomize Background Image
  /* var randomNumber = Math.floor(Math.random() * 6) + 1 // output 1 - 6
  var imageString = "bg" + randomNumber + ".jpg"; // bg4.jpg
  $("#background").attr("src", "/images/" + imageString); */

  function getLocation() {
    function showPosition(position) {
      makeCall(position.coords.latitude, position.coords.longitude, null);
    }

    function handleError() {
      $('.loader').html('<h4>Unable to retrieve location automatically.</h4>');
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, handleError, {
        maximumAge: Infinity
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }
  getLocation();

  $('button').click(function() {
    var userInput = $('#data').val();
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
    makeCall(null, null, userInput);
    console.log(url);
  });

  $('.temperature').click(function() {
    var dofahrenheit = false;
    if ($(this).hasClass('fahrenheit')) {
      $(this).removeClass('fahrenheit');
    } else {
      $(this).addClass('fahrenheit');
      dofahrenheit = true;
    }
    $('.temperature').trigger('cssClassChanged', [dofahrenheit]);
  });

  $('.temperature').bind('cssClassChanged', function(event, doFahr) {
    return doFahr ? popTemp(true) : popTemp(false);
  });

});

function popTemp(fahrenheit) {
  var iconClass = fahrenheit ? 'wi-fahrenheit' : 'wi-celsius';
  var uText = fahrenheit ? '°F' : '°C';

  var temp = fahrenheit ? tempFahr : temperature;
  var max = fahrenheit ? tempMaxFahr : tempMax;
  var min = fahrenheit ? tempMinFahr : tempMin;

  $('#results .units i').removeClass();
  $('#results .units i').addClass('wi').addClass(iconClass);

  $('#results .temperature .text').html(temp);
  $('#results .temperature #hilo').html('H: ' + max + uText + ' / L: ' + min + uText);

}

function cel2fahr(celsius) {
  return Math.ceil(celsius * 1.8 + 32);
}

function makeCall(lat, lon, userInput) {
  if (userInput) {
    url = apicall.replace('[INPUT]', encodeURIComponent(userInput));
  } else {
    url = autoapicall.replace('[LAT]', lat).replace('[LON]', lon);
  }

  $.get(url, null)
    .done(function(data) {

      console.log(data);

      // Round up temperature
      temperature = Math.ceil(data.main.temp);
      tempMin = Math.ceil(data.main.temp_min);
      tempMax = Math.ceil(data.main.temp_max);

      // fahrenheit
      tempFahr = cel2fahr(temperature);
      tempMinFahr = cel2fahr(tempMin);
      tempMaxFahr = cel2fahr(tempMax);

      var loc = data.name + ', ' + data.sys.country;
      $('#results .title').html('Weather for <b>' + loc + '</b>');

      var weatherDesc = data.weather[0].main;
      $('#results > .text').html(weatherDesc);

      var windDir = data.wind.deg || '360';

      var windRecip = (windDir < 180) ? windDir + 180 : windDir - 180;
      var windSpeed = data.wind.speed;

      $('#results .windtext').html(windDir + '°<br/>' + windSpeed + ' m/s');

      $('#windicon').removeClass();
      $('#windicon').addClass('wi').addClass('wi-wind')
        .addClass('towards-' + windRecip + '-deg');

      // false is 'celsius'
      popTemp(false);

      // Must be a cleaner way to do this?
      $('#weathericon').removeClass();
      $('#weathericon').addClass('wi').addClass('text-primary');
      $('#weathericon').addClass(translateIcon(weatherDesc));
      $('#weathericon').addClass('wi-fw');

      $('.loader').fadeOut('fast', function() {
        $('#manualInput').fadeIn();
        $('#results').fadeIn();
      });
    });
}

function translateIcon(input) {
  console.log('input is ' + input);
  switch (input.toLowerCase()) {
    case 'clear':
      return 'wi-day-sunny';
    case 'clouds':
      return 'wi-cloud';
    case 'few clouds':
      return 'wi-cloud';
    case 'scattered clouds':
      return 'wi-cloud';
    case 'broken clouds':
      return 'wi-cloud';
    case 'shower rain':
      return 'wi-showers';
    case 'rain':
      return 'wi-rain';
    case 'thunderstorm':
      return 'wi-thunderstorm';
    case 'snow':
      return 'wi-snow';
    case 'mist':
    case 'fog':
      return 'wi-dust';
    default:
      break;
  }
}
