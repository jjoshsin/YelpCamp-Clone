if (process.env.NODE_ENV !== "production") {
    require('dotenv').config(); // if were still in development mode, require dotenv
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const MongoDBStore = require("connect-mongo")(session);

// restructured and made our app.js lighter by putting campground and review routes into separate files
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");


const dbUrl = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));

const store = new MongoDBStore({
    url: dbUrl,
    secret: "thisshouldbeabettersecret!",
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

// need passport.initialize() to use passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate() generates a fcn that is used in passport's LocalStrategy

passport.serializeUser(User.serializeUser()); // store a session
passport.deserializeUser(User.deserializeUser()); // unstore a session


app.use((req, res, next) => {
    // keeps track of the current user and its information
    res.locals.currentUser = req.user;
    // on every single request, we will have access to whatever message is in the flash with the key "success"
    res.locals.success = req.flash("success");
    // same thing for error
    res.locals.error = req.flash("error");
    next();
})

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// HOME PAGE
app.get('/', (req, res) => {
    res.render('home')
});


// only runs if none of the routes above run
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not Found", 404))
});

// our error response handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    if (!err.message) err.message = "Oh No, Something went Wrong!"
    res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
});