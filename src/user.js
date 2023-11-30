import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
});
userSchema.plugin(passportLocalMongoose);

export const userModel = mongoose.model("user", userSchema);