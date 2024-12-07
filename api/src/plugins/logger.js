const logger = require("pino")({
  transport: process.env.ENV !== "prod" && {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

module.exports = logger;
