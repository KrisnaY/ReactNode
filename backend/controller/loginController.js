import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function googleCb(req, res) {
    try{
        const user = req.user;
        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        user.token = token;
        console.log(user);
        await user.save();
    
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.redirect(process.env.CLIENT_URL + "/?google=true");
    } catch (error) {
        res.status(500).json({ message: "Error during Google login", error });
    }
}

export async function facebookCb(req, res) {
    async (req, res) => {
        try{
            const user = req.user;
            const token = await jwt.sign(
                { id: user._id, email: user.email, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            user.token = token;
            await user.save();
        
            res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
            res.redirect(process.env.CLIENT_URL + "/?facebook=true");
        } catch (error) {
            res.status(500).json({ message: "Error during Facebook login", error });
        }
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

        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        user.token = token;
        await user.save();

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.json({ message: "Login berhasil", token });
    } catch (err) {
            res.status(500).json({ message: "Error during login", err });
    }
}

/* Google Login */
