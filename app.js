const express = require("express")
const app = new express()
const userModel= require("./database_files/user")
const jwt = require("jsonwebtoken")
const checkAuth = require("./auth")
const port=process.env.PORT || 3000

//app.use(express.json())
app.use(express.urlencoded({extended:false}))

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
            }else{
                console.log("Result :", doc) // false
                if(doc === null){
                        const user = new userModel({
                                username:username,
                                email:email,
                                pswd:pswd,
                                confirm_password: confirm_password,
                                courses_enrolled:[]
                        })

                        console.log("userrrrr");
                        console.log(user);
                    
                        user.save()
                        .then(doc=>{
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
                                    message:"User Registered Successfully",
                                    results:{user: doc, token: token}
                                })
                        })
                        .catch(err=>{
                                console.log(err);
                                res.status(500).json({
                                    message:"User may already exists",
                                })
                        })
                } else {
                    res.status(403).json({
                        message:"User already exists",
                    })
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
                                expiresIn:"5h"
                            }
                        )
                        res.status(201).json({
                            message:"User Found",
                            token:token
                        })
                        return
                     }
                     else{
                        res.status(404).json({
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
    res.json({success: true, user: req.userData});
})

app.listen(port,()=>{
    console.log(`Server is runninng at Port no ${port}`)
})