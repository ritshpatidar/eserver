const {mongoose} = require("./connection");

const User = new mongoose.Schema({
    username:{
        type:String
    },
    email:{
        type:String
    },
    pswd:{
        type:String,
    },
    confirm_password:{
        type:String,
    },
    courses_enrolled:[]
});

const userModel = new mongoose.model("users",User);

module.exports= userModel;