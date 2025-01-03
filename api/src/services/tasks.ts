import { Task, Bot, ICompletedTasks } from "../db/models";
import { InvalidRequest } from "../errors";
import TasksDefaults from "../db/default-tasks.json";

const getAllTasks = async () => {
  return await Task.find().lean();
};

const getAvailableTasks = async () => Task.find({ expiresAt: null }).lean();

const getAllBots = async () => Bot.find().lean();

const getBotsWithTask = async () => Bot.find({ tasks: { $ne: [] } }).lean();

const createBot = async (name: string) => Bot.create({ name });

const scheduleTasks = async (botId: string, tasks: string[]) => {
  const [tasksInfo, botInfo] = await Promise.all([
    Task.find({ _id: { $in: tasks }, expiresAt: null }).lean(),
    Bot.findOne({ _id: botId, tasks: { $size: 0 } }).lean(),
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
    const { _id: taskId, duration, description } = task;

    taskToSchedule.push({
      updateOne: {
        filter: { _id: taskId },
        update: { $set: { expiresAt: now + duration } },
      },
    });

    botTasks.push({ _id: taskId, description, endsAt: now + duration });
  }

  await Task.bulkWrite(taskToSchedule);
  await Bot.updateOne({ _id: botId }, { tasks: botTasks });

  return {
    botId,
    tasks: botTasks,
  };
};

const getCompletedTasks = async (): Promise<ICompletedTasks[]> => {
  return Bot.aggregate([
    {
      $unwind: "$tasks",
    },
    {
      $lookup: {
        from: "tasks",
        localField: "tasks._id",
        foreignField: "_id",
        as: "matchedTask",
      },
    },
    {
      $match: {
        matchedTask: { $size: 0 },
      },
    },
    {
      $project: {
        _id: 0,
        botId: "$_id",
        taskId: "$tasks._id",
        description: "$tasks.description",
      },
    },
  ]);
};

const resetEntities = async () => {
  await Promise.all([Bot.deleteMany({}), Task.deleteMany({})]);

  return Task.insertMany(TasksDefaults);
};

export {
  getAllTasks,
  getAllBots,
  createBot,
  scheduleTasks,
  getAvailableTasks,
  getBotsWithTask,
  getCompletedTasks,
  resetEntities,
};
