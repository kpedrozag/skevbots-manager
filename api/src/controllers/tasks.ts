import type { Request, Response } from "express";
import * as tasksService from "../services/tasks";
import { ITaskSchema, IBotSchema } from "../db/models";

import logger from "../utils/logger";

type ErrorResponse = {
  error: string;
};

type BotIdParam = { botId: string };

const getTasks = async (
  _: Request<{}, ITaskSchema[] | ErrorResponse>,
  res: Response<ITaskSchema[] | ErrorResponse>
) => {
  try {
    const response = await tasksService.getAllTasks();
    return res.send(response);
  } catch (err: any) {
    const errMsg = "ERROR_GETTING_TASKS";
    logger.error(err, errMsg);

    return res.status(500).send({ error: err.message || errMsg });
  }
};

const getBots = async (
  _: Request<{}, IBotSchema[] | ErrorResponse>,
  res: Response<IBotSchema[] | ErrorResponse>
) => {
  try {
    const response = await tasksService.getAllBots();
    return res.send(response);
  } catch (err: any) {
    const errMsg = "ERROR_GETTING_BOTS";
    logger.error(err, errMsg);

    return res.status(500).send({ error: err.message || errMsg });
  }
};

const createBot = async (
  req: Request<BotIdParam, IBotSchema>,
  res: Response<IBotSchema | ErrorResponse>
) => {
  try {
    const { botId } = req.params;
    const response = await tasksService.createBot(botId);
    return res.status(201).send(response);
  } catch (err: any) {
    const errMsg = "ERROR_CREATING_BOT";
    logger.error(err, errMsg);

    return res.status(500).send({ error: err.message || errMsg });
  }
};

const scheduleTasks = async (
  req: Request<BotIdParam, {} | ErrorResponse, { tasks: string[] }>,
  res: Response<{} | ErrorResponse>
) => {
  try {
    const { botId } = req.params;
    const { tasks } = req.body;

    if (tasks.length < 2) {
      return res
        .status(400)
        .send({ error: "Invalid number of tasks: 2 tasks should be assigned" });
    }

    await tasksService.scheduleTasks(botId, tasks);
    return res.status(202).send();
  } catch (err: any) {
    const errMsg = "ERROR_SCHEDULING_TASK";
    logger.error(err, errMsg);

    return res.status(err.status || 500).send({ error: err.message || errMsg });
  }
};

export { getTasks, getBots, createBot, scheduleTasks };
