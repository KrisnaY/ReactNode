import express from "express";;
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv'
import { addUser, deleteUser, editRole, getAllUser, updateUser } from "../controller/userController.js";
import { addBarang, deleteBarang, getBarangById, updateBarang } from "../controller/barangController.js";
import { facebookCb, googleCb, login } from "../controller/loginController.js";
import User from "../models/user.js";

const router = express.Router();

dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({ message: "Tidak ada token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token invalid or expired", redirect: "/" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "user tidak ditemukan", redirect: "/" });
    }
    if (user.token !== token) {
      return res.status(401).json({ message: "Token berbeda, silahkan lakukan login", redirect: "/" });
    }
    req.user = decoded;
    next();
  });
};

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = new User({
        username: profile.displayName,
        email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
        password: "google_oauth",
        role: 1,
        token: null,
        googleId: profile.id,
        facebookId: null
    });
    console.log(user);
    await user.save();
  }
  return done(null, user);
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_ID,
  callbackURL: "/auth/facebook/callback",
  profileFields: ["id", "displayName", "emails"]
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ facebookId: profile.id });
  if (!user) {
    user = new User({
      username: profile.displayName,
      email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
      password: "facebook_oauth",
      role: 1,
      token: null,
      googleId: null,
      facebookId: profile.id
    });
    await user.save();
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user.id || user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        // Use your User model to find the user by id
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

router.post('/login', login);

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleCb
);

router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get("/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  facebookCb
);

router.get("/verify", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token" });
  res.json({ token });
});

router.get('/', getAllUser);
router.post('/user', verifyToken, addUser);
router.put('/update/:id', verifyToken, updateUser);
router.get('/books/:id', verifyToken, getBarangById);
router.delete('/deleteBarang/:id', verifyToken, deleteBarang);
router.post('/barang', verifyToken, addBarang);
router.put('/updateBarang/:id', verifyToken, updateBarang);
router.put('/updateRole/:id', verifyToken, editRole);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/logout', (req, res) => {
    req.user = null;
    res.clearCookie('token');
    // localStorage.removeItem('token');
    return res.json({ message: "Logged out" });
});

export default router;