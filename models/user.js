const mongoose = require ("mongoose");
const {Schema }= mongoose;
const bcyrpt = require("bcrypt");
const Book = require("./book");

const userSchema = new Schema({
	firstName:{
			type:String,
			required:true
	},
	lastName:String,
	email:{
		type:String,
		required:true
	},
	password:{
		type:String,
		required:true
	},
	books:[{
		type:mongoose.Types.ObjectId,
		ref:"Book"
	}]
});

userSchema.pre("save", async function(next){
	const salt = await bcyrpt.genSalt(10);
	 this.password = await bcyrpt.hash(this.password,salt);
	 console.log(`User with hash ${this}`);
	next()
})


const User = mongoose.model("User", userSchema);

module.exports = User;