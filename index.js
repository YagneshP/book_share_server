const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const user = require("./routes/users");
const auth = require("./routes/auth");
const books = require("./routes/books");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const {authCheck} = require("./middleware/authCheck");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

//DB Connection
mongoose.connect(process.env.MONGO_URI, 
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	}).catch(error =>{
		console.log(error)
		throw Error("DB connection problem")
		});
const port = process.env.PORT||8004;
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
	origin:["https://book-share-client-yp.herokuapp.com","https://book-share-client-yp.herokuapp.com/library","https://book-share-client-yp.herokuapp.com/findRental"],
	allowedHeaders:"Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With,observe",
	credentials:true
}))

app.use("/api/user",authCheck,user);// add authcheck middleware
app.use("/api/auth",cors(), auth)
app.use("/api/books",authCheck, books); // add authcheck middleware
app.use( notFound);
app.use( errorHandler);



app.listen(port, ()=>{
	console.log(`Server is listening on ${port}`)
})