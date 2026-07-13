import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization || "";
        const [scheme, token] = authorization.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            decoded.staticAdmin === true &&
            decoded.role === "ADMIN" &&
            decoded.adminUsername === process.env.ADMIN_USERNAME
        ) {
            req.user = {
                role:"ADMIN",
                username:decoded.adminUsername,
                isStaticAdmin:true
            };
            return next();
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !["ADMIN", "MASTER"].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};

export { authenticate, requireAdmin };
