import express from "express";
import { uploadImage } from "../middleware/upload.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
    approvePayment,
    getAllPayments,
    submitPayment
} from "../controllers/payment.controller.js";

const router = express.Router();

const paymentImage = uploadImage([
    "payment_screenshot",
    "paymentScreenshot",
    "screenshot",
    "image",
    "file"
]);

router.post("/submit",  paymentImage, submitPayment);
router.post("/submit/:userId",  paymentImage, submitPayment);
router.get("/", authenticate, requireAdmin, getAllPayments);
router.patch("/:userId", authenticate, requireAdmin, approvePayment);

export default router;
