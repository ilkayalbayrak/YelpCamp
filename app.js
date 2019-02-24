var express       = require("express");
var app           = express();
var bodyParser    = require("body-parser");
var mongoose      = require("mongoose");
var flash         = require("connect-flash");
var passport      = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Campground    = require("./models/campground");
var Comment       = require("./models/comment");     
var User          = require("./models/user");
var seedDB        = require("./seeds");

// requring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")
    
    
var url = process.env.DATABASEURL ||  "mongodb://localhost:27017/yelp_camp_v12"
mongoose.connect(url, { useNewUrlParser: true });

mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //seed the database
app.locals.moment = require("moment");



//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "This is one of the best books i have ever read in my life",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser  = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


//process.env.PORT, process.env.IP
app.listen("3000", function(){
   console.log("The YelpCamp Server has started !!! "); 
});