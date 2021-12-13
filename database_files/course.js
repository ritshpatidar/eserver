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
    course_file: {
        type: String
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