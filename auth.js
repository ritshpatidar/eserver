const jwt = require("jsonwebtoken")

module.exports=(req,res,next)=>{
    // var hToken = req.headers
    // console.log(hToken)
    try {
        const token= req.headers.authorization.split(" ")[1]
        // console.log(token)
        const decode=jwt.verify(token,'secret')
        req.userData=decode
        next()
    } catch (error) {
        res.status(401).json({
            error:"Invalid Token"
        })
    }

}