const mongoose = require("mongoose")

const postShema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
   
})

module.exports = mongoose.model("Post",postShema)