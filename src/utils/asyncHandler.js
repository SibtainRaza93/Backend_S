const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }

// const asyncHandler = () =>{}
// const asyncHandler = (fun) => () =>{}

/*

first way to handle the error 
const asyncHandler = (fun) => (req, res, next) =>{
    try {
        await fun(req, res, next)
    } catch (error) {
        res.status(error.code || 500)
        success: false;
        message: error.message
    }
}

    */