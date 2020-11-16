const mongoose = require ("mongoose");
const {Schema }= mongoose;

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
	books:[]
});

const user = mongoose.model("User", userSchema);

module.exports = user;