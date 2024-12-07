const express = require("express");

const tasks = require("./controllers/tasks");

const app = express();
app.get("/tasks", tasks.getTasks);

module.exports = app;
