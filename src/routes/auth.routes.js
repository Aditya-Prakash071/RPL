import express from "express";
import { uploadImage } from "../middleware/upload.js";
import { adminLogin, loginUser, registerUser } from "../controllers/auth.controller.js"


const router = express.Router();



router.post(
    "/register",
    uploadImage(["profile_photo", "profilePhoto", "image", "file"]),
    registerUser
);

router.post("/login", loginUser);
router.post("/admin/login", adminLogin);



export default router;
