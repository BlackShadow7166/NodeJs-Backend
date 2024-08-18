
const tryCatchWrapper = (func) => {
    return (req,res,next) =>{
        try {
            func(req,res,next);
        } catch (error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message
            })
        }
    }
}