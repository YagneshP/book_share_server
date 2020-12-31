const{validationResult}   = require("express-validator");
const bcrypt              = require("bcrypt");
const createError         = require('http-errors')
const User                = require("../models/user");
const{createAccessToken}  = require("../token");
const{createCityLocation} = require("../util/cityLocation")

//====== login controller =============//
const auth_login = async(req,res)=>{
	//validation result 	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		throw createError(400, errors.errors[0].msg)
	}
try {
			let foundUser = await User.login(req.body.email, req.body.password);
			if(foundUser){
				//check the password of the found user
					const token = createAccessToken(foundUser._id);
					res.cookie("jwt", token, {
						maxAge: 1000 * 60 * 60 * 24,
						httpOnly:true,
						sameSite:"lax"
					})
				return	res.status(200).json(token);
				}
			else{
				throw createError(400,"Incorrect Email")
			}	
		} catch (error) {
			throw createError(401, error.message)
		}
}


//============ signup controller ============//
const auth_signup = async(req,res)=>{
	//validation result 	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		throw createError(400, errors.errors[0].msg)
	}
	//1.get the city from the req.body

const user = await User.findOne({email: req.body.email});
	if(user){
		throw  createError(400,"Email Already exist")
	}else{
		try{
			const cityLocation = await createCityLocation(req.body.city)
			const newUser = await User.create({email:req.body.email,firstName:req.body.firstName,password:req.body.password,lastName:req.body.lastName,location:cityLocation})
			const token = createAccessToken(newUser._id);
			res.cookie("jwt", token, {maxAge: 1000 * 60 * 60 * 24,sameSite:"lax"});
			res.status(201).json(token);
		}catch(error){
			throw createError(500,error.message)
		}
	}
}

module.exports={
	auth_login,
	auth_signup
}