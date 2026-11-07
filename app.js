const express = require('express');
const app = express();
const port = 3000;
const UserModel = require('./model/user');
const PostModel = require('./model/post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();


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

app.post('/signup',async(req,res)=>{
    const {username,password,age,email} = req.body;
    const findUser = await UserModel.findOne({email:email});
    
    if(findUser) return res.status(500).send("User already exists");

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

})

app.post('/login',async(req,res)=>{
    const {email , password} = req.body;
    const user = await UserModel.findOne({email:email})

    if(!user) return res.status(500).send("User not found");

    bcrypt.campare(password, user.password , (err,result)=>{
        if(err) return res.status(500).send("Internal server error");
        if(result) {
            jwt.sign({email:email ,USERID:user._id},process.env.USER_SEC,(err,token)=>{
                if(err) return res.status(500).send("Internal server error");
                res.cookie("token",token,{
                    httpOnly:true,
                })
            })
            res.status(200).send("you can log in")
        }
        else{
            res.redirect("/login")
        }
    })
})





















app.listen(port,()=>{
    console.log(`you'r app is successfuly run on ${port}`);
})