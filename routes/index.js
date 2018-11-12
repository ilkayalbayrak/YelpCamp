var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User     = require("../models/user")


// root route
router.get("/", function(req, res){
   res.render("landing");
});


//show register form
router.get("/register", function(req, res){
   res.render("register");
});

//  handle sign up logic
router.post("/register", function(req, res) {
   var newUSer = new User({username: req.body.username});
   User.register(newUSer, req.body.password, function(err, user){
      if(err){
         return res.render("register", {"error": err.message});
      } 
        passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to the YelpCamp " + user.username);    
        res.redirect("/campgrounds");
      });
   });
});


//SHOW LOGIN FORM
router.get("/login", function(req, res) {
   res.render("login"); 
});
//LOGIN LOGIC
router.post("/login",passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }) ,function(req, res) {
});


// LOGOUT ROUTE
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "Logged you out!"); 
   res.redirect("/campgrounds");
});


module.exports = router;