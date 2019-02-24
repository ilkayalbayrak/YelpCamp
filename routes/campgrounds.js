var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX
router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    
        //GET THE SEARCHED CAMPGROUND FROM DB 
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                if(allCampgrounds.length < 1) {
                    req.flash('error', 'Sorry, no campgrounds match your query. Please try again');
                    return res.redirect('/campgrounds');
                     }
                    res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
                }
        });
    }else{
         //GET ALL THE CAMPGROUNDS FROM DB 
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
            }
        });
    }    
});
//CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    //create a new campground and save it to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
   
});

//NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new.ejs");
});

// SHOW - Shows more info about campgruonds
router.get("/:id", function(req, res){
    //find the campgorunds with provided ID
     Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
         if(err || !foundCampground){
             req.flash("error", "Campground not found");
             res.redirect("back");
         } else {
              //render show template about that campground
              res.render("campgrounds/show", {campground: foundCampground}); 
         }
     });
});

// EDIT CAMPGROUND 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});        
    }); 
});

// UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findOneAndUpdate({"_id": req.params.id}, req.body.campground, {upsert: true, new: true}, function(err, updateCampground){
       if (err){
           res.redirect("/campgrounds");
       } else {
            res.redirect("/campgrounds/" + req.params.id);
       }
   }); 
});

// DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findOneAndDelete({"_id": req.params.id}, function(err){
        if (err){
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground Deleted");
            res.redirect("/campgrounds");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;