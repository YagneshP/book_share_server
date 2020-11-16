
const express = require ("express");
const router = express.Router();
const User = require("../models/user");

//get the user by email

router.get("/",async(req,res)=>{
	console.log("ReqBodyEmail:", req.body.email);
		const foundUsers = await User.findOne({email:req.body.email});
		res.json(foundUsers);
});

// post users

router.post("/", async(req,res)=>{
	console.log("ReqBody:", req.body)
	const newUser = await User.create(req.body);
	res.status(201).json(newUser)
})


module.exports = router;