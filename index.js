import express from "express"
import Bot from "./Bot.js"
import mongoose from "mongoose"
import authController from "./routes/authRoute.js"
import cors from "cors"
import bodyParser from "body-parser"
import User from "./schema/userSchema.js"

 
const app = express()
app.use(cors())
app.use(bodyParser.json())



  
Bot()

app.post("/returnJobFlag", (req, res) => {

    User.findOne({ username: req.body.body }).then(response => {
        console.log(response)
        console.log(req.body)
        if (response !== null) {
            res.status(200).json(response)
        }
 
        else res.status(201).send("error")
        
    }).catch(e=>console.log(e))
})
app.post("/register", authController)

app.post("/deleteProfile", async (req, res) => {
    console.log(req.body.body)
    const userfound = await User.findOne({ username: req.body.body })
    
if (userfound) {
    if (userfound.flag) {
        User.deleteOne({ username: req.body.body }).then(response => {
       
            if(response.deletedCount>0 )
                res.send("Sad to See you Go 😢")
            else res.send("Error Please Try Again!")
        }).catch(e=>{
            console.log(e)
        })
            
    }
    else res.send("Error Please Try Again!")
    }
    else res.send("Error Please Try Again!")
        

})

app.patch("/setFlag/:id", (req, res) => {
    const id = req.params.id

    User.updateOne({ username: req.body.body }, { $set: { flag: id } }).then(response => {
        console.log(response)
        if(response.modifiedCount>0 || response.acknowledged)
        res.status(200).send("changed")
    else res.status(201).send("Error Please Try Again!")
    })
})

app.patch("/setJobFlag/:id", (req, res) => {
    const id = req.params.id

    User.updateOne({ username: req.body.body }, { $set: { jobFlag: id } }).then(response => {
        console.log(response)
        if(response.modifiedCount>0 || response.acknowledged)
        res.status(200).send("changed")
    else res.status(201).send("Error Please Try Again!")
    })
})

app.patch("/setKeyWords", (req, res) => {

    User.updateOne({ username: req.body.body }, { $push: { keywords: req.body.key } }).then(response => {
        console.log(response)
        if(response.modifiedCount>0 || response.acknowledged)
        res.status(200).send("changed")
    else res.status(201).send("Error Please Try Again!")
    })
})

app.post("/getKeywords", (req, res) => {
    User.findOne({username:req.body.body}).select("keywords").then(response=>{
   
        if (response !== null) {
            console.log(response)
            res.json(response)
        }
        else res.status(201).send("Error! Please Try Again")
    })
})

app.patch("/Clear", (req, res) => {
    User.updateOne({ username: req.body.body }, { $set: { keywords: []} }).then(response => {
        console.log(response)
        if(response!==null) res.status(200).send("Cleared!")
    }).catch(e => {
        res.status(201).send("Keywords is Already Empty!")
    })
})


mongoose.connect(process.env.DB_URL, (err, data) => {
    if (!err) {
        console.log("db connected")
      
    }
    else console.log(err)
})

// app.listen(8443, () => {
//     console.log("Server is up")
// }) 