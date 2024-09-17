const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Visitor Outpass Schema
const visitorOutpassSchema = new Schema({
  Visitor: {
    type: Schema.Types.ObjectId,
    ref: "Visitor",
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
  }
});

const VisitorOutpass = mongoose.model("VisitorOutpass", visitorOutpassSchema);

module.exports = VisitorOutpass;
