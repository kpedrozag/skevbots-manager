import app from "./app";
import * as db from "./db";

const { API_PORT } = process.env;

app.listen(API_PORT, async () => {
  await db.connect();
  console.log(`API listening on port: ${API_PORT}`);
});
