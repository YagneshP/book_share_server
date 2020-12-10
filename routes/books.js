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
const query = req.query.q;
async function main(query) {
	const response = await book.volumes.list({q:query});
	const volumeInfo = response.data.items.map(i =>  i); //.volumeInfo
return volumeInfo;
};
 const foundData= await main(query).catch(error=> {throw createError(500, error.message)})
	res.status(200).json(foundData)
}));

module.exports = router;