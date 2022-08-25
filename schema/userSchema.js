import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required:true
    },
    name: {
        type: String,
        required:true
    },
    keywords: {
        type: Array,
        required:true
    },
    jobFlag: {
        type: Boolean,
        default:false
    },
   
    flag: {
        type: Boolean,
        default:false
    }
})

const User = mongoose.model("user", userSchema)

export default User