import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken";
const generateAccessToken = (user) => jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });
const generateRefreshToken = (user) => jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing)
            return res
                .status(400)
                .json({ message: "User already exists", status: false });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });
        res.status(201).json({
            message: "User registered",
            data: { name: user.name, email: user.email, role: user.role },
            status: true,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Registration failed",
            error: err.message,
            status: false,
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(400)
                .json({ message: "Invalid email or password", status: false });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res
                .status(400)
                .json({ message: "Invalid email or password", status: false });
        const payload = { _id: user._id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        await RefreshToken.create({ userId: user._id, token: refreshToken });
        res.json({
            message: "Login success",
            status: true,
            data: {
                accessToken,
                refreshToken,
            },
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ message: "Login failed", error: err.message, status: false });
    }
};
export const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res
                .status(401)
                .json({ message: "Refresh token required", status: false });
        const found = await RefreshToken.findOne({ token });
        if (!found)
            return res
                .status(403)
                .json({ message: "Refresh token invalid or expired", status: false });
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            await RefreshToken.deleteOne({ token }); // Cleanup invalid token
            return res.status(403).json({
                message: "Invalid refresh token",
                status: false,
            });
        }
        // Optionally: rotate token
        await RefreshToken.deleteOne({ token }); // Invalidate old token
        const newAccessToken = generateAccessToken(decoded);
        const newRefreshToken = generateRefreshToken(decoded);
        await RefreshToken.create({ userId: decoded._id, token: newRefreshToken });
        res.json({
            message: "New access token and refresh token created successfully",
            status: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Refresh token api failed", status: false });
    }
};
export const logout = async (req, res) => {
    try {
        const { token } = req.body;
        await RefreshToken.deleteOne({ token });
        res.json({ message: "Logged out", status: true });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Logout failed", error: error.message, status: false });
    }
};
