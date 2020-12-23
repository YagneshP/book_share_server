const express = require ("express");
const router = express.Router();
const{authCheck} = require("../middleware/authCheck");
const createError = require('http-errors');
const{wrapAsync}=require("../wrapAsync");
require("dotenv").config()
const{google} = require("googleapis");
const book =  google.books({
	version: 'v1',
  auth: process.env.GOOGLE_API // specify your API key here
});

//get serach book
router.get("/", wrapAsync(async(req,res)=>{
	try{

	
	if(req.query.q !== ""){

const query = req.query.q;
console.log("query::", query)
async function main(query) {
	const response = await book.volumes.list({q:query});
	const volumeInfo = response.data.items.map(i =>  i); //.volumeInfo
return volumeInfo;
};

	const foundData= await main(query).catch(error=> {	throw createError(500, error.message)})
	res.status(200).json(foundData)
}else{
	throw createError(400, "Query must not be empty");
}
	} catch(error){
		res.status(500).json({message: error.message})
	}

}));



module.exports = router;