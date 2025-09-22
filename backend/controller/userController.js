import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10

export async function getAllUser(req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.log(error )
        res.status(500).json({ message: error.message });
    }
}

export async function addUser(req, res) {
    try {
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        // const pass = password.toString();
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            role: 1,
            token: null,
            googleId: null,
            facebookId: null
        });
        await newUser.save();
        res.json({ message: "Berhasil melakukan registrasi, silahkan login kembali" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

export async function updateUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.password === "google_oauth" || user.password === "facebook_oauth") {
            user.username = req.body.username;
            user.email = req.body.email;
            await user.save();
        } else {
            const match = await bcrypt.compare(req.body.oldpassword, user.password);
            if (!match) return res.status(401).json({ message: "Password lama salah" });

            if (req.body.password) {
                user.password = await bcrypt.hash(req.body.password, 10);
            }
            user.username = req.body.username;
            user.email = req.body.email;
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

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

        res.json({ message: "User updated successfully", token });
    } catch (err) {
        res.status(500).json({ message: "Error dalam melakukan update" });
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        await user.remove();
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error dalam menghapus user" });
    }
}

export async function editRole(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.role = req.body.role;
        await user.save();
        res.json({ message: "User role updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating user role" });
    }
}

