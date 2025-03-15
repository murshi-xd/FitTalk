import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//next for calling next function from where protectRoute is called , here for user to be
// able to update first we will check the user credintial by using cookies and decode it 
// after verified by protectRoute , next function for updateprofile is able to run
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if (!token) {
            return res.status(401).json({message : "Unauthorized - No Token Provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) {
            return res.status(401).json({message : "Unauthorized - Invalid Token"})
        }
        //after decoded,looks for user by the id and password is removed. 
        const user = await User.findById(decoded.userId).select("-password")

        if (!user) {
            return res.status(404).json({message : "User not found"})
        }
        
        //if user is authenticated add user to req and call next function
        req.user= user

        next()

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message)
        return res.status(500).json({ message: "Internal server error"});
    }

}