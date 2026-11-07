const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const port = 3000;
const UserModel = require('./model/user');
const PostModel = require('./model/post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs")


app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/signup', async (req, res) => {
    try {
        const username = req.body.username || req.body.name;
        const { password, age, email } = req.body;
        const findUser = await UserModel.findOne({ email: email });

        if (findUser) return res.status(400).send("User already exists");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = await UserModel.create({
            username,
            password: hash,
            age,
            email
        });

        const token = jwt.sign(
            { email, USERID: newUser._id },
            process.env.USER_SEC
        );

        res.cookie("token", token, {
            httpOnly: true
        });

        res.redirect("/login");
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).send("Internal server error");
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email: email });

        if (!user) return res.status(400).send("User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect("/login");
        }

        const token = jwt.sign(
            { email: user.email, USERID: user._id },
            process.env.USER_SEC
        );

        res.cookie("token", token, {
            httpOnly: true,
        });

        res.status(200).send("you can log in");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Internal server error");
    }
});









app.listen(port,()=>{
    console.log(`you'r app is successfuly run on ${port}`);
})