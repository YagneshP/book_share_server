const jwt = require("jsonwebtoken");
require("dotenv").config()
const createAccessToken = userId => {
	return jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRETKEY,{
		expiresIn: 1000 * 60 * 60 * 24
	})
}

module.exports = { 
	createAccessToken
}