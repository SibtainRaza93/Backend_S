// Import mongoose and Schema from mongoose
import mongoose, { Schema } from "mongoose";

// Used to create and verify JWT tokens
import jwt from "jsonwebtoken";

// Used for password hashing and password comparison
import bcrypt from "bcrypt";


// ======================================================
// USER SCHEMA
// ======================================================

// Schema defines the structure of a User document
const userSchema = new Schema(
  {
    // -----------------------------
    // Username
    // -----------------------------
    username: {
      type: String,              // Data type is String
      required: true,            // Username must be provided
      unique: true,              // No two users can have the same username
      lowercase: true,           // Automatically convert username to lowercase
      trim: true,                // Remove extra spaces from beginning/end
      index: true                // Create an index for faster searching
    },

    // -----------------------------
    // Email
    // -----------------------------
    email: {
      type: String,
      required: true,            // Email is required
      unique: true,              // Email must be unique
      lowercase: true,           // Convert email to lowercase
      trim: true                 // Remove unnecessary spaces
    },

    // -----------------------------
    // Full Name
    // -----------------------------
    fullname: {
      type: String,
      required: true,            // Full name is required
      trim: true,
      index: true                // Helps when searching by fullname
    },

    // -----------------------------
    // Profile Avatar
    // -----------------------------
    avatar: {
      type: String,              // Cloudinary image URL
      required: true
    },

    // -----------------------------
    // Cover Image
    // -----------------------------
    coverImage: {
      type: String,              // Cloudinary image URL
      required: true
    },

    // -----------------------------
    // Watch History
    // -----------------------------
    watchHistory: [
      {
        type: Schema.Types.ObjectId, // Stores MongoDB ObjectId
        ref: "Video"                 // Refers to the Video model
      }
    ],

    // -----------------------------
    // Password
    // -----------------------------
    password: {
      type: String,
      required: [true, "Password is required"]
    },

    // -----------------------------
    // Refresh Token
    // -----------------------------
    refreshToken: {
      type: String
    }
  },

  // Automatically creates createdAt and updatedAt fields
  {
    timestamps: true
  }
);


// ======================================================
// PASSWORD HASHING
// ======================================================

// This middleware runs BEFORE a user document is saved
userSchema.pre("save", async function (next) {

  // If password was not changed/modified,
  // don't hash it again
  if (!this.isModified("password")) {
    return next();
  }

  // Convert plain-text password into a hashed password
  // 10 = number of salt rounds
  this.password = await bcrypt.hash(this.password, 10);

  // Continue with the save operation
  next();
});


// ======================================================
// PASSWORD VERIFICATION
// ======================================================

// Custom method attached to every User document
userSchema.methods.isPasswordCorrect = async function (password) {

  // Compare the password entered by the user
  // with the hashed password stored in MongoDB
  return await bcrypt.compare(password, this.password);
};


// ======================================================
// GENERATE ACCESS TOKEN
// ======================================================

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


// ======================================================
// GENERATE REFRESH TOKEN
// ======================================================

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


// ======================================================
// CREATE USER MODEL
// ======================================================

// Create a model named "User" using userSchema
// MongoDB will use this model to create/read/update users
export const User = mongoose.model("User", userSchema);