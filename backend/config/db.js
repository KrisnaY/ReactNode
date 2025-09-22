import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await await mongoose.connect(process.env.DB_CONN);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error Conecting MongoDB", error);
        process.exit(1)
    }
}