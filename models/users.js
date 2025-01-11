const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
    tokens: [{ token: { type: String, default:null} }],
    tasks:[{type:mongoose.Schema.Types.ObjectId, ref:'Task'}],
    totalTasks: { type: Number, default: 0 }
  }, { timestamps: true });

  module.exports = mongoose.model('User', userSchema);