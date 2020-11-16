const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const user = require("./routes/users");
const books = require("./routes/books");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();



//DB Connection
mongoose.connect(process.env.MONGO_URI, 
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
const port = 8004;




app.use(express.json());

app.use(morgan("dev"));
app.use("/api/user", user);
app.use("/api/books", books);


app.use( notFound);
app.use( errorHandler);


app.listen(port, ()=>{
	console.log(`Server is listening on ${port}`)
})