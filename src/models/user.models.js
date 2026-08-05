import mongose, { Schema } from 'momgoose'

const userSchema = new Schema({

    username: {
        tyep: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, //cloudinary url 
        required: true,
    },
    coverImage: {
        type: String, // cloudinary
        required: true,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
    }],
    password: {
        type: String,
        required : [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }

}, {timestamp:true})

export const User = mongoose.model("User", userSchema);