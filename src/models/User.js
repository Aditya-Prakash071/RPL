import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
{
    player_id:{
        type:String,
        unique:true,
        sparse:true,
        immutable:true,
        uppercase:true,
        trim:true
    },

    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    mobile:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    role:{
        type:String,
        enum:[
            "USER",
            "ADMIN",
            "MASTER"
        ],
        default:"USER"
    },

    is_verified:{
        type:Boolean,
        default:false
    },
    verification_code:{
        type:String,
        default:""
    },
    father_name:{
        type:String,
        required:true
    },

    whatsapp_number:{
        type:String,
        required:true
    },

    date_of_birth:{
        type:Date,
        required:true
    },
    adhar_number : {
         type:String,
        required:true
    },

    city:{
        type:String,
        required:true
    },

    address:{
        type:String,
        required:true
    },

    profile_photo:{
        type:String,
        default:""
    },

    player_type:{
        type:String,
        enum:[
            "Batsman",
            "Bowler",
            "All-Rounder",
            "Wicket Keeper"
        ],
        required:true
    },

    batting_style:{
        type:String,
        enum:[
            "Right Hand Batsman",
            "Left Hand Batsman"
        ],
        required:true
    },

    bowling_style:{
        type:String,
        required:true
    },
    cricket_experience:{
        type:Number,
        required:true
    },
    previous_team:{
        type:String,
        default:""
    },
    registration_fee:{
        type:Number,
        default:299
    },
    payment_screenshot:{
    type:String,
    default:""
},
    payment_status:{
        type:String,
        enum:[
            "PENDING",
            "SUCCESS",
            "FAILED"
        ],
        default:"PENDING"
    },
    payment_submitted_at:{
        type:Date,
        default:null
    },
    approved_at:{
        type:Date,
        default:null
    },
    approved_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    approved_by_name:{
        type:String,
        default:""
    },
    created_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    created_role:{
        type:String,
        default:""
    }
},
{
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
}

);



const User = mongoose.model(
    "User",
    userSchema
);


export default User;
