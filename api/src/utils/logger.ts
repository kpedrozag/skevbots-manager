import pino, { type Logger } from "pino";

const logger: Logger = pino({
  transport:
    process.env.ENV !== "prod"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

export default logger;
