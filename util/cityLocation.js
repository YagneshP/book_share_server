const {Client}    = require("@googlemaps/google-maps-services-js");
const client      = new Client({});
const createError = require('http-errors')
require("dotenv").config();

const createCityLocation = async(requestedCity) =>{
try{
	const city =  await client.geocode({
		params: {
		 address:`${requestedCity}`,
			key: process.env.GEOCODING_API
		},
		timeout: 1000 // milliseconds
	})
	.then(r => {
		if(r.data.status === "OK"){
		//2.get latitude ang longitude from google api
		const location = r.data.results[0].geometry.location
			return location
		}else{
		throw createError(500,"Can't findLocation")
		}
		
	}).then(location => {
		const geoLocation = {
				type:"Point",
				coordinates:[location.lng, location.lat]
			}
		return geoLocation
	})
	return city
}catch(error){
throw createError(500, "can't find location")
}}


	module.exports={
		createCityLocation
	}