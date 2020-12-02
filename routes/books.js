const express = require ("express");
const router = express.Router();
const{authCheck} = require("../middleware/authCheck");
require("dotenv").config()
const{google} = require("googleapis");
const book =  google.books({
	version: 'v1',
  auth: process.env.GOOGLE_API // specify your API key here
});

//get serach book
router.get("/", async(req,res)=>{
const query = req.query;
async function main(query) {
	const response = await book.volumes.list(query);
	const volumeInfo = response.data.items.map(i =>  i); //.volumeInfo
	res.status(200).json(volumeInfo);
};
const data = main(query).catch(console.error);
res.status(200).json(data)
});

module.exports = router;