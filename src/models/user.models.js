// Import mongoose and Schema from mongoose
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";


import bcrypt from "bcrypt";


// Schema defines the structure of a User document
const userSchema = new Schema(
  {
  
    username: {
      type: String,              // Data type is String
      required: true,            // Username must be provided
      unique: true,              // No two users can have the same username
      lowercase: true,           // Automatically convert username to lowercase
      trim: true,                // Remove extra spaces from beginning/end
      index: true                // Create an index for faster searching
    },

  
    email: {
      type: String,
      required: true,            // Email is required
      unique: true,              // Email must be unique
      lowercase: true,           // Convert email to lowercase
      trim: true                 // Remove unnecessary spaces
    },

    fullname: {
      type: String,
      required: true,           
      trim: true,
      index: true               
    },
    avatar: {
      type: String,             
      required: true
    },

    coverImage: {
      type: String,              
      required: true
    },

    watchHistory: [
      {
        type: Schema.Types.ObjectId, 
        ref: "Video"                 
      }
    ],


    password: {
      type: String,
      required: [true, "Password is required"]
    },

    refreshToken: {
      type: String
    }
  },


  {
    timestamps: true
  }
);




// This middleware runs BEFORE a user document is saved
// userSchema.pre("save", async function (next) {

//   if (!this.isModified("password")) {
//     return next();
//   }

//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// Custom method attached to every User document
userSchema.methods.isPasswordCorrect = async function (password) {

  // Compare the password entered by the user
  // with the hashed password stored in MongoDB
  return await bcrypt.compare(password, this.password);
};



userSchema.methods.generateAccessToken = function () {

  // Create a JWT containing basic user information
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullname
    },

    // Secret key used to sign the access token
    process.env.ACCESS_TOKEN_SECRET,

    // Token expiration time
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};



userSchema.methods.generateRefreshToken = function () {

  // Refresh token usually contains minimal information
  return jwt.sign(
    {
      _id: this._id
    },

    // Secret key used to sign the refresh token
    process.env.REFRESH_TOKEN_SECRET,

    // Refresh token expiration time
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};


export const User = mongoose.model("User", userSchema);