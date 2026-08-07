import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

// Create the schema (structure) for the Video collection
const videoSchema = new Schema({

    // Stores the Cloudinary URL of the uploaded video
    videoFile: {
        type: String,
        required: true,   // ❌ You wrote "require", it should be "required"
    },

    // Stores the Cloudinary URL of the thumbnail image
    thumbnail: {
        type: String,
        required: true,
    },

    // Title of the video
    title: {
        type: String,
        required: true,
    },

    // Description of the video
    description: {
        type: String,
        required: true,
    },

    // Duration of the video (in seconds)
    duration: {
        type: Number,
        required: true,
    },

    // Number of views on the video
    views: {
        type: Number,
        default: 0, // Starts with 0 views
    },

    // Checks whether the video is public or not
    isPublished: {
        type: Boolean,
        default: true, 
    },

    // Reference to the User who uploaded the video
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User", // Links this field to the User collection
    }

},
{
    timestamps: true, // 
    // Automatically adds:
    // createdAt
    // updatedAt
}
)

// Add pagination support for aggregation queries
videoSchema.plugin(mongooseAggregatePaginate)

// Create and export the Video model
export const Video = mongoose.model("Video", videoSchema)