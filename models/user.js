const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcyrpt = require("bcrypt");
const Book = require("./book");
const City = require("./city");
//========== point Schema =========//
const pointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 32,
  },
  // city:[{type:mongoose.Types.ObjectId, ref:"City"}],
  location: { type: pointSchema, indexes: "2dsphere" },
  books: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Book",
    },
  ],
});

userSchema.pre("save", async function (next) {
  const saltRound = 10;
  const salt = await bcyrpt.genSalt(saltRound);
  this.password = await bcyrpt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcyrpt.compare(password, user.password);
    if (isMatch) {
      return user;
    }

    throw Error("Incorrect Credentials");
  }

  throw Error("Incorrect Credentials");
};

const User = mongoose.model("User", userSchema);

module.exports = User;
