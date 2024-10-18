const mongoose = require("mongoose");
const initData = require("./data.js");//
const Listing = require("../models/listing.js");//schema 

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
//basic connection ka code
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}


const initDB = async () => {
  await Listing.deleteMany({});//to delte prev data
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();