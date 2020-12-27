require("dotenv").config()
const{google} = require("googleapis");
const book =  google.books({
	version: 'v1',
  auth: process.env.GOOGLE_API 
});
module.exports={
	book
}