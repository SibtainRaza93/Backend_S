import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/apiErrorHandling.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponseError.js"



const generateAccessAndRefereshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generatingrefresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // Get user details from request body
    const { fullname, email, password, username } = req.body

    // Check if any required field is empty
    if (
        [fullname, username, email, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
    }

    // Check if user already exists with same email or username
    const existUser = await User.findOne({
        $or: [{ email }, { username: username.toLowerCase() }]
    });

    if (existUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // Get uploaded avatar and cover image file paths
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Avatar is required for registration
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload images to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // Check if avatar upload was successful
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Create new user in database
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // Get created user without sensitive fields
    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Check if user was created successfully
    if (!createUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // Send successful registration response
    return res.status(201).json(
        new ApiResponse(200, createUser, "User Registered Successfully")
    )

})

const loginUser = asyncHandler (async (req, res) =>{
    // req body -> data
    // username or email
    // find the user
    // password check
    //access and refresh token
    //send cookies

    const {email, username, password}  =req.body
    if(!username || !email){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(400, "User does not exist.")
    }

    // check password 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password.")
    }


})

export { registerUser }