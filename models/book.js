const mongoose = require("mongoose");
const User = require("../models/user");

const bookSchema = new mongoose.Schema({
  id: {
    //google.id
    type: String,
  },
  title: {
    type: String,
    lowercase: true,
  },
  subtitle: String,
  authors: [
    {
      type: String,
    },
  ],
  publisher: {
    type: String,
  },
  publishedDate: {
    type: String,
  },
  description: {
    type: String,
  },
  industryIdentifiers: [{ type: { type: String }, identifier: String }],
  imageLinks: {
    smallThumbnail: { type: String },
    thumbnail: { type: String },
  },
  previewLink: {
    type: String,
  },
  user: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
});

bookSchema.pre("remove", async function (next) {
  const User = require("./user");
  try {
    let user = await User.findById(this.user);
    await user.books.remove(this._id);
    await user.save();
    next();
  } catch (err) {
    next(err);
  }
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;

//  {
// 	"title": "JavaScript: The Good Parts",
// 	"subtitle": "The Good Parts",
// 	"authors": [
// 			"Douglas Crockford"
// 	],
// 	"publisher": "\"O'Reilly Media, Inc.\"",
// 	"publishedDate": "2008-05-08",
// 	"description": "Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad, having been developed and released in a hurry before it could be refined. This authoritative book scrapes away these bad features to reveal a subset of JavaScript that's more reliable, readable, and maintainable than the language as a whole—a subset you can use to create truly extensible and efficient code. Considered the JavaScript expert by many people in the development community, author Douglas Crockford identifies the abundance of good ideas that make JavaScript an outstanding object-oriented programming language-ideas such as functions, loose typing, dynamic objects, and an expressive object literal notation. Unfortunately, these good ideas are mixed in with bad and downright awful ideas, like a programming model based on global variables. When Java applets failed, JavaScript became the language of the Web by default, making its popularity almost completely independent of its qualities as a programming language. In JavaScript: The Good Parts, Crockford finally digs through the steaming pile of good intentions and blunders to give you a detailed look at all the genuinely elegant parts of JavaScript, including: Syntax Objects Functions Inheritance Arrays Regular expressions Methods Style Beautiful features The real beauty? As you move ahead with the subset of JavaScript that this book presents, you'll also sidestep the need to unlearn all the bad parts. Of course, if you want to find out more about the bad parts and how to use them badly, simply consult any other JavaScript book. With JavaScript: The Good Parts, you'll discover a beautiful, elegant, lightweight and highly expressive language that lets you create effective code, whether you're managing object libraries or just trying to get Ajax to run fast. If you develop sites or applications for the Web, this book is an absolute must.",
// 	"industryIdentifiers": [
// 			{
// 					"type": "ISBN_13",
// 					"identifier": "9780596554873"
// 			},
// 			{
// 					"type": "ISBN_10",
// 					"identifier": "0596554877"
// 			}
// 	],
// 	"readingModes": {
// 			"text": true,
// 			"image": true
// 	},
// 	"pageCount": 172,
// 	"printType": "BOOK",
// 	"categories": [
// 			"Computers"
// 	],
// 	"averageRating": 4.5,
// 	"ratingsCount": 46,
// 	"maturityRating": "NOT_MATURE",
// 	"allowAnonLogging": true,
// 	"contentVersion": "0.6.6.0.preview.3",
// 	"panelizationSummary": {
// 			"containsEpubBubbles": false,
// 			"containsImageBubbles": false
// 	},
// 	"imageLinks": {
// 			"smallThumbnail": "http://books.google.com/books/content?id=PXa2bby0oQ0C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
// 			"thumbnail": "http://books.google.com/books/content?id=PXa2bby0oQ0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
// 	},
// 	"language": "en",
// 	"previewLink": "http://books.google.ca/books?id=PXa2bby0oQ0C&printsec=frontcover&dq=%22javascript%22&hl=&cd=1&source=gbs_api",
// 	"infoLink": "https://play.google.com/store/books/details?id=PXa2bby0oQ0C&source=gbs_api",
// 	"canonicalVolumeLink": "https://play.google.com/store/books/details?id=PXa2bby0oQ0C"
// },
