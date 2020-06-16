$(document).ready(function() {

    var savedCities = [];
    var userLocation;
    var APIKey = "2c541277b1985e721204cdf16d04a930";

    //pull saved cities from local storage
    function initialize(){
        var savedCities = JSON.parse(localStorage.getItem("cities"));

        //display buttons for previous searches
        if (savedCities) {
            //get the last city searched so we can display it
            userLocation = savedCities[savedCities.length - 1];
            showPrevious();
            getCurrentCity(L);
        }
        else {
            //try to geolocate, otherwise set city to melbourne
            if (!navigator.geolocation) {
                //can't geolocate and no previous searches, show default
                getCurrentCity("Melbourne");
            }
            else {
                // navigator.geolocation.getCurrentCity(success, error);
            }
        }
    }

    // function success(position) {
    //     var lat = position.coords.latitude;
    //     var lon = position.coords.longitude;
    //     var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
    //     $.ajax({
    //         url: queryURL,
    //         method: "GET"
    //     }).then(function (response) {
    //         userLocation = response.name;
    //         saveLoc(response.name);
    //         getCurrentCity(userLocation);
    //     });
    // }
    
    // function error(){
    //     //can't geolocate and no previous searches, so just give them one
    //     userLocation = "Melbourne"
    //     getCurrentCity(userLocation);
    // }

    //render buttons for each element in cities array as a search history for user
    function showPrevious() {
        //show the previously searched for locations based on what is in local storage
        if (savedCities) {
            $("#searchedCities").empty();
            
            for (var i = 0; i < savedCities.length; i++) {
                var citiesBtn = $("<button>").attr("class", "citiesList");
                citiesBtn.text(savedCities[i]);
                // if (savedCities[i] == L){
                //     locBtn.attr("class", "list-group-item list-group-item-action active");
                // }
                // else {
                //     locBtn.attr("class", "list-group-item list-group-item-action");
                // }
                citiesBtn.prepend(locBtn);
            }
            $("#searchedCities").append(citiesBtn);
        }
    }

    function getCurrentCity(city) {
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;

        $.ajax({
            url: queryURL,
            method: "GET",
            // error: function() {
            //     savedCities.splice(savedCities.indexOf(city), 1);
            //     localStorage.setItem("cities", JSON.stringify(savedCities));
            //     initialize();
            // }

        }).then(function(response) {

            // get icon for weather conditions
            var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
            $("#todayIcon").attr("src", iconURL);

            // display city name
            $("#cityName").text("Today's Weather in " + (response.name));

            // display last updated
            var lastUpdated = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
            $("#dateUpdated").attr("class", "text-muted").text("Last updated: " + lastUpdated);

            //display Temperature
            $("#todayTemp").text("Temperature: " + response.main.temp + " &#8457;");

            //display Humidity
            $("#todayHumidity").text("Humidity: " + response.main.humidity + "%");

            //display Wind Speed
            $("#todayWindSpeed").text("Wind Speed: " + response.wind.speed + " MPH");

            //coloured UV Index
            var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
            $.ajax({
                url: uvIndexURL,
                method: "GET"
            }).then(function (responseUV) {
                var UVI = responseUV.value;
                var bgColour;
                if (UVI <= 3) {
                    bgColour = "green";
                } else if (UVI >= 3 || UVI <= 6) {
                    bgColour = "yellow";
                } else if (UVI >= 6 || UVI <= 8) {
                    bgColour = "orange";
                } else {
                    bgColour = "red";
                }
                var UVIndex = $("#todayUVIndex").text("UV Index: ");
                UVIndex.append($("<span>").attr("style", ("background-color:" + bgColour)).text(UVI));
                cardBody.append(UVIndex);
            });

            fiveDayFC(response.id);
        });
    }
    
    //get five day forecast
    function fiveDayFC(city) {

        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&appid=" + APIKey + "&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {

            // create container for forecast cards
            var forecastRow = $("<div>").attr("class", "row forecast");
            $("#wForecast").append(forecastRow);
    
            // iterate through array response to find the forecasts for 15:00
            for (var i = 0; i < response.list.length; i++) {
                if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    var cardColumn = $("<div>").attr("class", "weatherCards");
                    forecastRow.append(cardColumn);
    
                    var forecastCard = $("<div>").attr("class", "card");
                    cardColumn.append(forecastCard);
    
                    var cardTitle = $("<p>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                    var cardImage = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                    var cardText = $("<div>").attr("class", "card-body");
    
                    cardText.append($("<p>").attr("class", "card-text").text("Temp: " + response.list[i].main.temp + "&#8457;"));
                    cardText.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));

                    forecastCard.append(cardTitle, cardImage, cardText);
                }
            }
        });
    }

    function clearForecast() {
        // clears the five day weather forecast
        $("#wForecast").empty();
    }
    
    function saveLoc(loc){
        //add this to the saved locations array
        if (savedCities === null) {
            savedCities = [loc];
        }
        else if (savedCities.indexOf(loc) === -1) {
            savedCities.push(loc);
        }
        //save the new array to localstorage
        localStorage.setItem("cities", JSON.stringify(savedCities));
        showPrevious();
    }
    
    $("#searchBtn").on("click", function (e) {
        e.preventDefault();

        //get the value from the Search field
        var userInput = $("#searchInput").val().trim();

        //if userInput is not empty
        if (userInput !== "") {
            //clear the previous forecast
            clearForecast();

            userLocation = userInput;
            // saveloc(userInput);

            //clear the search field value
            $("#searchInput").val("");
            //get the new forecast
            getCurrentCity(userInput);
        }
    });
    
    $(document).on("click", ".citiesList", function () {
        clearForecast();
        userLocation = $(this).text();
        showPrevious();
        getCurrentCity(userLocation);
    });
    
    initialize();
});