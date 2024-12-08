import axios, { AxiosError } from "axios";
import { Task, Bot } from "@/types";

const api = axios.create({
  baseURL: "http://localhost:3000/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

const getTasks = async (
  onlyAvailable: boolean = false
): Promise<Array<Task>> => {
  try {
    const response = await api.get("/tasks", {
      params: {
        onlyAvailable,
      },
    });
    return response.data;
  } catch {
    throw new Error("Failed to fetch tasks");
  }
};

const getBots = async (
  onlyWithTaskAssigned: boolean = false
): Promise<Bot[]> => {
  try {
    const response: { data: Bot[] } = await api.get("/bots", {
      params: {
        onlyWithTaskAssigned,
      },
    });

    return response.data;
  } catch {
    throw new Error("Failed to fetch bots");
  }
};

const createBot = async (name: string): Promise<Bot> => {
  try {
    const response = await api.post(`/bots/${name}`);
    return response.data;
  } catch (error: typeof AxiosError | unknown) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      throw new Error("Bot already exists");
    }

    throw new Error("Failed to create bot");
  }
};

const scheduleTasks = async (botId: string, tasks: string[]) => {
  try {
    return api.post(`/bots/${botId}/task-schedule`, { tasks });
  } catch {
    throw new Error("Failed to schedule tasks");
  }
};

export { getTasks, getBots, createBot, scheduleTasks };
