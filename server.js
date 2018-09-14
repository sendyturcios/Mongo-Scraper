var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

//require the router 
var htmlRoutes = require("./routes/htmlRoutes")
var apiRoutes = require("./routes/apiRoutes")

//require models 
var db = require("./models"); 

var PORT = 3000;

//require mongoose
var mongoose = require("mongoose");

//set port 
var port = process.env.PORT || 3000;

// serve static html css and js
app.use(express.static("public"));

//to use the htmlRoutes we're requiring above 
app.use(htmlRoutes);

//route = /api/posts because it's concatinating the route on apiRoutes 
app.use("/api", apiRoutes);

//hbs routes 
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

//if deployed, connect to deployed databse. Otherwise, connect to localhost mongoscraper db
var mongoConnect = process.env.MONGODB_URI ||"mongodb://localhost/mongoscraper";

// connect to mongoose
mongoose.connect(mongoConnect, function(error){
    if (error) console.log(error);
    console.log("mongoose is connected");
});
mongoose.Promise = global.Promise;


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});