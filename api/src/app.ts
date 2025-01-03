import express from "express";
import * as tasks from "./controllers/tasks";

import cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const v1Router = express.Router();

v1Router.get("/tasks", tasks.getTasks);
v1Router.get("/tasks/completed", tasks.getCompletedTasks);

v1Router.get("/bots", tasks.getBots);
v1Router.post("/bots/:name", tasks.createBot);
v1Router.post("/bots/:botId/task-schedule", tasks.scheduleTasks);

v1Router.delete("/", tasks.deleteAll);

app.use("/v1", v1Router);

export default app;
