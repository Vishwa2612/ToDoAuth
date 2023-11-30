import mongoose from "mongoose";
import p from "passport-local-mongoose";

const TodoSchema = new mongoose.Schema({
    task:{
        type:String,
        require:true
    },
});
TodoSchema.plugin(p);

export const taskModel = mongoose.model("task", TodoSchema);