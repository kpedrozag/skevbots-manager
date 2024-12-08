import { Task, Bot } from "../db/models";
import { InvalidRequest } from "../errors";

const getAllTasks = async () => {
  return await Task.find();
};

const getAllBots = async () => {
  return await Bot.find();
};

const createBot = async (name: string) => {
  return Bot.create({ name });
};

const scheduleTasks = async (botName: string, tasks: string[]) => {
  const [tasksInfo, botInfo] = await Promise.all([
    Task.find({ id: { $in: tasks }, expiresAt: null }),
    Bot.findOne({ name: botName, tasks: { $size: 0 } }),
  ]);

  if (tasksInfo.length !== 2) {
    throw new InvalidRequest(
      "Invalid tasks: Any of the tasks provided does not exist or is already scheduled"
    );
  }
  if (!botInfo) {
    throw new InvalidRequest(
      "Invalid bot: The bot provided does not exist or has been scheduled with tasks and cannot be assigned new tasks"
    );
  }

  const now = new Date().getTime();
  const taskToSchedule = [],
    botTasks = [];

  for (const task of tasksInfo) {
    const { id: taskId, duration, description } = task;

    taskToSchedule.push({
      updateOne: {
        filter: { id: taskId },
        update: { $set: { expiresAt: now + duration } },
      },
    });

    botTasks.push({ id: taskId, description, endsAt: now + duration });
  }

  await Task.bulkWrite(taskToSchedule);
  await Bot.updateOne({ name: botName }, { tasks: botTasks });
};

export { getAllTasks, getAllBots, createBot, scheduleTasks };
