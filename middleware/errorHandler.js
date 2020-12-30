 const errorHandler = (error,req,res, next)=>{
	// const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	// console.log("errror:",error);
	// console.log("error.status:",error.status)
	res.status(error.status);
	res.json({
		message:error.message,
		stack:   error.stack	}) //process.env.NODE_ENV === "production" ? null :
}
module.exports = errorHandler;