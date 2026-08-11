import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from "../utils/apiErrorHandling.js"
import {User} from "../models/user.models.js"


const registerUser = asyncHandler(async (req, res) =>{
    // res.status(200).json({
    //     message: "Ok"
    // })

    const {fullname, email, password, username} = req.body

    if(
        [fullname, username, email, password].some((field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All field are required")
    }
    const existUser = User.fineOne({
        $or: [{ email }, { username }]  /// $or used for check multiple fields error 
    })

    if(existUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    

})

export  {registerUser}