export interface Task {
  _id: string;
  description: string;
  duration: number;
  expiresAt: Date;
}

export interface Bot {
  _id: string;
  name: string;
  tasks: Array<Task & { endsAt: Date }>;
}

export interface BotsResponse {
  freeBots: Array<Bot>;
  busyBots: Array<Bot>;
}

export interface AssignTasksInput {
  botId: string;
  tasks: string[];
}

export interface CompletedTasks {
  botId: string;
  taskId: string;
  description: string;
}
