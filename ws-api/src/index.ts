import WebSocket from "ws";
import axios from "axios";

const port = parseInt(process.env.WS_PORT!);

const wss = new WebSocket.Server({ port: port }, () => {
  console.log("WebSocket server is running at port", port);
});

wss.on("connection", (ws: WebSocket) => {
  const fetchData = async () => {
    return axios.get(`${process.env.API_URL}/v1/tasks`);
  };

  let previousTaskNumbers: number | null = null;

  const evaluateTask = async () => {
    try {
      const { data } = await fetchData();
      const taskCount = data.length;
      if (!previousTaskNumbers) {
        previousTaskNumbers = taskCount;
      } else {
        if (taskCount < previousTaskNumbers) {
          ws.send("UPDATE_TASKS");
          previousTaskNumbers = taskCount;
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  let interval: NodeJS.Timeout | string | number | undefined;

  ws.on("message", async (message: string) => {
    const strMessage = message.toString();

    if (strMessage === "START") {
      interval = await setInterval(evaluateTask, 1_000);
    } else if (strMessage === "STOP") {
      clearInterval(interval);
    }
    // ws.send(`Server received your message: ${message}`);
  });

  ws.on("close", () => {});
});
