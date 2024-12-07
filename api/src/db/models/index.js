const mongoose = require("mongoose");
const { Schema } = mongoose;

const tasksSchema = new Schema({
  id: Number,
  description: String,
  duration: Number,
});

const Task = mongoose.model("tasks", tasksSchema);

module.exports = {
  Task,
};
