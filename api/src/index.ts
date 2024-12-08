import app from "./app";
import * as db from "./db";

const { PORT } = process.env;

app.listen(PORT, async () => {
  await db.connect();
  console.log(`API listening on port: ${PORT}`);
});
