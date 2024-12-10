import pino, { type Logger } from "pino";

const logger: Logger = pino({
  transport:
    process.env.API_ENV !== "prod"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

export default logger;
