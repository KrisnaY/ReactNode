import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // your React app
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET, // change to env variable in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
    db.query(sql, [req.body.username, req.body.password], (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (result.length > 0) {
            req.session.user = result[0]; // store user in session
            return res.json({ message: "Login successful", user: result[0] });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    })
})
// app.post('/login', (req, res) => {
//     const sql = "SELECT * FROM user WHERE username = ? AND password = ?";

//     db.query(sql, [req.body.username, req.body.password], (err, result) => {
//         if(err) return res.json("Login Failed");
//         return res.json(result);
//     })
// })

app.get('/check-session', (req, res) => {
    if (req.session.user) {
        return res.json({ loggedIn: true, user: req.session.user });
    } else {
        return res.json({ loggedIn: false });
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.clearCookie('connect.sid');
        return res.json({ message: "Logged out" });
    })
})

app.post('/user', (req, res) => {
    const sql = "CALL insertUser(?)";
    const values = [
        req.body.username,
        req.body.email,
        req.body.password
    ]
    db.query(sql, [values], (err, results) => {
        if(err) return res.json(err);
        return res.json(results);
    })
})

app.post('/register', (req, res) => {
    const sql = "CALL insertUser(?)";
    const value = [req.body.username, req.body.email, req.body.password];

    db.query(sql, [value], (err, result) => {
        if(err) return res.json(err);
        return res.json(result);
    })
})

app.get('/get/:id', (req, res) => {
    const sql = "CALL getUser(?)";
    const id = req.params.id

    db.query(sql, [id], (err, result) => {
        if(err) return res.json({Message: "Error in Server"});
        return res.json(result);
    })
})

app.put('/update/:id', (req, res) => {
    const sql = "CALL editUser(?, ?, ?, ?)"
    const id = req.params.id;
    db.query(sql, [req.body.username, req.body.email, req.body.password, id], (err, result) => {
        if(err) return res.json({Message: "error inside server"});
        return res.json(result);
    })
})

app.get('/', (req, res) => {
    const sql = "CALL selectAll()";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);  
    })
})

app.delete('/delete/:id', (req, res) => {
    const sql = "CALL deleteUser(?)"
    const id = req.params.id;
    db.query(sql, [id], (err, result) => {
        if(err) return res.json(err);
        return res.json(result);
    })
})

app.listen(8000, () => {
    console.log(`Listening...`)
})