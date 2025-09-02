import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from 'jsonwebtoken'
import { Strategy as FacebookStrategy } from 'passport-facebook';
const saltRounds = 10

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://myapp.com',
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Tidak ada token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalid or expired" });

    db.query("CALL getToken(?)", [decoded.id], (err, result) => {
      if (err) return res.status(500).json({ message: "error" });
      if (result.length === 0) return res.status(401).json({ message: "User tidak ditemukan" });

      if (result[0].token !== token) {
        return res.status(401).json({ message: "Token tidak sesuai, silahkan login kembali" });
      }

      req.user = decoded;
      next();
    });
  });
}

app.get('/books/:id', verifyToken, (req, res) => {
    const sql = "CALL selectBarang(?)";
    const id = req.params.id;

    db.query(sql, [id], (err, result) => {
        if(err) return res.json(err);

        const encryptedPayload = jwt.sign(
            { data: result[0] }, 
            process.env.JWT_SECRET, 
            { expiresIn: "5m" }
        );

        return res.json({token : encryptedPayload})
    })
})

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://api.myapp.com/auth/facebook/callback", 
    profileFields: ['emails', 'name']
  }, (accessToken, refreshToken, profile, cb) => {
        const fbId = profile.id;
        const email = profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `fb_${fbId}@facebook.com`;
        const username = profile.name
            ? `${profile.name.givenName || ""} ${profile.name.familyName || ""}`.trim()
            : "Facebook User";

        const checkSql = "CALL fbCheck(?, ?)";
        db.query(checkSql, [fbId, email], (err, result) => {
        if (err) return cb(err, null);

        if (result.length === 0) {
            const insertSql = "CALL fbInsert(?, ?, ?, ?, ?)";
            db.query(insertSql, [username, email, "facebook_oauth", fbId, 1], (err, insertResult) => {
            if (err) return cb(err, null);
                return cb(null, { 
                    id: insertResult.insertId, 
                    email, 
                    username, 
                    role: 1 
                });
            });
        } else {
            return cb(null, { 
                id: result[0].id, 
                email: result[0].email, 
                username: result[0].username, 
                role: result[0].role 
            });
        }
    });
}));

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/', session: false }),
    (req, res) => {
        const token = jwt.sign(
        { id: req.user.id, email: req.user.email, username: req.user.username, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
        );

        db.query("CALL setToken(?, ?)", [token, req.user.id]);

        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 3600000 
        });

        res.redirect('http://myapp.com/?facebook=true');
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://api.myapp.com/auth/google/callback"
    }, (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const username = profile.displayName;
       
        const checkSql = "CALL googleCheck(?, ?)";
        db.query(checkSql, [email, googleId], (err, result) => {
            if (err) return done(err, null);

            if (result.length === 0) {
            const insertSql = "CALL googleInsert(?, ?, ?, ?, ?)";
            db.query(insertSql, [username, email, "google_oauth", googleId, 1], (err, insertResult) => {
                if (err) return done(err, null);
                return done(null, { 
                    id: insertResult.insertId, 
                    email, 
                    username,
                    role: 1 
                });
            });
            } else {
            return done(null, { 
                id: result[0].id, 
                email: email, 
                username: username, 
                role: result[0].role 
            });
            }
        });
    }
));

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, username: req.user.username, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    db.query("CALL setToken(?, ?)", [token, req.user.id], (err) => {
        if (err) console.error("Error saving token:", err);
    });

    res.cookie('token', token, { 
        httpOnly: true, 
        maxAge: 3600000 
    }); 

    res.redirect(`http://myapp.com/?google=true`);
  }
);

app.post('/login', (req, res) => {
    const sql = "CALL loginUser(?)";
    const password = req.body.password.toString();

    db.query(sql, [req.body.username], (err, result) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (result.length === 0) {
            return res.status(404).json({ loggedIn: false, message: "User tidak ditemukan" });
        }

        if(result[0].googleId && result[0].password === "google_oauth"){
            return res.status(400).json({ message: "User ini terdaftar melalui Google OAuth. Silakan gunakan Google Login." });
        }
        if(result[0].googleId && result[0].password === "google_oauth"){
            return res.status(400).json({ message: "User ini terdaftar melalui Google OAuth. Silakan gunakan Google Login." });
        }
        // console.log(result)
        bcrypt.compare(password, result[0].password, (error, response) => {
            if (error) return res.status(500).json({ error });
            if (response) {
                const token = jwt.sign(
                { id: result[0].id, username: result[0].username, email: result[0].email, role: result[0].role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
                );

                db.query("UPDATE user SET token = ? WHERE id = ?", [token, result[0].id], (updateErr) => {
                    if (updateErr) return res.status(500).json({ message: "Error saving token" });
                    res.cookie("token", token, { httpOnly: true});
                    res.json({ message: "Login success", token });
                })
            } else {
                return res.status(401).json({ message: "Password salah" });
            }
        });
    });
});

app.get("/verify", verifyToken, (req, res) => {
  res.json({ token: req.cookies.token });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.clearCookie('token');
        return res.json({ message: "Logged out" });
    })
})

app.post('/user', verifyToken, (req, res) => {
    const sql = "CALL insertUser(?, ?, ?)";
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err){
            res.send({err : err});
        }
        db.query(sql, [req.body.username, req.body.email, hash], (err, results) => {
            if(err) return res.json(err);
            return res.json({message : "Berhasil memasukan user"})
        })
    })
    
})

app.post('/barang', verifyToken, (req, res) => {
    const sql = "CALL insertBarang(?, ?, ?)";
    const token = req.headers["x-access-token"];

    jwt.verify(token, process.env.JWT_SECRET,(err, decode) => {
        if(err) return res.status(403).json({message : "Tidak ada token atau token invalid"});
        const id = decode.id;
        db.query(sql, [req.body.namaBarang, req.body.jmlBarang, id], (err, results) => {
            if(err) res.json(err);
            return res.json({message : "Berhasil memasukan barang"})
        });
    })
})

app.post('/register', (req, res) => {
    const sql = "CALL insertUser(?, ?, ?)";
    // const value = [];
    const password = req.body.password.toString();
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err){
            console.log(err);
        }
        
        db.query(sql, [req.body.username, req.body.email, hash], (err, result) => {
            if(err) res.send(err);
            res.send(result);
        })
    });
})

app.put('/updateRole/:id', verifyToken, (req, res) => {
    const sql = "CALL roleUpdate(?, ?)";

    db.query(sql, [req.params.id, req.body.role], (err, result) => {
        if(err) return res.status(500).json({Message : "Error dalam melakukan update"})
        return res.json({message: "berhasil mengupdate data"})
    })
})

app.put('/updateBarang/:id', verifyToken, (req, res) => {
    const sql = "CALL editBarang(?, ?, ?)";

    db.query(sql, [req.params.id, req.body.namaBarang, req.body.jmlBarang], (err, result) => {
        if(err) return res.status(500).json({Message : "Error dalam melakukan update barang"})
        return res.json({Message : "Berhasil mengupdate barang"})
    })
})

app.put('/update/:id', verifyToken, (req, res) => {
    const sqlUpdate = "CALL editUser(?, ?, ?, ?)";
    const sqlCheck = "CALL getUser(?)";

    db.query(sqlCheck, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ Message: "Error in Server" });

        const oldData = result[0];
        if (!oldData) {
            return res.status(404).json({ Message: "Tidak menemukan user" });
        }

        const oldPass = oldData[0].password;
        
        if (oldData[0].password === "google_oauth" || oldData[0].password === "facebook_oauth") {
            db.query(sqlUpdate, [req.body.username, req.body.email, oldData[0].password, req.params.id], (err) => {
                if (err) return res.status(500).json({ Message: "Error mengupdate data OAuth" });
                return res.json({ Message: "Berhasil mengupdate data OAuth user (tanpa password)" });
            });
            return;
        }
        
        bcrypt.compare(req.body.oldpassword, oldPass, (err, match) => {
            if (err) return res.status(500).json({ Message: "Error dalam pengecekan password lama" });
            if (!match) return res.status(401).json({ Message: "Password lama salah" });

            if (req.body.password !== "") {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (err) return res.status(500).json({ Message: "Error dalam melakukan hashing" });

                    db.query(sqlUpdate, [req.body.username, req.body.email, hash, req.params.id], (err) => {
                        if (err) return res.status(500).json({ Message: "Error mengupdate data" });
                        return res.json({ Message: "Berhasil mengupdate data dengan password baru" });
                    });
                });
            } else {    
                db.query(sqlUpdate, [req.body.username, req.body.email, oldPass, req.params.id], (err) => {
                    if (err) return res.status(500).json({ Message: "Error mengupdate data" });
                    return res.json({ Message: "Berhasil mengupdate data tanpa ganti password" });
                });
            }
        });

    });
});

app.get('/', verifyToken, (req, res) => {
    const sql = "CALL selectAll()";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);

        const encryptedPayload = jwt.sign(
            { data: data }, 
            process.env.JWT_SECRET, 
            { expiresIn: "5m" }
        );

        return res.json({token : encryptedPayload})
    })
})

app.delete('/delete/:id', verifyToken, (req, res) => {
    const sql = "CALL deleteUser(?)"
    const id = req.params.id;
    db.query(sql, [id], (err, result) => {
        if(err) return res.json(err);
        return res.json({message: "berhasil melakukan delete data"});
    })
})

app.delete('/deleteBarang/:id', verifyToken, (req, res) => {
    const sql = "CALL deleteBarang(?)"
    const id = req.params.id;

    db.query(sql, [id], (err, result) => {
        if(err) return res.json(err);
        return res.json({message: "Berhasil melakukan delete barang"})
    })
})

app.listen(8000, () => {
    console.log(`Listening...`)
})