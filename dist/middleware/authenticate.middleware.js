import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === "string") {
            return res.status(401).json({ message: "Invalid token format" });
        }
        req.user = decoded; // Now safely assign; // contains _id and role
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
// middleware/authorizeRole.ts
export const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user context" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient role" });
        }
        next();
    };
};
