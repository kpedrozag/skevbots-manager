const { Task } = require("../db/models");

const getAllTasks = async () => {
  return await Task.find().exec();
};

module.exports = {
  getAllTasks,
};
