import User from "../models/User.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "./auth.controller.js";

const submitPayment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Payment screenshot is required"
            });
        }

        const requestedUserId =
            req.params.userId || req.body.user_id || req.body.userId;

        if (!requestedUserId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required. Send it in the URL or as user_id in form-data"
            });
        }

        const normalizedUserId = String(requestedUserId).trim().toUpperCase();
        const userQuery = mongoose.Types.ObjectId.isValid(normalizedUserId)
            ? { _id:normalizedUserId }
            : /^RPL\d+$/.test(normalizedUserId)
                ? { player_id:normalizedUserId }
                : null;

        if (!userQuery) {
            return res.status(400).json({
                success:false,
                message:"Invalid user ID. Use a MongoDB ID or player ID such as RPL001"
            });
        }

        const user = await User.findOne(userQuery);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const uploadedImage = await uploadToCloudinary(
            req.file.buffer,
            "rpl_payment_screenshots"
        );

        user.payment_screenshot = uploadedImage.secure_url;
        user.payment_status = "PENDING";
        user.payment_submitted_at = new Date();
        user.approved_at = null;
        user.approved_by = null;
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Payment screenshot submitted for approval",
            payment: {
                user_id: user._id,
                player_id: user.player_id,
                screenshot: user.payment_screenshot,
                status: user.payment_status,
                submitted_at: user.payment_submitted_at
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const users = await User.find({ payment_screenshot: { $ne: "" } })
            .select("player_id name email mobile profile_photo registration_fee payment_screenshot payment_status payment_submitted_at approved_at approved_by approved_by_name created_at")
            .populate("approved_by", "name email ")
            .sort({ payment_submitted_at: -1 });

        return res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const approvePayment = async (req, res) => {
    try {
        const status = String(
            req.body.status || req.body.payment_status || ""
        ).trim().toUpperCase();

        if (!["SUCCESS", "FAILED"].includes(status)) {
            return res.status(400).json({
                success:false,
                message:"Status must be SUCCESS or FAILED"
            });
        }

        // lean() avoids hydrating any legacy invalid approved_by value such as
        // the string "ADMIN" into an ObjectId schema path.
        const existingUser = await User.findById(req.params.userId).lean();

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (!existingUser.payment_screenshot) {
            return res.status(400).json({
                success: false,
                message: "This user has not submitted a payment screenshot"
            });
        }

        const approverId = req.user?._id;
        const approvedBy = approverId && mongoose.Types.ObjectId.isValid(approverId)
            ? approverId
            : null;
        const approvedByName = req.user.username || req.user.name || "Admin";
         
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            {
                $set:{
                    payment_status:status,
                    is_verified:status === "SUCCESS",
                    approved_at:status === "SUCCESS" ? new Date() : null,
                    approved_by:approvedBy,
                    approved_by_name:approvedByName
                }
            },
            { new:true, runValidators:true }
        );

        return res.json({
            success: true,
            message: status === "SUCCESS"
                ? "Payment approved successfully"
                : "Payment marked as failed",
            user: {
                id: user._id,
                player_id: user.player_id,
                name: user.name,
                payment_status: user.payment_status,
                is_verified: user.is_verified,
                approved_at: user.approved_at,
                approved_by: user.approved_by_name
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export {
    submitPayment,
    getAllPayments,
    approvePayment
};
