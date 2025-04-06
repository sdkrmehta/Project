const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

const MONGO_URL = "mongodb://localhost:27017/wonderlust"; // DATABASE

main()
	.then(() => {
		console.log("connected to db");
	})
	.catch((err) => {
		console.log(err);
	});

async function main() {
	await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
	await listing.deleteMany();
	initData.data = initData.data.map((obj) => ({
		...obj,
		owner: "6740887d339acae5a85bfb30",
	}));
	await listing.insertMany(initData.data);
	console.log("Data was initilize");
};

initDB();
