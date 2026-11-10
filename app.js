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
const isloggin = require("./middleware/isLogging")

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs")


app.get('/',(req,res)=>{
    res.render('login');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/signup',(req,res)=>{
    res.render('index');
})

app.get('/logout',(req,res)=>{
    const token = req.cookies
    res.cookie("token", "", {
            httpOnly: true,
    });
    res.redirect("/login")
})

app.get("/profile", isloggin , async(req,res)=>{
    let user = await UserModel.findOne({email:req.user.email}).populate("posts")
    res.render("profile",{user})
})

// Creating Post's

app.get("/like/post/:id", isloggin, async (req, res) => {
    try {
        let post = await PostModel.findOne({_id: req.params.id}).populate("user");

        if (!post) {
            return res.status(404).send("Post not found");
        }

        if(post.like.indexOf(req.user.userId) === -1){
            post.like.push(req.params.id);
        }else{
            post.like.splice(post.like.indexOf(req.user.userId) ,1);
        }
         await post.save();
        res.redirect("/profile");

    } catch (err) {
        console.log(err);
        res.status(500).send("Like failed");
    }
});

app.post("/create/post", isloggin ,async(req,res)=>{
    let user = await UserModel.findOne({email:req.user.email})
    const {content,title} = req.body
    let post = await PostModel.create({
        user: user._id,
        content,
        title,
    })

    user.posts.push(post._id)
    await user.save();
    res.redirect("/profile")

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

        res.redirect("/profile")
        
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Internal server error");
    }
});


app.listen(port,()=>{
    console.log(`you'r app is successfuly run on ${port}`);
})