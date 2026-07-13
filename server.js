import "dotenv/config";
import app from "./app.js";
import connectDB from "./src/config/db.js";


connectDB();


process.on("uncaughtException", (err) => {
    console.log("ERROR DETAILS:");
    console.log(err.stack);
});

const PORT = process.env.PORT || 5000;


app.listen(PORT,()=>{

    console.log(
        `Server running on ${PORT}`
    );

});
