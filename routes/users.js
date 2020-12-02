
const express = require ("express");
const router = express.Router();
const User = require("../models/user");
const {createAccessToken} = require("../token")
const bcrypt = require("bcrypt");
require("dotenv").config()
const{google} = require("googleapis");
const Book = require("../models/book");
const book =  google.books({
	version: 'v1',
  auth: process.env.GOOGLE_API // specify your API key here
});
//get the user by email
router.post("/login",async(req,res)=>{
	try{
		const foundUser= await User.findOne({email:req.body.email});
		if(foundUser){
			//check the password of the found user
			const correctPassword = await bcrypt.compare(req.body.password, foundUser.password);
			if(correctPassword){
				const token = createAccessToken(foundUser._id);
				res.cookie("jwt", token, {maxAge: 1000 * 60 * 60 * 24})
				res.status(201).json({foundUser});
			}else{
				throw Error("InCorrect Password");
			}
		
		}else{
			throw Error("Email is Invalid")
		}
	
	}
	catch(err){
		res.status(400).json(err.message)
	}
});
//logOut
router.post("/logout",(req,res)=>{
	console.log("logout route")
 res.clearCookie("jwt");
 res.redirect("/")
})

// post user
router.post("/signup", async(req,res)=>{
	try{
		const user = await User.findOne({email: req.body.email});
		if(user){
			throw  Error("Email Already exist")
		}else{
			const newUser = await User.create(req.body);
			const token = createAccessToken(newUser._id);
			res.cookie("jwt", token, {maxAge: 1000 * 60 * 60 * 24})
			res.status(201).json({newUser});
		}
	} catch(err){
		res.status(400).json(err.message) //err.message
	}

});

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
router.post("/:id/collection/add/:book_id", async(req,res)=>{
	try{
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
				const data = await oneBook(bookId).catch(console.error); // Need to improve to throw error ****//
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
				res.send(foundUser)
			} 	//4.if we dont find any book then send book doesnt exist 
			else{ 
				throw Error(`Book is already in your collection`)
			}
		}catch(err){
			console.log(`err while /:id/boooks/add/book.id: ${err}`)
		}
});


//removing book from collection
router.delete("/:id/collection/remove/:book_id", async(req,res)=>{
	try{
	
			let foundBook = await Book.findById(req.params.book_id);
			if(!foundBook){
				return res.status(400).json("Book Not Found");
			}
		if(foundBook.user.toString() !== req.params.id){
			return res.status(401).json({message:"Not authorized"})
		};
		await foundBook.remove();
		res.json({message:"Book removed form the list"})
	}catch(error){
		console.log(error)
	}
})

module.exports = router;