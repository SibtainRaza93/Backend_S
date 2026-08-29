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

const getChannelStats = asyncHandler(async (req, res) => {

    // Get current logged-in channel ID
    const channelId = req.user._id

    const totalVideos = await Video.countDocuments({
        owner: channelId
    })

    const views = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])
    const totalViews = views[0]?.totalViews || 0


    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })


    const likes = await Like.aggregate([

        {
            // Join Like collection with Video collection
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },

        {
            // Convert videoDetails array into an object
            $unwind: "$videoDetails"
        },

        {
            // Keep likes only for videos owned by this channel
            $match: {
                "videoDetails.owner": channelId
            }
        },

        {
            // Count all matching likes
            $count: "totalLikes"
        }
    ])

    // If no likes exist, return 0
    const totalLikes = likes[0]?.totalLikes || 0


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel statistics fetched successfully"
        )
    )
})




const getChannelVideos = asyncHandler(async (req, res) => {

    // Get logged-in channel ID
    const channelId = req.user._id


    // Get pagination values
    const {
        page = 1,
        limit = 10
    } = req.query


    // Convert query strings into numbers
    const pageNumber = Number(page)
    const limitNumber = Number(limit)


    // Find all videos uploaded by current channel
    const videos = await Video.find({
        owner: channelId
    })
        .sort({
            createdAt: -1
        })
        .skip(
            (pageNumber - 1) * limitNumber
        )

        // Limit results
        .limit(limitNumber)

    const totalVideos = await Video.countDocuments({
        owner: channelId
    })


    const totalPages = Math.ceil(
        totalVideos / limitNumber
    )


    // Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    totalVideos,
                    totalPages,
                    currentPage: pageNumber,
                    limit: limitNumber
                }
            },
            "Channel videos fetched successfully"
        )
    )
})


export {
    getChannelStats,
    getChannelVideos
}