const mongoose = require("mongoose")

const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MON_URL)
console.log("Mongo URL:", process.env.MON_URL);

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }]
})

module.exports = mongoose.model("User",userSchema)