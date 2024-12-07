const mongoose = require("mongoose");

const logger = require("../plugins/logger");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    logger.error(err, "Error connecting to MongoDB");
    process.exit(1);
  }
};

module.exports = {
  connect,
};
