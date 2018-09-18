
var express = require("express");
var router = express.Router();

var cheerio = require("cheerio");
var request = require("request");

var logger = require("morgan");
var mongoose = require("mongoose");

//require models 
var db = require("../models");



let url = "https://npr.org/";
router.get("/scrape", function (req, res) {
    var allStories = [];
    request(url, function (err, response, body) {
        if (err) console.log(err);

        let $ = cheerio.load(body)
        let stories = $(".story-wrap");
        stories.each(function (i, article) {
            let articleInfo = {
                title: $(article).children("h3.title").text().trim(),
                url: $(article).children("a").attr("href"),
                content: $(article).children("p").text().trim(),
            }
            
            //send to db -- create an article in Articles collection
            db.Article.create(articleInfo)
                .catch(function (err) {
                    console.log("Scrape was successful");
                });
        });
    });
    //when scrape is complete
    res.send("Scrape Complete")
});


//when home page loads, get all articles from the db
router.get("/", function(req, res){ 
    //grab all documents
    db.Article.find().sort({date: -1})
    .then(function(stories){
        let allArticles = {
            stories: stories
        };
        res.render("index", allArticles);
    })
    .catch(function(err){
        res.json(err);
    });
});



//route to render the saved articles 
router.get("/stories", function(req, res){
    db.Article.find({
        "saved": true
    })
    .populate("notes")
    .exec(function(err, stories){
        let allArticles = {
            stories: stories
        };
    res.render("saved", allArticles);
    });
});

//route to get saved story by id 
router.get("/stories/:id", function (req,res){
    db.Article.findOne({
        "_id": req.params.id
    })
    .populate("notes")
    .exec(function(err, stories){
        if (err) {
            console.log(err);
        }
        else {
            res.json(stories);
        }
    });
});

// save story 
router.post("/articles/save/:id", function (req,res){
    db.Article.findOneAndUpdate({
        "_id": req.params.id
    }, {
        "saved": true
    })
    .exec(function(err, stories){
        if (err) {
            console.log(err);
        }
        else {
            res.json(stories);
        }
    });
});

//delete story 
router.post("/articles/delete/:id", function (req,res){
    console.log("deleted");

    db.Article.findOneAndUpdate({
        "_id": req.params.id
    }, {
        "saved": false
    })
    .exec(function(err, stories){
        if (err) {
            console.log(err);
        }
        else {
            res.json(stories);
        }
    });
});

//add notes to an article 
router.post("/notes/save/:id", function (req,res){
    console.log("notes added");
    var newNotes = new Notes({
        body: req.body.text,
        article: req.params.id
    });
    newNotes.save(function (err, notes){
        console.log(notes.body);
        if (err){
            console.log(err)
        }else {
            db.Article.findOneAndUpdate({
                "_id": req.params.id
            }, {
                $push: {
                    "notes": notes
                }
            })
            .exec(function(err, notes){
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(notes);
                }
            });
        }
    });    
});

//delete notes from an article 
router.delete("/notes/delete/:notes_id/:articles_id", function (req,res){
    Notes.findOneAndRemove({
        "_id": req.params.notes_id
    }, function (err){
        if (err){
            conosole.log(err);
            res.send(err);
        }else{
            db.Article.findOneAndUpdate({
                "_id": req.params.notes_id
            }, {
                $pull: {
                    "notes": req.params.articles_id
                }
            })
            .exec(function (err){
                if (err){
                    console.log(err);
                    res.send(err)
                } else {
                    res.send("Note Deleted!");
                }
            });
        }
    });
});


// export to use in server.js 
module.exports = router;