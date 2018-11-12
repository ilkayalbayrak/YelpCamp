
var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
//new comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // find campground by id 
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {campground: campground});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
   // find cammpg using id 
   Campground.findById(req.params.id, function(err, campground) {
      if(err){
          req.flash("error", "Something went wrong.");
          res.redirect("/campgrounds");
      } else {
          Comment.create(req.body.comment, function(err, comment){
             if (err){
                 console.log(err);
             } else {
                 // add username and id to comment
                 comment.author.id = req.user._id;
                 comment.author.username = req.user.username
                 
                 // save comment
                 comment.save();
                 campground.comments.push(comment);
                 campground.save();
                 req.flash("success", "Successfully added comment.");
                 res.redirect("/campgrounds/" + campground._id);
             }
          });
      }
   });
 
});

// COMMENT EDIT ROUTE 
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
       if(err || !foundCampground){
           req.flash("error", "Campground not found");
           return res.redirect("back");
       } 
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err){
                 console.log(err);
                 res.redirect("back");
            } else {
                 req.flash("success", "Comment has successfully edited.")
                 res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
                }
            });
        });
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findOneAndUpdate({"_id": req.params.comment_id}, req.body.comment, {upsert: true, new: true}, function(err, updatedComment){
      if(err){
          console.log(err);
          res.redirect("back");
      } else {
          res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findOneAndDelete({"_id": req.params.comment_id}, function(err){
      console.log({"_id": req.params.comment_id});
      if(err){
          res.redirect("back");
      } else {
          req.flash("success", "Comment deleted")
          res.redirect("/campgrounds/" + req.params.id);
      }
   }); 
});

module.exports = router;