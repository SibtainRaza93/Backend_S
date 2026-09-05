import mongoose from "mongoose"

import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// =====================================================
// SUBSCRIBE TO A CHANNEL
// =====================================================

const subscribeToChannel = asyncHandler(async (req, res) => {

    // Get channel ID from URL
    const { channelId } = req.params

    // Get current logged-in user
    const subscriberId = req.user._id


    // -----------------------------------------
    // 1. Validate channel ID
    // -----------------------------------------

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }


    // -----------------------------------------
    // 2. Check if user is subscribing to
    //    their own channel
    // -----------------------------------------

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(
            400,
            "You cannot subscribe to your own channel"
        )
    }


    // -----------------------------------------
    // 3. Check if already subscribed
    // -----------------------------------------

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


    // -----------------------------------------
    // 4. Create subscription
    // -----------------------------------------

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


    // -----------------------------------------
    // 5. Send response
    // -----------------------------------------

    return res.status(201).json(
        new ApiResponse(
            201,
            subscription,
            "Subscribed successfully"
        )
    )
})


// =====================================================
// UNSUBSCRIBE FROM A CHANNEL
// =====================================================

const unsubscribeFromChannel = asyncHandler(async (req, res) => {

    // Get channel ID from URL
    const { channelId } = req.params

    // Get current logged-in user
    const subscriberId = req.user._id


    // -----------------------------------------
    // 1. Validate channel ID
    // -----------------------------------------

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }


    // -----------------------------------------
    // 2. Find subscription
    // -----------------------------------------

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


    // -----------------------------------------
    // 3. Delete subscription
    // -----------------------------------------

    await Subscription.findByIdAndDelete(
        subscription._id
    )


    // -----------------------------------------
    // 4. Send response
    // -----------------------------------------

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Unsubscribed successfully"
        )
    )
})


// =====================================================
// GET CHANNEL SUBSCRIBERS
// =====================================================

const getChannelSubscribers = asyncHandler(async (req, res) => {

    // Get channel ID from URL
    const { channelId } = req.params


    // -----------------------------------------
    // 1. Validate channel ID
    // -----------------------------------------

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(
            400,
            "Invalid channel ID"
        )
    }


    // -----------------------------------------
    // 2. Get subscribers
    // -----------------------------------------

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


    // -----------------------------------------
    // 3. Send response
    // -----------------------------------------

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    )
})


// =====================================================
// GET MY SUBSCRIPTIONS
// =====================================================

const getMySubscriptions = asyncHandler(async (req, res) => {

    // Current logged-in user
    const subscriberId = req.user._id


    // -----------------------------------------
    // 1. Find subscriptions
    // -----------------------------------------

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


    // -----------------------------------------
    // 2. Send response
    // -----------------------------------------

    return res.status(200).json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscriptions fetched successfully"
        )
    )
})


// =====================================================
// CHECK SUBSCRIPTION STATUS
// =====================================================

const checkSubscriptionStatus = asyncHandler(async (req, res) => {

    // Channel from URL
    const { channelId } = req.params

    // Current user
    const subscriberId = req.user._id


    // -----------------------------------------
    // 1. Validate channel ID
    // -----------------------------------------

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(
            400,
            "Invalid channel ID"
        )
    }


    // -----------------------------------------
    // 2. Find subscription
    // -----------------------------------------

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