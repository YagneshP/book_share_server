
const express = require ("express");
const Book = require("../models/book");
const router = express.Router();
const User = require("../models/user");
const{wrapAsync}=require("../wrapAsync");
const createError = require('http-errors')
require("dotenv").config()
const{google} = require("googleapis");
const City = require("../models/city");



const book =  google.books({
	version: 'v1',
  auth: process.env.GOOGLE_API // specify your API key here
});

router.get("/", wrapAsync(async(req,res)=>{
		 const user = await User.findById(req.user.userId).select("-password").populate("books");
		 if(user){
			res.json(user)
		 }else{
			throw createError(400,"Something Went Wrong")
		 }			
}))


//========= getting user near city location ===========//
router.get("/:id/findUsers",async(req,res)=>{
	try{
console.log("req.query.bookName:", typeof(req.query.bookName))
const reqUser = await User.findById(req.params.id);
const lag= reqUser.location.coordinates[0];
const lat = reqUser.location.coordinates[1]
const user =  await	User.aggregate(
			[ { "$lookup": {
						"from": "books",
						"localField": "books",
						"foreignField": "_id",
						"as": "books"
				 }
				},
				{"$match":{
							"$and":[
								{	location:
										{ $geoWithin: 
															{ $centerSphere: [ [ lag, lat ], req.query.radius/6378.1 ] } 
										},
								},
								{
			           "books":{$elemMatch :{"title":{$eq:req.query.bookName.toLowerCase()}}}
								}]	
							}
				},
					{"$project":{firstName:1, email:1,_id:0}}
					])
		if(user){
			console.log("user:", user)
		 res.json(user)
	}}catch(error){
		console.log(error)
		res.send(error)
	}
})


//Get collection of user
router.get("/:id/collection", async (req,res)=>{
	try{
		const foundUser = await User.findById(req.params.id).populate("books")
		res.status(200).json(foundUser.books)
	}catch(err){
		console.log(err)
	}
});

//adding book to collection
router.post("/:id/collection/add/:book_id",wrapAsync(async(req,res)=>{
		//1. find user and find book in User collection if it is exist {book already in your collection}
			const foundUser = await User.findById(req.params.id).populate({
				path: 'books',
				match: { id: { $eq: req.params.book_id } },
				select: "title"
			});
	//2. if not  find book from book.id by sending request to google api
			if(foundUser.books.length === 0){
					const bookId = req.params.book_id;
					async function oneBook(bookId) {   
						const response = await book.volumes.get({volumeId:bookId});
						return response.data
					};
		//3. if we find book then create new book for user collection and send response
				const data = await oneBook(bookId).catch(error => {throw createError(500, error.message)}); // Need to improve to throw error ****//
				const{
					title,
					subtitle,
					authors,
					publisher,
					publishedDate,
					description,
					previewLink
				} = data.volumeInfo
				const newBook = await Book.create({
					id:data.id,
					title,
					subtitle,
					authors,
					publisher,
					publishedDate,
					description,
					industryIdentifiers:(data.volumeInfo.industryIdentifiers ?[...data.volumeInfo.industryIdentifiers]:null),
					imageLinks:(data.volumeInfo.imageLinks?{...data.volumeInfo.imageLinks}:null),
					previewLink,
					user:req.params.id
				});
		
			//push this new book to foundUser books array and save
				foundUser.books.push(newBook._id);
				await foundUser.save();
				res.json({newBook:newBook, message:`${newBook.title} is added to your collection`})
			} 	//4.if we dont find any book then send book doesnt exist 
			else{ 
				throw createError(409,`Book is already in your collection`)
			}
}));


//removing book from collection
router.delete("/:id/collection/remove/:book_id",wrapAsync(async(req,res)=>{
	
			let foundBook = await Book.findById(req.params.book_id);
			if(!foundBook){
				return res.status(400).json({message:"Book Not Found"});
			}
		if(foundBook.user.toString() !== req.params.id){
			return res.status(403).json({message:"Not authorized"})
		};
		await foundBook.remove().catch(error => {throw createError(400,"Something went wrong") });
		res.json({removedBook:foundBook,message:`${foundBook.title} is removed from your collection`})
	
}))

module.exports = router;