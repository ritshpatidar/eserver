const {mongoose} = require("./connection");

const Course = new mongoose.Schema({
    active:{
        type:Boolean,
        index:{
            unique:true
        }
    },
    name:{
        type:String,
        index:{
            unique:true
        }
    },
    image:{
        type:String,
    },
    students_enrolled:[],
    content: [
        {
            topic_name:{type: String},
            video_link:{type: String}
        }
    ]
});

const courseModel = new mongoose.model("courses",Course);

module.exports= courseModel;