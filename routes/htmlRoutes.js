
var express = require("express");
var router = express.Router();

var cheerio = require("cheerio");
var request = require("request");

var logger = require("morgan");
var mongoose = require("mongoose");

//require models 
var db = require("../models");

let url = "https://www.npr.org/";

router.get("/scrape", function (req, res) {
  
    var allArticles = [];
   
    request(url, function (err, response, html) {
        if (err) console.log(err);

        let $ = cheerio.load(html)
        
        let articles = $(".story-wrap");
     
        articles.each(function (i, article) {
            let articleInfo = {
                title: $(article).children("a").text(),
                url: $(article).children("a").attr("href"),
                content: $(article).children("p").text().trim(),
            }
            
            //send to db -- create collection
            db.Article.create(result)
            .then(function(dbArticle) {
                console.log(dbArticle);
            })
                .catch(function (err) {
                    return res.json(err);   
                });
        });
    });
    //Scrape complete
    res.send("Scrape Complete")
});

//render all info from db
router.get("/", function(req, res){ 

    db.Article.find()
    .then(function(dbArticle){

        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//render saved articles 
router.get("/articles", function(req, res){
    db.Article.find({
        "saved": true
    })
    .populate("notes")
    .exec(function(err, articles){
        let allArticles = {
            articles: articles
        };
    res.render("saved", allArticles);
    });
});

//retrieve saved articles by id 
router.get("/articles/:id", function (req,res){
    db.Article.findOne({
        "_id": req.params.id
    })
    .populate("note")
    .then(function(dbArticle){

        res.json(dbArticle);
    })
    .catch(function(err){ 
        res.json(err);
    });
});

// save article 
router.post("/articles/save/:id", function (req,res){
    db.Article.findOneAndUpdate({
        "_id": req.params.id
    }, {
        "saved": true
    })
    .catch(function(err, articles){
        if (err) {
            console.log(err);
        }
        else {
            res.json(articles);
        }
    });
});

//delete article 
router.post("/articles/delete/:id", function (req,res){
    console.log("deleted");

    db.Article.findOneAndUpdate({
        "_id": req.params.id
    }, {
        "saved": false
    })
    .catch(function(err, articles){
        if (err) {
            console.log(err);
        }
        else {
            res.json(articles);
        }
    });
});



// export to use in server.js 
module.exports = router;