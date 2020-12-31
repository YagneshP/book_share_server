const e = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const createError = require('http-errors')

const authCheck =(req,res, next) =>{
	//we check the token is exist
	console.log("req.cookies", req.cookies.jwt)
		const token = req.cookies.jwt;
		if(!token){
				// return res.status(400).json({message:"Authorization Denied"});
				throw createError(400,"Authorization Denied")
		}
		try{
				// if it is exist we will verify 
		 jwt.verify(token, process.env.ACCESS_TOKEN_SECRETKEY, function(err,decoded){
			 if(decoded){
				//if token exist we'll proccesed with next middleware
			    req.user = decoded;
			    next();
			 }else{
				//  throw Error("Access denied")
				throw createError(400, "ACCESS DeNIED");
			 }
		 });
		} catch(error){
			//if doesn't we will send empty token and logout the user with error message
			res.clearCookie("jwt");
			throw createError(401,error.message)	
		}
}

module.exports={
	authCheck
}