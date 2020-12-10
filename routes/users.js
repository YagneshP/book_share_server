
const express = require ("express");
const Book = require("../models/book");
const router = express.Router();
const User = require("../models/user");
const{wrapAsync}=require("../wrapAsync");
const createError = require('http-errors')
require("dotenv").config()
const{google} = require("googleapis");



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
					industryIdentifiers:[...data.volumeInfo.industryIdentifiers],
					imageLinks:{...data.volumeInfo.imageLinks},
					previewLink,
					user:req.params.id
				});
			//push this new book to foundUser books array and save
				foundUser.books.push(newBook._id);
				await foundUser.save();
				res.send(newBook)
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
		await foundBook.remove();
		res.json(foundBook)
	throw createError(400,"Something went wrong")
}))

module.exports = router;