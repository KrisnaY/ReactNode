import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true},
    email: { type: String, unique: true },
    password: String,
    role: { type: Number, default: 1 },
    token: String,
    googleId: String,
    facebookId: String
});

const User = mongoose.model('User', userSchema);

export default User;