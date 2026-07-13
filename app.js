import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js"
import paymentRoutes from "./src/routes/payment.routes.js";



const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);



app.get("/",(req,res)=>{

    res.json({
        message:"RPL Cricket API Running"
    });

});


export default app;
