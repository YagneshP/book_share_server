const mongoose = require ("mongoose");
const { model } = require("./book");
const {Schema }= mongoose;

const Book = require("./book");


//========== point Schema =========//
const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

//========= citySchema ============//
const citySchema = new Schema({
  name: String,
  location: {
    	 type: pointSchema,
			index: '2dsphere',
      required: true
  }
});
const City = mongoose.model("City", citySchema);

module.exports = City