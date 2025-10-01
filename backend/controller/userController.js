import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10

export async function getAllUser() {
    const users = await User.find();
    const encryptedPayload = jwt.sign(
        { users },
        process.env.JWT_SECRET
    )
    return encryptedPayload;
}

export async function addUser(data) {
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    // const pass = password.toString();
    const newUser = new User({
        username: data.username,
        email: data.email,
        password: hash,
        role: 1,
        token: null,
        googleId: null,
        facebookId: null
    });
    await newUser.save();
    return newUser;
}

export async function updateUser(id, data) {
    const user = await User.findById(id);
    if (!user) return new Error("User tidak ditemukan, silahkan registrasi")

    if (user.password === "google_oauth" || user.password === "facebook_oauth") {
        user.username = data.username;
        user.email = data.email;
        await user.save();
    
    } else {
        // console.log(id);
        // console.log(data);
        const match = await bcrypt.compare(data.oldpassword, user.password);
        if (!match) return new Error("Password salah");

        if (data.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }
        user.username = data.username;
        user.email = data.email;
        await user.save();
    }

    // Generate new JWT token
    const token = jwt.sign(
        { id: user._id, email: user.email, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    user.token = token;
    await user.save();

    return { user, token };
}

export async function deleteUser(id) {
    const deleteUser = await User.findByIdAndDelete(id);
    
    return deleteUser;
}

export async function editRole(id, role) {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();

    return user;
}

