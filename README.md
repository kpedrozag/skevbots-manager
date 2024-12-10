# skevbots-manager

# Pre-requisites

- `pnpm` ([Click here to go to Installation instructions of pnpm](https://pnpm.io/installation)).
- Docker.

Almost all the services are dockerized, BUT the web client (due to some sort of vite errors).

## Setup

- Start docker deamon.
- Create `.env` file at the root of the project
  ```
  API_PORT=3000
  API_URL=http://localhost:3000
  API_ENV=dev

  WS_PORT=3001
  WS_URL=ws://localhost:3001

  VITE_API_URL=http://localhost:3000
  VITE_WS_URL=ws://localhost:3001
  ```
- Run: `docker-compose up --build`.
- In a separate tab console, run: `cd client && pnpm i && pn dev`
- In the browser, opens: http://localhost:5173.