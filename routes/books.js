const express = require ("express");
const router = express.Router();
const{google} = require("googleapis");
const book =  google.books({
	version: 'v1',
  auth: 'AIzaSyAGdDIx7QT6ODEF3crMLrHcgAz2lCZLnzU' // specify your API key here
});

//get serach book

router.get("/", async(req,res)=>{

const query = req.query;
async function main(query) {
	const response = await book.volumes.list(query);
	
	const volumeInfo = response.data.items.map(i =>  i.volumeInfo);
	res.json(volumeInfo);
};

main(query).catch(console.error);

// res.send("Reach to book route");
})

module.exports = router;