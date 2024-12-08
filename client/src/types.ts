export interface Task {
  id: number;
  description: string;
  duration: number;
  expiresAt: Date;
}

export interface Bot {
  name: string;
  tasks: Array<Task & { endsAt: Date }>;
}

export interface BotsResponse {
  freeBots: Array<Bot>;
  busyBots: Array<Bot>;
}
