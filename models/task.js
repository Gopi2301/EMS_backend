const {  mongoose } = require("mongoose");

const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    status:{type:String, enum:['Todo','In Progress','Done'], default:'Todo'},
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    assignedTo:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    project:String,
    deadline:Date,
    timeLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TimeLog' }],
    createdAt:{type:Date, default:Date.now},
});
module.exports = mongoose.model('Task', TaskSchema);