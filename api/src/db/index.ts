import mongoose from "mongoose";

import logger from "../utils/logger";

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (err) {
    logger.error(err, "Error connecting to MongoDB");
    process.exit(1);
  }
};

export { connect };
