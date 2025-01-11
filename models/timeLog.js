const { Mongoose } = require("mongoose");

const TimeLogSchema = Mongoose.Schema({
    taskId:{type:Mongoose.Schema.Types.ObjectId, ref:'Task'},
    userId:{type:Mongoose.Schema.Types.ObjectId, ref:'User'},
    startTime:Date,
    endTime:Date,
    totalHours:Number,
})
module.exports = Mongoose.model('TimeLog', TimeLogSchema);