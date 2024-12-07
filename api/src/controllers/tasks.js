const tasksService = require("../services/tasks");

const getTasks = async (_, res) => {
  const response = await tasksService.getAllTasks();
  return res.send(response);
};

module.exports = {
  getTasks,
};
