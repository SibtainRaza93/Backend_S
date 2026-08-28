import mongoose from "mongoose"

import {Video} from "../models/video.models"
import {Subscription} from "../models/subscription.models"
import {Like} from "../models/like.models"
import { ApiError } from "../utils/apiErrorHandling"
import { ApiResponse } from "../utils/apiResponseError"
import { asyncHandler } from "../utils/asyncHandler"


/*
REQUEST AAYI
    ↓
INPUT NIKALO
    ↓
VALIDATE KARO
    ↓
DATABASE SE KAAM KARO
    ↓
AUTHORIZATION CHECK KARO (agar needed)
    ↓
RESPONSE BHEJO

*/

const getChannelStats = asyncHandler(async(req, res) =>{

     // 1. Get current channel ID
    
     const channelId = req.user._id
     const totalVideos = await Video.countDocuments({
        
     })

    // 2. Find/count total videos

    // 3. Calculate total views of those videos

    // 4. Count subscribers

    // 5. Calculate total likes received on channel videos

    // 6. Return all statistics
})

const getChannelVideos = asyncHandler(async(re, res) =>{

})



export{
    getChannelStats,
    getChannelVideos
}