import express from "express";
import * as tasks from "./controllers/tasks";

const app = express();

app.use(express.json());

const v1Router = express.Router();
v1Router.get("/tasks", tasks.getTasks);
v1Router.get("/bots", tasks.getBots);
v1Router.post("/bots/:botId", tasks.createBot);
v1Router.post("/bots/:botId/task-schedule", tasks.scheduleTasks);

app.use("/v1", v1Router);

export default app;
