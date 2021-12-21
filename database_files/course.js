const {mongoose} = require("./connection");

const Course = new mongoose.Schema({
    active:{
        type:Boolean
    },
    name:{
        type:String
    },
    image:{
        type:String
    },
    duration: {
        type: Number
    },
    students_enrolled:[],
    category: {type: String},
    content: [
        {
            module_name:{type: String},
            video_link:{type: String},
            module_file: {type: String },
        }
    ]
});

const courseModel = new mongoose.model("courses",Course);

module.exports= courseModel;