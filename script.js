$(document).ready(function() {

    var savedCities = [];
    var userLocation = "";
    var APIKey = "2c541277b1985e721204cdf16d04a930";

    // Call Functions
    initialize();
    searchClick();


    //pull saved cities from local storage
    function initialize() {
        savedCities = JSON.parse(localStorage.getItem("cities"));
        
        if (savedCities) {
            //get the last city searched and display it
            userLocation = savedCities[savedCities.length - 1];
            getCurrent(userLocation);
            renderButtons();
        } else {
            //if can't geolocate, show default
            if (!navigator.geolocation) {
                getCurrent("Melbourne, AU");
            } else {
                navigator.geolocation.getCurrentPosition(success, error);
            }
        }
    }

    //sets localStorage item to savedCities array 
    function storeCities(location) {
        if (savedCities === null) {
            savedCities = [location];
        }

        localStorage.setItem("cities", JSON.stringify(savedCities));
        renderButtons();
    }

    // successful geolocation
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            userLocation = response.name;
            storeCities(response.name);
            getCurrent(userLocation);
        });
    }
    
    //if can't geolocate and no previous searches, show default
    function error() {
        userLocation = "Melbourne, AU"
        getCurrent(userLocation);
    }

    //render buttons for each element in cities array as a search history for user
    function renderButtons() {
        if (savedCities) {
            $("#searchedCities").empty();
            for (var i = 0; i < savedCities.length; i++) {
                var citiesBtn = $("<button>").attr("class", "listBtn");
                citiesBtn.text(savedCities[i]);
                $("#searchedCities").prepend(citiesBtn);
            }
            cityBtnClick();
        }
    }

    // Call API
    function getCurrent(city) {
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey + "&units=metric";

        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function(response) {
            // fetch icon for Today's Weather
            var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
            $("#todayIcon").attr("src", iconURL);

            // display City name
            $("#cityName").text("Today's Weather in " + response.name + ", " + response.sys.country);

            // display Current Date
            var todayDate = moment(response.dt, "X").format("dddd, DD MMMM YYYY");
            $("#todayDate").attr("class", "text-muted").text("Date: " + todayDate);

            // display Temperature
            $("#todayTemp").text("Temperature: " + response.main.temp +  " °C");

            // display Humidity
            $("#todayHumidity").text("Humidity: " + response.main.humidity + "%");

            // display Wind Speed
            $("#todayWindSpeed").text("Wind Speed: " + response.wind.speed + " m/s");

            // add colour to UV Index
            var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
            $.ajax({
                url: uvIndexURL,
                method: "GET"
            }).then(function (responseUV) {
                var UVI = responseUV.value;
                var bgColour;
                if (UVI <= 3) {
                    bgColour = "green";
                } else if (UVI > 3 && UVI <= 6) {
                    bgColour = "yellow";
                } else if (UVI > 6 && UVI <= 8) {
                    bgColour = "orange";
                } else {
                    bgColour = "red";
                }
                var UVIndex = $("#todayUVIndex").text("UV Index: ");
                UVIndex.append($("<span>").attr("style", ("background-color:" + bgColour)).text(UVI));
            });

            fiveDayFC(response.id);
        });
    }
    
    //get five day forecast from API
    function fiveDayFC(city) {

        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&appid=" + APIKey + "&units=metric";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            // create container for forecast cards
            var forecastRow = $("<div>").attr("class", "row forecast");
            $("#wForecast").append(forecastRow);
    
            // iterate through array response to find the forecasts
            for (var i = 0; i < response.list.length; i++) {
                if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    var cardColumn = $("<div>").attr("class", "weatherCards");
                    forecastRow.append(cardColumn);
    
                    var forecastCard = $("<div>").attr("class", "card");
                    cardColumn.append(forecastCard);
    
                    var cardTitle = $("<p>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("DD MMM YYYY"));
                    var cardImage = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                    var cardText = $("<div>").attr("class", "card-body");
    
                    cardText.append($("<p>").attr("class", "card-text").text("Temperature: " + response.list[i].main.temp + " °C"));
                    cardText.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));

                    forecastCard.append(cardTitle, cardImage, cardText);
                }
            }
        });
    }

    // clears the five day weather forecast
    function clearForecast() {
        $("#wForecast").empty();
    }
    
    // on click function for search history buttons
    function cityBtnClick() {
        $(".listBtn").on("click", function() {
            clearForecast();

            userLocation = $(this).text();
            getCurrent(userLocation);
        });
    }

    function searchClick() {
        $("#searchBtn").on("click", function(e) {
            e.preventDefault();
    
            //get the value from the Search field
            var userInput = $("#searchInput").val().trim();

            if (userInput !== "") {
                clearForecast();
                
                savedCities.push(userInput);
                userLocation = userInput;
                getCurrent(userInput);
                $("#searchInput").val("");
                storeCities();
            }

            if(savedCities.length > 10){
                savedCities.shift();
            }
            storeCities(); 
            renderButtons();
        });
    }

});