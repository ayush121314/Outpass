const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Visitor Outpass Schema
const Visitorschema = new Schema({
  visitorName: {
    type: String,
    required: true,
  },
  visitorContact: {
    type: String,
    required: true,
  },
  visitoremail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});
const Visitor = mongoose.model("Visitor", Visitorschema);

module.exports = Visitor;
