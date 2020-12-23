const express = require ("express");
const router = express.Router();
const User = require("../models/user");
const {createAccessToken} = require("../token")
const bcrypt = require("bcrypt");
const{wrapAsync}=require("../wrapAsync");
const createError = require('http-errors')
require("dotenv").config();
const{body, validationResult} = require("express-validator");
const axios = require("axios");
const {Client} = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const mongoose = require("mongoose");
const City = require("../models/city");




//get the user by email
//wrapping async for async error
router.post("/login",
[
	body("email").isEmail().withMessage("Please include valid email"),
	body("password").exists().withMessage("Password is required")
	
] ,wrapAsync(async(req,res)=>{
	//validation result 	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		throw createError(400, errors.errors[0].msg)
	}

	
	let foundUser= await User.findOne({email:req.body.email});
		if(foundUser){
			//check the password of the found user
			console.log("foundYser", foundUser)
		console.log("requestedPass",req.body.password)
		console.log("userPw", foundUser.password);
			const correctPassword = await bcrypt.compare(req.body.password,foundUser.password);
		// const correctPassword = 	bcrypt.compare(req.body.password,foundUser.password).then(result => {
		// 		console.log("result",result);
		// 		return result
		// 	})
		console.log("correctedPW:", correctPassword)
			if(correctPassword){
				const token = createAccessToken(foundUser._id);
				res.cookie("jwt", token, {
					maxAge: 1000 * 60 * 60 * 24,
					httpOnly:true,
					sameSite:"lax"
				})
				// res.json(foundUser)
				res.status(200).json(token);
			}else{
				throw createError(400,"Incorrect Password");
			}
		}else{
			throw createError(400,"Incorrect Email")
		}
}));

// post user
router.post("/signup", 
[
	body("firstName").not().isEmpty().withMessage("Please provide First Name"),
	body("email").isEmail().withMessage("Please include valid email address"),
	body("password").isLength({min:8}).withMessage("Password must be 8 or more and less than 32 characters long"),
	body("city").not().isEmpty().withMessage("Provide valid city name")
],
wrapAsync(async(req,res)=>{
		//validation result 	
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			throw createError(400, errors.errors[0].msg)
		}
		//1.get the city from the req.body
const cityLocation =	await client.geocode({
			params: {
			 address:`${req.body.city}`,
				key: process.env.GEOCODING_API
			},
			timeout: 1000 // milliseconds
		})
		.then(r => {
			if(r.data.status === "OK"){
			//2.get latitude ang longitude from google api
			const location = r.data.results[0].geometry.location
				console.log(location); //{ lat: 51.5073509, lng: -0.1277583 }
				return location
			}else{
				console.log("status",r.data.status)
			}
			
		}).then(location => {
			const geoLocation = {
					type:"Point",
					coordinates:[location.lng, location.lat]
				}
			
			return geoLocation
		})
		.catch(err =>{
			console.log("err",err)
		});
		
// console.log("cityPlace", cityPlace);

		const user = await User.findOne({email: req.body.email});
		if(user){
			throw  createError(400,"Email Already exist")
		}else{
			try{
				const newUser = await User.create({email:req.body.email,firstName:req.body.firstName,password:req.body.password,lastName:req.body.lastName,location:cityLocation})
				// const newCity = await City.create({name:req.body.city, location:cityLocation});
				// newUser.city.push(newCity._id)
			const token = createAccessToken(newUser._id);
			res.cookie("jwt", token, {maxAge: 1000 * 60 * 60 * 24,sameSite:"lax"});
			res.status(201).json(token);
			// res.status(201).json(newUser);
			}catch(error){
			  throw createError(500,error.message)
			}
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