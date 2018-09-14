


  $(document).ready(function () {

    //on click event to redirect scrape button 
    $("#scrape").on("click", function () {
        console.log("scrape clicked");
        $.ajax({
            method: "GET",
            url: "/scrape"
        }).done(function (data) {
           window.location = "/"
        });
    });
    
    //save story button 
    $("#saveStory").on("click", function() {
        var thisId = $(this).attr("data");
        $.ajax({
            method: "POST",
            url: "/stories/save/" + thisId
        }).done(function(data) {
           window.location = "/"
        });
    });
    
    
    
    
    
    })