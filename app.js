const express = require("express");
const app = new express();
const userModel= require("./database_files/user");
const courseModel = require("./database_files/course");
const jwt = require("jsonwebtoken");
var cors = require('cors');
const multer = require("multer");
const checkAuth = require("./auth");
const port=process.env.PORT || 3000;

//app.use(express.json())
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.static(`${__dirname}/public`));

app.get('/',(req,res)=>res.send("Welcome to our App!!!!!"))

app.post('/signup',(req,res)=>{

    const username=req.body.username
    const email=req.body.email
    const pswd = req.body.pswd
    const confirm_password = req.body.confirm_password
    console.log(req.body);

    if(pswd !== confirm_password){
        res.status(403).json({
            message:"Confirm Password not Matched",
        })
    }else{
        userModel.findOne({username:username}, function (err, doc) {
            if (err){
                console.log("Error in findone ---");
                console.log(err)
                res.sendStatus(500);
            }else{
                console.log("Result :", doc) // false
                if(!doc){
                        const user = {
                                username:username,
                                email:email,
                                pswd:pswd,
                                confirm_password: confirm_password,
                                courses_enrolled:[]
                        }

                        console.log("userrrrr");
                        console.log(user);
                        userModel.create(user,function(err,doc){
                            if (err){
                                console.log(err);
                                res.sendStaus(403);
                            } else{
                                console.log(doc)
                                const token=jwt.sign(
                                    {
                                        username:username,
                                    },
                                    'secret',
                                    {
                                        expiresIn:"5h"
                                    }
                                );
                                res.json({
                                    success:true,
                                    message:"User Registered Successfully",
                                    results:{user: doc, token: token}
                                })
                            }
                        });
                } else {
                    res.json({success:false, message:"User already exists"});
                }
            }
        });

    }
})

app.post('/login', (req,res)=>{

        const username=req.body.username
        const pswd = req.body.pswd

         userModel.find({username:username})
         .exec()
         .then(user=>{
             if(user.length<1){
                res.status(404).json({
                    message:"User not Found1",
                })
                return
             }
             else{
                    console.log(user);
                    console.log(pswd);
                    console.log(user[0].pswd)
                    if(pswd === user[0].pswd){
                         const token=jwt.sign(
                            {
                                username:user[0].username,
                            },
                            'secret',
                            {
                                expiresIn:"24h"
                            }
                        )
                        res.json({
                            success:true,
                            message:"User Found",
                            token:token
                        })
                        return
                     }
                     else{
                        res.json({
                            success:false,
                            message:"Wrong Password2",
                        })
                        return
                     }
            
                }
        })
        .catch(err=>{
            res.json({
                error:err
            })
        })
} )

app.get("/isLoggedIn", checkAuth, (req, res) => {
    res.json({success: true, message:"User found" ,user: req.userData});
});

//Multer
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public");
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${file.originalname}`);
    },
});
  
//Multer Filter
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.split('/')[1] === 'pdf'){
        cb(null,true)
    } else {
        cb(new Error('Not a PDF File!!!'),false)
    }
};
  
//calling a multer function
const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});


app.post("/api/admin/addCourse",checkAuth, upload.single("course_file"),(req,res)=>{
    console.log(req.file.filename);
    console.log(req.body);
    const course = new courseModel({
        active:req.body.active,
        name: req.body.name,
        image: req.body.image,
        course_file: req.file.filename,
        students_enrolled:JSON.parse(req.body.students_enrolled),
        content:JSON.parse(req.body.content)
    });
    

    courseModel.findOne({name:req.body.name}, function (err, doc) {
        if(err){
            res.sendStatus(500);
        } else {
            if(doc){
                res.json({
                    success:false,
                    message:"Course already exist",
                })
            } else {
                course.save()
                .then((doc)=>{
                    res.status(200).json({
                        success:true,
                        result: doc,
                        message: "Course created successfully!!",
                    });
                })
                .catch((err)=>{
                    res.status(500).json({
                        success:false,
                        message: "Internal server error"
                    });
                });

            }
        }
    });
})

app.get('/api/allCourses',checkAuth, (req,res)=>{
    courseModel
    .find()
    .select('name image')
    .exec()
    .then(data=>{
        res.json({
            success:true,
            message:"OK",
            results:data
        })
    })
    .catch(err=>{
        console.log(err);
        res.json({
            success:false,
            message:"Cannot find courses"
        });
    })
})

app.get('/api/getCourse/:id',checkAuth,async function(req,res){
    const id= req.params.id;
    try {
        const course= await courseModel.findById(id);
        if(course){
            res.json({
                results:course,
                success:true,
                message:"Course found"
            });
        } else {
            res.json({
                success:true,
                message:"Course not found"
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:"course not found"
        });
    }
 })

 // Delete a course Router
app.delete("/api/admin/deleteCourse/:id",checkAuth,(req,res)=>{
    courseModel.findOneAndRemove(req.params.id, function(err,docs){
        if(err){
            res.json({
                success:false,
                message:"Not able to delete"
            });
        } else {
            res.json({
                success:true,
                message:"Course deleted"
            });
        }
    });
})
  
/*app.get("/api/getFiles", async(req,res)=>{
    try{
      const files = await File.find();
      res.status(200).json({
        status:"success",
        files,
      });
    } catch(error){
      res.json({
        status:"Fail",
        error,
      });
    }
});*/

app.listen(port,()=>{
    console.log(`Server is runninng at Port no ${port}`)
})