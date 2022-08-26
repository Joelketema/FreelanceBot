import express from "express"
// import Bot from "./Bot.js"
import "dotenv/config"
import {Telegraf,Markup} from "telegraf"
import mongoose from "mongoose"
import authController from "./routes/authRoute.js"
import cors from "cors"
import bodyParser from "body-parser"
import User from "./schema/userSchema.js"

 
const app = express()
app.use(cors())
app.use(bodyParser.json())



const bot = new Telegraf(process.env.BOT_TOKEN)
    
const Buttons = Markup
.keyboard([
['®️ Register', '🔥 Select KeyWords','Your Keywords'],
['❌ Delete My Profile','👥 Share', '📞 Feedback'],['❌ Clear Your Keywords']])
    .resize() 

const JobButtons = Markup
.keyboard(['Done'])
    .resize() 

bot.start((ctx) => {
console.log(ctx.chat)
    
    return(
        ctx.reply(`Welcome! ${ctx.chat.username}`, Buttons))

})


bot.hears("®️ Register", (ctx) => {

    axios.post(`${process.env.BASE_URL}/register`, {
        body: (ctx.chat.id).toString(),
        name:ctx.chat.username
    }).then(res => {
        ctx.reply(res.data)
    }).catch(e => {
        ctx.reply("An Error Occured! Please Try Again!")
         console.log(e)
    })
    

})



bot.hears("🔥 Select KeyWords", (ctx) => {


    axios.patch(`${process.env.BASE_URL}/setJobFlag/true`, {
        body: (ctx.chat.id).toString()
    }).then(res => {
        if (res.status === 200) {
            ctx.reply("Send Me Titles and Click Done!", JobButtons)
        }
    }).catch(e => {
        ctx.reply("An Error Occured! Please Try Again!")
         console.log(e)
    })
    

})

bot.hears("❌ Delete My Profile", (ctx) => {

    axios.patch(`${process.env.BASE_URL}/setFlag/true`, {
        body: (ctx.chat.id).toString()
    }).then(res => {
    
        if (res.status === 200) {
            
            ctx.reply("Are you Sure you want to Delete Your Account?",Markup
            .keyboard(['/Yes', '/No'])
            .oneTime()
                .resize()
            )        
        }
        else ctx.reply(res.data)

    }).catch(e=>{
        console.log(e)
    })

   
})

bot.hears("❌ Clear Your Keywords", (ctx) => {

    axios.patch(`${process.env.BASE_URL}/Clear`, {
        body: (ctx.chat.id).toString()
    }).then(res => {
    
        if (res.status === 200) {
            ctx.reply("Cleared!")
        }
        else ctx.reply(res.data)

    }).catch(e=>{
        console.log(e)
    })

   
})

bot.hears("/No", (ctx) => {
   
    axios.patch(`${process.env.BASE_URL}/setFlag/false`, {
        body: (ctx.chat.id).toString()
    }).then(response => {
        console.log(response)
        if(response.status === 200)
            ctx.reply("Cancelled!", Buttons)   
        else ctx.reply("Sorry an Error Occured!")
    })
})

bot.hears("/Yes", (ctx) => {

        axios.post(`${process.env.BASE_URL}/deleteProfile`, {
        body: (ctx.chat.id).toString()
    }).then(res => {
        ctx.reply(res.data,Buttons)

    }).catch(e=>{
        console.log(e)
    })
})

bot.hears("Done", (ctx) => {

    axios.patch(`${process.env.BASE_URL}/setJobFlag/false`, {
    body: (ctx.chat.id).toString()
}).then(res => {
    ctx.reply("Done",Buttons)

}).catch(e=>{
    console.log(e)
})
})

bot.hears("Your Keywords", (ctx) => {
    
    axios.post(`${process.env.BASE_URL}/getKeywords`, {
        body: (ctx.chat.id).toString()
    }).then(res => {
        if (res.status !== 201) {
            var output = ""

            res.data.keywords?.forEach(d => {
                output+=`\n${d}\n`
            })
            ctx.reply(`Your Keywords 🚀\n\n${output}`)
        }
        else ctx.reply("Error, Please Try Again!")

}).catch(e=>{
    console.log(e)
})
})

bot.hears("📞 Feedback", (ctx) => {
    ctx.reply("contact @idktbhtf")
    })


bot.use((ctx) => { 
    console.log('here3')
    console.log(ctx.chat.id)
    axios.post(`${process.env.BASE_URL}/returnJobFlag`, {
        body: (ctx.chat.id).toString()
    }).then(response => {
        console.log("here4")
        console.log(response)
        if (response.status === 200) {
          
            if (response.data?.jobFlag) {
                console.log("here1")

                axios.patch(`${process.env.BASE_URL}/setKeyWords`, {
                    body: (ctx.chat.id).toString(),
                    key: ctx.message.text
                }).then(response => {
                    console.log(response)
                    if (response.status === 200)
                        ctx.reply("Added! Press Done When you Finish", JobButtons)
                    else ctx.reply("Sorry an Error Occured!")
                })
             
            }
        }
            else {
           
                if (ctx.channelPost) {
                    
                
                    // console.log(ctx.channelPost.forward_from_chat)
                    if (ctx.channelPost.reply_markup)
                        var button = ctx.channelPost.reply_markup.inline_keyboard[0][0]
                    // console.log(uid)
                    //  console.log(ctx.channelPost)
                    // console.log(ctx.channelPost.sender_chat.title)
                    const data = ctx.channelPost?.text
   
                    const jTitle = data.substr(0, 9)
                 
                    console.log(data.substr(11).split("\n")[0])
                    const title = data.substr(11).split("\n")[0]
                    console.log(title.toLowerCase())
   
  
                    User.find().then(response => {
                        console.log(response)
                        response.forEach(r => {
                            if (jTitle === "Job Title") {
                                r.keywords?.forEach(key => {
                                    if (title.toLowerCase().includes(key.toLowerCase()))
                                    bot.telegram.sendMessage(r.username, ctx.channelPost.text + "\n" + "To " + button?.text + " " + button?.url)
                                        
                                })
                            }
                            else bot.telegram.sendMessage(r.username, "not freelance message")
                        })
                    })
                }
            }
    
    }).catch(e=>{
        console.log(e)
    })

    })
    bot
    .launch({ webhook: { domain: process.env.BASE_URL, port: 8443} })
    .then(() => console.log("Webhook bot listening on port"));


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

app.use(await bot.setWebhook({ domain: process.env.BASE_URL }))

app.listen(3001, () => {
    console.log("Server is up")
}) 