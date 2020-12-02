const e = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authCheck = (req,res, next) =>{
	//we check the token is exist
		const token = req.cookies.jwt;
		if(!token){
				return res.status(400).json({message:"Access denied"});
		}
		try{
				// if it is exist we will verify 
		 jwt.verify(token, process.env.ACCESS_TOKEN_SECRETKEY, function(err,decoded){
			 if(decoded){
				//if token exist we'll proccesed with next middleware
			    req.user = decoded;
			    next();
			 }else{
				 throw Error("Please login first")
			 }
		 });
		} catch(error){
			//if doesn't we will send empty token and logout the user with error message
			res.clearCookie("jwt");
			console.log(`error ${error}`);
			res.send(error.message);	
		}
}

module.exports={
	authCheck
}