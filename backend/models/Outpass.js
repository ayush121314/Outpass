const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Outpass Schema
const outpassSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending", // Default status is 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fromTime: { 
    type: Date, 
    required: true
  },
  toTime: { 
    type: Date, 
    required: true
  },
});

const Outpass = mongoose.model("Outpass", outpassSchema);

module.exports = Outpass;

