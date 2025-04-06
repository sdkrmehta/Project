const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.redirectUrl = req.originalUrl;
		req.flash("error", "Please log in to continue.");
		return res.redirect("/login");
	}
	next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
	if (req.session.redirectUrl) {
		res.locals.redirectUrl = req.session.redirectUrl;
	}
	next();
};

module.exports.isOwner = async (req, res, next) => {
	const { id } = req.params;

	try {
		// Log the ID being passed
		console.log("Listing ID:", id);

		const listing = await mongoose.connection
			.collection("listings")
			.findOne({ _id: new mongoose.Types.ObjectId(id) });

		// Check if listing exists and if the current user is the owner
		if (!listing) {
			console.log("Listing not found");
			req.flash("error", "Listing not found!");
			return res.redirect("/listings");
		}

		// Compare owner ID
		if (String(listing.owner) !== String(req.user._id)) {
			console.log("User is not the owner");
			req.flash("error", "You do not have permission!");
			return res.redirect(`/listings/${id}`);
		}

		next();
	} catch (error) {
		console.error("Error during ownership check:", error);
		req.flash("error", "Something went wrong.");
		return res.redirect("/listings");
	}
};

// Middleware to validate listing
module.exports.validateListing = (req, res, next) => {
	let { error } = listingSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, errMsg);
	} else {
		next();
	}
};

// Middleware to validate reviews
module.exports.validateReview = (req, res, next) => {
	let { error } = reviewSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, errMsg);
	} else {
		next();
	}
};

module.exports.isReviewAuthor = async (req, res, next) => {
	let { id, reviewId } = req.params;
	let review = await Review.findById(reviewId);
	if (!review.author.equals(res.locals.currUser._id)) {
		req.flash("error", "You don't have permission! ");
		return res.redirect(`/listings/${id}`);
	}
	next();
};
