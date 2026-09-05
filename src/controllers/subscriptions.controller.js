import mongoose from "mongoose"

import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const subscribeToChannel = asyncHandler(async (req, res) => {

    // Get channel ID from URL
    const { channelId } = req.params

    // Get current logged-in user
    const subscriberId = req.user._id



    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(
            400,
            "You cannot subscribe to your own channel"
        )
    }

    const existingSubscription =
        await Subscription.findOne({
            subscriber: subscriberId,
            channel: channelId
        })


    if (existingSubscription) {
        throw new ApiError(
            409,
            "You are already subscribed to this channel"
        )
    }


    const subscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })


    if (!subscription) {
        throw new ApiError(
            500,
            "Something went wrong while subscribing"
        )
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            subscription,
            "Subscribed successfully"
        )
    )
})


const unsubscribeFromChannel = asyncHandler(async (req, res) => {

    // Get channel ID from URL
    const { channelId } = req.params

    // Get current logged-in user
    const subscriberId = req.user._id

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscription =
        await Subscription.findOne({
            subscriber: subscriberId,
            channel: channelId
        })


    if (!subscription) {
        throw new ApiError(
            404,
            "You are not subscribed to this channel"
        )
    }

    await Subscription.findByIdAndDelete(
        subscription._id
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Unsubscribed successfully"
        )
    )
})


const getChannelSubscribers = asyncHandler(async (req, res) => {

    // Get channel ID from URL
    const { channelId } = req.params

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(
            400,
            "Invalid channel ID"
        )
    }

    const subscribers = await Subscription.aggregate([

        {
            // Find subscriptions for this channel
            $match: {
                channel: new mongoose.Types.ObjectId(
                    channelId
                )
            }
        },

        {
            // Join subscriptions with users
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },

        {
            // Convert array to object
            $unwind: "$subscriber"
        },

        {
            // Return only required user information
            $project: {
                _id: 0,
                subscribedAt: "$createdAt",

                "subscriber._id": 1,
                "subscriber.username": 1,
                "subscriber.fullName": 1,
                "subscriber.avatar": 1
            }
        },

        {
            // Newest subscribers first
            $sort: {
                subscribedAt: -1
            }
        }
    ])


    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    )
})



const getMySubscriptions = asyncHandler(async (req, res) => {

    // Current logged-in user
    const subscriberId = req.user._id


    const subscriptions =
        await Subscription.aggregate([

            {
                $match: {
                    subscriber: subscriberId
                }
            },

            {
                // Get channel/user information
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channel"
                }
            },

            {
                $unwind: "$channel"
            },

            {
                $project: {
                    _id: 1,
                    createdAt: 1,

                    "channel._id": 1,
                    "channel.username": 1,
                    "channel.fullName": 1,
                    "channel.avatar": 1
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            }
        ])

    return res.status(200).json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscriptions fetched successfully"
        )
    )
})


const checkSubscriptionStatus = asyncHandler(async (req, res) => {

    // Channel from URL
    const { channelId } = req.params

    // Current user
    const subscriberId = req.user._id


    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(
            400,
            "Invalid channel ID"
        )
    }

    const subscription =
        await Subscription.findOne({
            subscriber: subscriberId,
            channel: channelId
        })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isSubscribed: !!subscription
            },
            "Subscription status fetched successfully"
        )
    )
})


export {
    subscribeToChannel,
    unsubscribeFromChannel,
    getChannelSubscribers,
    getMySubscriptions,
    checkSubscriptionStatus
}