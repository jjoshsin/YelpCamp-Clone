const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds")
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer'); // multer is an express middleware that can parse the multipart form-data
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// restructured this page on 8/23/24 by putting most of our logic in a controllers folder
// router.route() allows us to group together routes of the same path with diff verbs
// so now this route contains the index page and creating a new campground page
router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// this route contains the show page, editing page and delete page
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;