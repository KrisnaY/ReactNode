import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import router from './routes/route.js'
import { connectDB } from './config/db.js'
import passport from 'passport'
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});

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

connectDB(process.env.DB_CONN);

app.use("", router );

server.listen(process.env.PORT, () => {
    console.log(`Listening...`)
})