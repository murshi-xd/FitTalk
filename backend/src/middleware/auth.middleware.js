import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If verification fails, jwt.verify will throw an error, and we'll catch it
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        // Find the user by ID
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach the user object to the request for downstream usage
        req.user = user;

        next();

    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);

        // Check if the error is due to JWT verification failure
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};
