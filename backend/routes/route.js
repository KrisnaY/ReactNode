import express from "express";
import mysql from 'mysql';
import bcrypt from 'bcrypt';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv'
import { addUser, editRole, getAllUser, updateUser } from "../controller/userController.js";
import { addBarang, deleteBarang, getBarangById } from "../controller/barangController.js";
import { login } from "../controller/loginController.js";
import User from "../models/user.js";
import Barang from "../models/barang.js";

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

router.post('/login', login);
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

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
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
  }
);

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

router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get("/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  async (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    user.token = token;
    await user.save();

    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    res.redirect(process.env.CLIENT_URL + "/?facebook=true");
  }
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
router.put('/updateRole/:id', verifyToken, editRole);


// router.get('/books/:id', verifyToken, (req, res) => {
//     const sql = "CALL selectBarang(?)";
//     const id = req.params.id;

//     db.query(sql, [id], (err, result) => {
//         if(err) return res.json(err);

//         const encryptedPayload = jwt.sign(
//             { data: result[0] }, 
//             process.env.JWT_SECRET, 
//             { expiresIn: "5m" }
//         );

//         return res.json({encryptedPayload})
//     })
// })

// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:8000/auth/facebook/callback", 
//     profileFields: ['emails', 'name']
//   }, (accessToken, refreshToken, profile, cb) => {
//         const fbId = profile.id;
//         const email = profile.emails && profile.emails.length > 0
//             ? profile.emails[0].value
//             : `fb_${fbId}@facebook.com`;
//         const username = profile.name
//             ? `${profile.name.givenName || ""} ${profile.name.familyName || ""}`.trim()
//             : "Facebook User";

//         const checkSql = "CALL fbCheck(?, ?)";
//         db.query(checkSql, [fbId, email], (err, result) => {
//         if (err) return cb(err, null);

//         if (result[0].length === 0) {
//             const insertSql = "CALL fbInsert(?, ?, ?, ?, ?)";
//             db.query(insertSql, [username, email, "facebook_oauth", fbId, 1], (err, insertResult) => {
//             if (err) return cb(err, null);
//                 return cb(null, { 
//                     id: insertResult[0][0].insertId, 
//                     email, 
//                     username, 
//                     role: 1 
//                 });
//             });
//         } else {
//             return cb(null, { 
//                 id: result[0][0].id, 
//                 email: result[0][0].email, 
//                 username: result[0][0].username, 
//                 role: result[0][0].role 
//             });
//         }
//     });
// }));

// router.get('/auth/facebook',
//   passport.authenticate('facebook'));

// router.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/', session: false }),
//     (req, res) => {
//         const user = req.user;
//         const token = jwt.sign(
//             { id: user.id, email: user.email, username: user.username, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: "1h" }
//         );

//         db.query("CALL setToken(?,?)", [token, user.id], (err) => {
//             if (err) console.error("Error saving facebook token:", err);
//         });

//         res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
//         res.redirect('http://localhost:3000/?facebook=true');
// });

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "http://localhost:8000/auth/google/callback"
//     }, (accessToken, refreshToken, profile, done) => {
//         const email = profile.emails[0].value;
//         // console.log(email);
//         const googleId = profile.id;
//         // console.log(googleId);
//         const username = profile.displayName;
       
//         const checkSql = "CALL googleCheck(?, ?)";
//         db.query(checkSql, [email, googleId], (err, result) => {
//             if (err) return done(err, null);
        
//             if (result[0].length === 0) {
//                 const insertSql = "CALL googleInsert(?, ?, ?, ?, ?)";
//                 db.query(insertSql, [username, email, "google_oauth", googleId, 1], (err, insertResult) => {
//                     if (err) return done(err, null);
//                     // console.log(insertResult);
//                     return done(null, { 
//                         id: insertResult[0][0].id, 
//                         email: email, 
//                         username: username,
//                         role: 1 
//                     });
//                 });
//             } else {
//                 // console.log(result[0][0].id)
//                 return done(null, { 
//                     id: result[0][0].id, 
//                     email: result[0][0].email, 
//                     username: result[0][0].username, 
//                     role: result[0][0].role 
//             });
//             }
//         });
//     }
// ));

// router.get("/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get("/auth/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const user = req.user;
//     console.log(user);
//     // console.log(req.user);
//     // console.log(res.user);
//     const token = jwt.sign(
//         { id: user.id, email: user.email, username: user.username, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//     );

//     db.query("CALL setToken(?,?)", [token, user.id], (err) => {
//      if (err) console.error("Error saving Google token:", err);
//     });

//     res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
//     res.redirect(`http://localhost:3000/?google=true`);
//   }
// );

// router.post("/login", (req, res) => {
//     const { username, password } = req.body;
//     const sql = "CALL loginUser(?)";
//     // console.log(username)  

//     db.query(sql, [username], (err, result) => {
//         if (err) return res.status(500).json({ message: "Server error" });
//         if (result.length === 0) {
//         return res.status(404).json({ message: "User tidak ditemukan" });
//         }

//         const user = result[0][0];
//         // console.log(password);

//         if (user.password === "google_oauth" || user.password === "facebook_oauth") {
//             return res.status(400).json({ message: "Gunakan Google/Facebook login" });
//         } 

//         bcrypt.compare(password, user.password, (err, match) => {
//             if (err) return res.status(500).json({ message: "Error checking password" });
//             if (!match) return res.status(401).json({ message: "Password salah" });

//             const token = jwt.sign(
//                 { id: user.id, email: user.email, username: user.username, role: user.role },
//                 process.env.JWT_SECRET,
//                 { expiresIn: "1h" }
//             );

//             db.query("UPDATE user SET token = ? WHERE id = ?", [token, user.id], (updateErr) => {
//                 if (updateErr) return res.status(500).json({ message: "Error saving token" });

//                 res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
//                 res.json({ message: "Login berhasil", token });
//             });
//         });
//     });
// });

// router.post('/logout', (req, res) => {
//     req.session.destroy(err => {
//         if (err) return res.status(500).json({ message: "Logout failed" });
//         res.clearCookie('token');
//         return res.json({ message: "Logged out" });
//     })
// })

// router.post('/user', verifyToken, (req, res) => {
//     const sql = "CALL insertUser(?, ?, ?)";
//     const password = req.body.password;

//     bcrypt.hash(password, saltRounds, (err, hash) => {
//         if(err){
//             res.send({err : err});
//         }
//         db.query(sql, [req.body.username, req.body.email, hash], (err, results) => {
//             if(err) return res.json(err);
//             return res.json({message : "Berhasil memasukan user"})
//         })
//     })
    
// })

// router.post('/barang', verifyToken, (req, res) => {
//     const sql = "CALL insertBarang(?, ?, ?)";
//     const token = req.headers["x-access-token"];

//     jwt.verify(token, process.env.JWT_SECRET,(err, decode) => {
//         if(err) return res.status(403).json({message : "Tidak ada token atau token invalid"});
//         const id = decode.id;
//         db.query(sql, [req.body.namaBarang, req.body.jmlBarang, id], (err, results) => {
//             if(err) res.json(err);
//             return res.json({message : "Berhasil memasukan barang"})
//         });
//     })
// })

// router.post('/register', (req, res) => {
//     const sql = "CALL insertUser(?, ?, ?)";
//     // const value = [];
//     const password = req.body.password.toString();
//     bcrypt.hash(password, saltRounds, (err, hash) => {
//         if(err){
//             console.log(err);
//         }
        
//         db.query(sql, [req.body.username, req.body.email, hash], (err, result) => {
//             if(err) res.send(err);
//             res.send(result);
//         })
//     });
// })

// router.put('/updateRole/:id', verifyToken, (req, res) => {
//     const sql = "CALL roleUpdate(?, ?)";

//     db.query(sql, [req.params.id, req.body.role], (err, result) => {
//         if(err) return res.status(500).json({Message : "Error dalam melakukan update"})
//         return res.json({message: "berhasil mengupdate data"})
//     })
// })

// router.put('/updateBarang/:id', verifyToken, (req, res) => {
//     const sql = "CALL editBarang(?, ?, ?)";

//     db.query(sql, [req.params.id, req.body.namaBarang, req.body.jmlBarang], (err, result) => {
//         if(err) return res.status(500).json({Message : "Error dalam melakukan update barang"})
//         return res.json({Message : "Berhasil mengupdate barang"})
//     })
// })

// router.put('/update/:id', verifyToken, (req, res) => {
//     const sqlUpdate = "CALL editUser(?, ?, ?, ?)";
//     const sqlCheck = "CALL getUser(?)";

//     db.query(sqlCheck, [req.params.id], (err, result) => {
//         if (err) return res.status(500).json({ Message: "Error in Server" });

//         const oldData = result[0];
//         if (!oldData) {
//             return res.status(404).json({ Message: "Tidak menemukan user" });
//         }

//         const oldPass = oldData[0].password;
        
//         if (oldData[0].password === "google_oauth" || oldData[0].password === "facebook_oauth") {
//             db.query(sqlUpdate, [req.body.username, req.body.email, oldData[0].password, req.params.id], (err) => {
//                 if (err) return res.status(500).json({ Message: "Error mengupdate data OAuth" });
//                 return res.json({ Message: "Berhasil mengupdate data OAuth user (tanpa password)" });
//             });
//             return;
//         }
        
//         bcrypt.compare(req.body.oldpassword, oldPass, (err, match) => {
//             if (err) return res.status(500).json({ Message: "Error dalam pengecekan password lama" });
//             if (!match) return res.status(401).json({ Message: "Password lama salah" });

//             if (req.body.password !== "") {
//                 bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
//                     if (err) return res.status(500).json({ Message: "Error dalam melakukan hashing" });

//                     db.query(sqlUpdate, [req.body.username, req.body.email, hash, req.params.id], (err) => {
//                         if (err) return res.status(500).json({ Message: "Error mengupdate data" });
//                         return res.json({ Message: "Berhasil mengupdate data dengan password baru" });
//                     });
//                 });
//             } else {    
//                 db.query(sqlUpdate, [req.body.username, req.body.email, oldPass, req.params.id], (err) => {
//                     if (err) return res.status(500).json({ Message: "Error mengupdate data" });
//                     return res.json({ Message: "Berhasil mengupdate data tanpa ganti password" });
//                 });
//             }
//         });

//     });
// });

// router.get('/', verifyToken, (req, res) => {
//     const sql = "CALL selectAll()";
//     db.query(sql, (err, data) => {
//         if(err) return res.json(err);

//         const encryptedPayload = jwt.sign(
//             { data: data }, 
//             process.env.JWT_SECRET, 
//             { expiresIn: "5m" }
//         );

//         return res.json({encryptedPayload})
//     })
// })

// router.delete('/delete/:id', verifyToken, (req, res) => {
//     const sql = "CALL deleteUser(?)"
//     const id = req.params.id;
//     db.query(sql, [id], (err, result) => {
//         if(err) return res.json(err);
//         return res.json({message: "berhasil melakukan delete data"});
//     })
// })

// router.delete('/deleteBarang/:id', verifyToken, (req, res) => {
//     const sql = "CALL deleteBarang(?)"
//     const id = req.params.id;

//     db.query(sql, [id], (err, result) => {
//         if(err) return res.json(err);
//         return res.json({message: "Berhasil melakukan delete barang"})
//     })
// })

export default router;