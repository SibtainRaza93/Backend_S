// Import multer
// Multer is used to handle file uploads in Node.js/Express
import multer from "multer";


// Configure where and how uploaded files will be stored
const storage = multer.diskStorage({

    // ---------------------------------------
    // Destination
    // ---------------------------------------
    // This function decides where the uploaded
    // file should be temporarily stored
    destination: function (req, file, cb) {

        // cb = callback function
        // null = no error
        // "./public/temp" = folder where file will be stored
        cb(null, "./public/temp");
    },


    // ---------------------------------------
    // Filename
    // ---------------------------------------
    // This function decides what name the
    // uploaded file should have
    filename: function (req, file, cb) {

        // file.originalname = original name of uploaded file
        // Example: profile.jpg
        //
        // The uploaded file will be saved as:
        // ./public/temp/profile.jpg
        cb(null, file.originalname);
    }
});


// ---------------------------------------
// Create Multer Upload Middleware
// ---------------------------------------

// Create an upload middleware using
// the storage configuration defined above
export const upload = multer({
    storage,
});















// import multer from 'multer'

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./public/temp");
//     },
//     filename: function (req, file, cb){
//         cb(null, file.originalname)
//     }
// })

// export const upload = multer({
//     storage,
// })