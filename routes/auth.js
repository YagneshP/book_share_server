const express = require ("express");
const router = express.Router();
const User = require("../models/user");
const {createAccessToken} = require("../token")
const bcrypt = require("bcrypt");
const{wrapAsync}=require("../wrapAsync");
const createError = require('http-errors')
require("dotenv").config()

//get the user by email
//wrapping async for async error
router.post("/login", wrapAsync(async(req,res)=>{
		const foundUser= await User.findOne({email:req.body.email});
		if(foundUser){
			//check the password of the found user
		console.log("requestedPass",req.body.password)
		console.log("userPw", foundUser.password);
			const correctPassword = await bcrypt.compare(req.body.password,foundUser.password);
		console.log("correctedPW:", correctPassword)
			if(correctPassword){
				const token = createAccessToken(foundUser._id);
				res.cookie("jwt", token, {
					maxAge: 1000 * 60 * 60 * 24,
					httpOnly:true,
					sameSite:"lax"
				})
				res.status(200).json(token);
			}else{
				throw createError(400,"InCorrect Password");
			}
		}else{
			throw createError(400,"Email is Invalid")
		}
}));

// post user
router.post("/signup", wrapAsync(async(req,res)=>{
		const user = await User.findOne({email: req.body.email});
		if(user){
			throw  createError(409,"Email Already exist")
		}else{
			const newUser = await User.create(req.body);
			const token = createAccessToken(newUser._id);
			res.cookie("jwt", token, {maxAge: 1000 * 60 * 60 * 24,sameSite:"lax"})
			res.status(201).json(token);
		}
	}
));

//logOut
router.post("/logout",(req,res)=>{
	console.log("logout route")
 res.clearCookie("jwt");
 res.redirect("/")
})


module.exports = router;