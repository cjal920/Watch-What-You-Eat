var config = {
    apiKey: "AIzaSyDxF1JpYtm5tmGqUsNWIJdFhiPQi7_NFIc",
    authDomain: "projectone-b29b1.firebaseapp.com",
    databaseURL: "https://projectone-b29b1.firebaseio.com",
    projectId: "projectone-b29b1",
    storageBucket: "projectone-b29b1.appspot.com",
    messagingSenderId: "923998700719"
};

firebase.initializeApp(config);

var database = firebase.database();

var dish = "";
var category = "";
var region = "";
var ingredients = "";

function showResults(results) {
    var html = "";
    var entries = results.items;
    $.each(entries, function (index, value) {
        var title = value.snippet.title;
        var video = value.id.videoId;
        $('#recipe-display').append('<h3 class="recipe-p"><strong>' + title + 
        '</strong></h3><iframe width="500" height="400" src="https://www.youtube.com/embed/' 
        + video + '" allowfullscreen>');
    });
}

function getRequest(searchTerm) {
    url = 'https://www.googleapis.com/youtube/v3/search';
    var params = {
        part: 'snippet',
        type: 'video',
        key: 'AIzaSyCK7Boto_Tp17FtiXkXr5GEaKxmrZLxs7o',
        maxResults: 5,
        q: searchTerm
    };
    $.getJSON(url, params, function (searchTerm) {
        showResults(searchTerm);
    });
}


//The function that runs when you submit a search
$("#btn-search").on("click", function(){
    console.log("Hey, is this working?")
    event.preventDefault();
    $("#results-body").empty();
    //Keeps it from submitting to a database
    
    //creates an array and pushes text field inputs into it
    var categoryArray = [];
    if ( $("#dish").val().trim() != "") {
        var categoryN = "search.php?s=" + $("#dish").val().trim();
        categoryArray.push(categoryN);}
        
        if ( $("#category").val().trim() != "") {
            var categoryC = "filter.php?c=" + $("#category").val().trim();
            categoryArray.push(categoryC)}
            
            if ( $("#ingredients").val().trim() != "") {
                var categoryI = "filter.php?i=" + $("#ingredients").val().trim();
                categoryArray.push(categoryI)}
                
                if ( $("#region").val().trim() != "") {
                    var categoryA = "filter.php?a=" + $("#region").val().trim();
                    categoryArray.push(categoryA)}
                    
                    console.log(categoryArray)
                    // setting up an array for filtering
                    var tempArray = [];
                    // Runs multiple GET methods for each query term
                    for (i=0; i<categoryArray.length; i++) {
                        //Sets up the query Url
                        var queryUrl = "https://www.themealdb.com/api/json/v1/1/" + categoryArray[i]
                        console.log(queryUrl)
                        //runs the GET method
                        $.ajax({
                            url: queryUrl,
                            method: "GET"
                        }).then(function(response) {
                            console.log(response.meals);
                            //Runs a for loop for each meal that comes up each time the GET method is run.
                            $.each(response.meals, function(index, value) {
                                //Pushes the meal into the array
                                tempArray.push(value.strMeal)
                                //checks to see how many copies of that meal are in the array
                                // var countNumber = counter(tempArray, value.strMeal)
                                var countNumber = _.filter(tempArray, function(o){return o == value.strMeal}).length
                                console.log(tempArray, countNumber);
                                //If the number of copies of that meal are equal to the number of GET methods run, then it suits all checked categories, and the meal is submitted to the table
                                if (countNumber == categoryArray.length){   
                                    var newRow = $("<tr>").append($("<td>").html($("<button>").text(value.strMeal).attr("data-toggle", "modal").attr("data-target", ".bd-example-modal-lg").attr("id", value.idMeal).addClass("btn-recipe")));
                                    $("#results-body").append(newRow)
                                }
                            });
                        });
                    }
                    
                });
                
                database.ref().on("child_added", function(childSnapshot)    {
                    
                    var dishName = childSnapshot.val().dish;
                    var categoryName = childSnapshot.val().category;
                    var regionName = childSnapshot.val().region;
                    var IDNumber = childSnapshot.val().ID
                    
                    var newRow = $("<tr>").append($("<td>").html($("<button>").text(dishName).attr("data-toggle", "modal").attr("data-target", ".bd-example-modal-lg").attr("id", IDNumber).addClass("btn-recipe")),$("<td>").text(categoryName), $("<td>").text(regionName));
                    
                    $("#saved-recipe-table > tbody").append(newRow);
                    
                }, function(errorObject)    {
                    console.log("Errors handled: " + errorObject.code);
                });
                
                //Handles the creation of a recipe from clicking on a search result.
                $(document).on("click", ".btn-recipe", function(){
                    $("#recipe-display").empty();
                    event.preventDefault();
                    console.log("recipe clicker's working, bruh")
                    //retrieves recipe ID from search result
                    var recipeID = $(this).attr("id");
                    //creates query URL
                    var queryUrl = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + recipeID;
                    //runs ajax
                    $.ajax({
                        url: queryUrl,
                        method: "GET"
                    }).then(function(response) {
                        //creates temp HTML elements
                        var img = $("<img>");
                        var div = $("<div>");
                        $(div).html("<h2>" + response.meals[0].strMeal + "</h2>")
                        var formatter = response.meals[0].strInstructions.split('\r\n');
                        console.log(formatter)
                        for (i = 0; i < formatter.length; i++) {
                            var p = $("<p>");
                            $(p).text(formatter[i]).addClass("recipe-p");
                            console.log(p)
                            $(div).append(p);
                            $(div).append($("<hr>"))}
                            
                            var btn = $("<button>");
                            $(btn).addClass("btn btn-primary save").attr("id", recipeID).text("Save Recipe")
                            
                            
                            
                            $(img).attr("src", response.meals[0].strMealThumb).addClass("img-responsive")
                            var ingArray = [];
                            var meaArray = [];
                            
                            //searches response for ingredients and associated measures, and stores them in arrays
                            Object.keys(response.meals[0]).forEach(function(key) {
                                if (!response.meals[0][key]) {}
                                else if (key.startsWith("strIngre")){
                                    console.log(response.meals[0][key]);
                                    if (response.meals[0][key].length > 0) {
                                        ingArray.push(response.meals[0][key])
                                        console.log(response.meals[0][key])
                                    }}
                                });
                                
                                Object.keys(response.meals[0]).forEach(function(key) {
                                    if (!response.meals[0][key]) {}
                                    else if (key.startsWith("strMeas")){
                                        if (response.meals[0][key].length > 0) {
                                            meaArray.push(response.meals[0][key])
                                        }}
                                    });
                                    //sticks those ingredients and measures into a temporary element
                                    for (var i = 0; i < ingArray.length; i++){
                                        $(div).append("<br><p class='recipe-i'>" + ingArray[i] + ": " + meaArray[i] + "</p>")
                                    }
                                    $("#recipe-display").append(img).append(div).append(btn);
                                    var searchTerm = response.meals[0].strMeal
                                    getRequest(searchTerm)
                                })
                                
                            });
                            
                            $(document).on("click", ".save", function(){
                                
                                event.preventDefault();
                                var recipeID = $(this).attr("id");
                                var queryUrl = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + recipeID;
                                //runs ajax
                                $.ajax({
                                    url: queryUrl,
                                    method: "GET"
                                }).then(function(response) {
                                    pushID = recipeID;
                                    pushMeal = response.meals[0].strMeal;
                                    pushCat = response.meals[0].strCategory;
                                    pushArea = response.meals[0].strArea;
                                    
                                    
                                    var newMeal = {
                                        dish: pushMeal,
                                        ID: pushID,
                                        category: pushCat,
                                        region: pushArea
                                    }
                                    console.log(newMeal)
                                    console.log(database)
                                    database.ref().push(newMeal);
                                    console.log("hey buddy, i think it works")
                                })
                                
                                
                            })
                            
                            
                            
                            