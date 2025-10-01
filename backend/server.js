import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
// import router from './routes/route.js'
import jwt from 'jsonwebtoken'
import User from './models/user.js'
import { getAllUser, addUser, updateUser, deleteUser, editRole } from './controller/userController.js'
import { getBarangById, addBarang, updateBarang, deleteBarang } from './controller/barangController.js'
import { connectDB } from './config/db.js'
import passport from 'passport'
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import router from './routes/route.js'
import { error } from 'console'

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});

function signPayload(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET);
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.set('io', io);

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

app.use(passport.initialize());
app.use(passport.session());

app.use("", router);

connectDB(process.env.DB_CONN);

io.use(async (socket, next) => {
    // JWT auth
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.token !== token) return next(new Error("Invalid token"));
        socket.user = user;
        next();
    } catch (err) {
        next(new Error("Auth error"));
    }
});

io.on('connection', (socket) => {
    socket.join(socket.user.id.toString());

    socket.on('getAllUser', async (cb) => {
        try {
            const users = await getAllUser();
            // console.log(users);
            cb({ success: true, users });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('addUser', async (data, cb) => {
        try {
            const newUser = await addUser(data);
            const payload = signPayload({ user: newUser });
            io.emit('newUser', payload);
            cb({ success: true, user: newUser });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('updateUser', async ({ id, data }, cb) => {
        try {
            const { user } = await updateUser(id, data);
            const payload = signPayload({ user });
            io.emit('updateUser', payload);
            cb({ success: true, payload });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('deleteUser', async (id, cb) => {
        try {
            const deleted = await deleteUser(id);
            const payload = signPayload(deleted);
            if (deleted) io.to(deleted.id).emit('deleteUser', payload);
            cb({ success: true });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('addBarang', async ({id, data}, cb) => {
        try {
            // console.log(data);
            const barang = await addBarang(id, data);
            const payload = signPayload({ barang });
            io.to(id).emit('newBarang', payload);
            cb({ success: true, barang });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('updateBarang', async ({ id, data }, cb) => {
        try {
            const barang = await updateBarang(id, data);
            const payload = signPayload({ barang });
            io.to(barang.userId.toString()).emit('updateBarang', payload);
            cb({ success: true, payload });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('deleteBarang', async (id, cb) => {
        try {
            const deleted = await deleteBarang(id);
            const payload = signPayload(deleted);
            if (deleted) io.to(deleted.userId.toString()).emit('deleteBarang', id);
            cb({ success: true, payload });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('getBarangById', async (id, cb) => {
        try {
            const barang = await getBarangById(id);
            cb({ success: true, barang });
        } catch (err) {
            // console.log(err);
            cb({ success: false, error: err.message });
        }
    });

    socket.on('editRole', async ({ id, role }, cb) => {
        try {
            const user = await editRole(id, role);
            const payload = signPayload({ user });
            io.emit('updateUser', payload);
            cb({ success: true, payload });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('editProfile', async ({ id, data }, cb) => {
        try {
            const { user, token } = await updateUser(id, data);
            const payload = signPayload({ user });
            io.emit('updateUser', payload);
            cb({ success: true, payload, token });
        } catch (err) {
            cb({ success: false, error: err.message });
        }
    });

    socket.on('logout', async (cb) => {
        try {
            if (socket.user) {
                socket.user.token = null;
                await socket.user.save();
            }
            cb({ success: true, message: "Logged out" });
        } catch (err) {
            cb({ success: false, error: 'Logout failed' });
        }
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Listening...`)
})