import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const saltRounds = 10;

function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

export async function registerUser(req, res) {
    try {
        const { username, email, password, confirm} = req.body;
        console.log(req.body);
        if (!username || !email || !password || !confirm) {
            return res.status(400).json({ message: "Semua field harus diisi" });
        }
        console.log(password, confirm);
        if (password.toString() !== confirm.toString()) {
            return res.status(400).json({ message: "Password tidak sama" });
        }
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username atau email sudah ada" });
        }
        const pass = password.toString();
        const hashedPassword = await bcrypt.hash(pass, saltRounds);
        const newUser = new User({ username: username.toString(), email: email.toString(), password: hashedPassword, role: 1 });
        await newUser.save();
        res.status(201).json({ message: "Berhasil melakukan registrasi, silahkan login kembali" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error during registration", error });
    }
}

export async function addUser(data) {
    const hash = await bcrypt.hash(data.password, saltRounds);
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

export async function googleCb(req, res) {
    try {
        const user = req.user;
        const token = generateToken(user);

        user.token = token;
        await user.save();

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.redirect(process.env.CLIENT_URL + "/?google=true");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error during Google login", error });
    }
}

export async function facebookCb(req, res) {
    try {
        const user = req.user;
        const token = generateToken(user);

        user.token = token;
        await user.save();

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.redirect(process.env.CLIENT_URL + "/?facebook=true");
    } catch (error) {
        res.status(500).json({ message: "Error during Facebook login", error });
    }
}

export async function login(req, res) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        if (user.password === "google_oauth" || user.password === "facebook_oauth") {
            return res.status(400).json({ message: "Gunakan Google/Facebook login" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Password salah" });

        const token = generateToken(user);

        user.token = token;
        await user.save();

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.json({ message: "Login berhasil", token });
    } catch (err) {
        res.status(500).json({ message: "Error during login", err });
    }
}

/* Google Login */
