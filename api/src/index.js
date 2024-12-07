const app = require("./app");
const db = require("./db");

const { PORT } = process.env;

app.listen(PORT, async () => {
  await db.connect();
  console.log(`API listening on port: ${PORT}`);
});
