import type { Request, Response } from "express";
import * as tasksService from "../services/tasks";
import { ITaskSchema, IBotSchema } from "../db/models";

import logger from "../utils/logger";

type ErrorResponse = {
  error: string;
};

const getTasks = async (
  req: Request<
    {},
    ITaskSchema[] | ErrorResponse,
    {},
    { onlyAvailable: string }
  >,
  res: Response<ITaskSchema[] | ErrorResponse>
) => {
  try {
    const { onlyAvailable } = req.query;

    if (onlyAvailable === "true") {
      const response = await tasksService.getAvailableTasks();
      return res.send(response);
    }

    const response = await tasksService.getAllTasks();
    return res.send(response);
  } catch (err: any) {
    const errMsg = "ERROR_GETTING_TASKS";
    logger.error(err, errMsg);

    return res.status(500).send({ error: err.message || errMsg });
  }
};

const getBots = async (
  req: Request<
    {},
    IBotSchema[] | ErrorResponse,
    {},
    { onlyWithTaskAssigned: string }
  >,
  res: Response<IBotSchema[] | ErrorResponse>
) => {
  try {
    const { onlyWithTaskAssigned } = req.query;

    if (onlyWithTaskAssigned === "true") {
      const response = await tasksService.getBotsWithTask();
      return res.send(response);
    }

    const response = await tasksService.getAllBots();
    return res.send(response);
  } catch (err: any) {
    const errMsg = "ERROR_GETTING_BOTS";
    logger.error(err, errMsg);

    return res.status(500).send({ error: err.message || errMsg });
  }
};

const createBot = async (
  req: Request<{ name: string }, IBotSchema>,
  res: Response<IBotSchema | ErrorResponse>
) => {
  try {
    const { name } = req.params;
    const response = await tasksService.createBot(name);
    return res.status(201).send(response);
  } catch (err: any) {
    if (err?.errorResponse?.code === 11000) {
      return res.status(409).send({ error: "Bot already exists" });
    }

    const errMsg = "ERROR_CREATING_BOT";
    logger.error(err, errMsg);

    return res.status(500).send({ error: JSON.stringify(req.params) });
  }
};

const scheduleTasks = async (
  req: Request<{ botId: string }, {} | ErrorResponse, { tasks: string[] }>,
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

    const response = await tasksService.scheduleTasks(botId, tasks);
    return res.status(202).send(response);
  } catch (err: any) {
    const errMsg = "ERROR_SCHEDULING_TASK";
    logger.error(err, errMsg);

    return res.status(err.status || 500).send({ error: err.message || errMsg });
  }
};

const getCompletedTasks = async (req: Request, res: Response) => {
  try {
    const response = await tasksService.getCompletedTasks();
    return res.send(response);
  } catch (err: any) {
    const errMsg = "ERROR_GETTING_COMPLETED_TASKS";
    logger.error(err, errMsg);

    return res.status(500).send({ error: err.message || errMsg });
  }
};

const deleteAll = async (req: Request, res: Response) => {
  try {
    await tasksService.resetEntities();
    return res.sendStatus(204);
  } catch (err: any) {
    const errMsg = "ERROR_DELETING_INFORMATION";
    logger.error(err, errMsg);

    return res.status(500).send({ error: err.message || errMsg });
  }
};

export {
  getTasks,
  getBots,
  createBot,
  scheduleTasks,
  getCompletedTasks,
  deleteAll,
};
