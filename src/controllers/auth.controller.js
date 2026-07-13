import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Counter from "../models/Counter.js";
import cloudinary, { configureCloudinary } from "../config/cloudinary.js";



const uploadToCloudinary = (buffer, folder) => {
    configureCloudinary();

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => error ? reject(error) : resolve(result)
        ).end(buffer);
    });
};

const generatePlayerId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id:"player_id" },
        [
            {
                $set:{
                    seq:{ $add:[{ $ifNull:["$seq", 0] }, 1] }
                }
            }
        ],
        { new:true, upsert:true }
    );

    return `RPL${String(counter.seq).padStart(3, "0")}`;
};

const registerUser = async(req,res)=>{
    try{
        const {
            name,
            email,
            mobile,
            father_name,
            whatsapp_number,
            date_of_birth,
            city,
            address,
            player_type,
            batting_style,
            bowling_style,
            cricket_experience,
            previous_team,
            adhar_number,
            password
        } = req.body;

        const generatedPassword = crypto.randomBytes(8).toString("base64url");
        const plainPassword = password || generatedPassword;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const existingUser = await User.findOne({
            $or:[
                {email},
                {mobile}
            ]
        });

        if(existingUser){
            return res.status(400).json({
                message:"User already exists"
            });
        }
        let profilePhoto = "";

        if(req.file){
            const uploadImage = await uploadToCloudinary(
                req.file.buffer,
                "rpl_players"
            );

            profilePhoto =
                uploadImage.secure_url || "";
        }

        const playerId = await generatePlayerId();

        const user = await User.create({
            player_id:playerId,
            name,
            email,
            mobile,
            password:hashedPassword,
            father_name,
            whatsapp_number,
            date_of_birth,
            city,
            address,
            profile_photo:profilePhoto,
            player_type,
            batting_style,
            bowling_style,
            cricket_experience,
            previous_team,
            adhar_number
        });
        res.status(201).json({

            success:true,

            message:"Registration successful",

            user:{
                id:user._id,
                player_id:user.player_id,
                name:user.name,
                email:user.email,
            },
            ...(password ? {} : { temporary_password: generatedPassword })

        });



    }catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};

const loginUser = async (req, res) => {
    try {
        const { email,  password } = req.body;

        if ((!email ) || !password) {
            return res.status(400).json({
                success: false,
                message: "Email  and password are required"
            });
        }

        const query = 
             { email: email.toLowerCase().trim() }
        const user = await User.findOne(query).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials"
            });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                player_id: user.player_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const {email, password } = req.body;
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            return res.status(400).json({
                success:false,
                message:"Admin username and password are required"
            });
        }

        if (!adminUsername || !adminPassword || !process.env.JWT_SECRET) {
            return res.status(500).json({
                success:false,
                message:"Static admin configuration is missing"
            });
        }

        const suppliedPassword = Buffer.from(String(password));
        const configuredPassword = Buffer.from(adminPassword);
        const passwordMatches =
            suppliedPassword.length === configuredPassword.length &&
            crypto.timingSafeEqual(suppliedPassword, configuredPassword);

        if (email !== adminUsername || !passwordMatches) {
            return res.status(401).json({
                success:false,
                message:"Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            {
                staticAdmin:true,
                role:"ADMIN",
                adminUsername
            },
            process.env.JWT_SECRET,
            { noTimestamp:true }
        );

        return res.json({
            success:true,
            message:"Admin login successful",
            token,
            admin:{
                email:adminUsername,
                role:"ADMIN"
            }
        });
    } catch (error) {
        return res.status(500).json({ success:false, message:error.message });
    }
};

export {
    registerUser,
    loginUser,
    adminLogin,
    uploadToCloudinary
};
