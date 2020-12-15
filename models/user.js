const mongoose = require ("mongoose");
const {Schema }= mongoose;
const bcyrpt = require("bcrypt");
const Book = require("./book");
const City = require("./city");
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

const userSchema = new Schema({
	firstName:{
			type:String,
			required:true
	},
	lastName:String,
	email:{
		type:String,
		required:true,
		unique:true
	},
	password:{
		type:String,
		required:true,
		min:8,
		max:32
	},
	// city:[{type:mongoose.Types.ObjectId, ref:"City"}],
location:{type:pointSchema,indexes:"2dsphere"},
	books:[{
		type:mongoose.Types.ObjectId,
		ref:"Book"
	}]
});

userSchema.pre("save", async function(next){
	const salt = 10;
	 this.password = await bcyrpt.hash(this.password,salt);
	next()
})


const User = mongoose.model("User", userSchema);

module.exports = User;