import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
});

server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; closing HTTP server`);

  const forceExitTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close((error) => {
    clearTimeout(forceExitTimer);
    if (error) {
      console.error("HTTP server shutdown failed", error);
      process.exitCode = 1;
      return;
    }
    console.log("HTTP server closed");
  });
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

server.on("error", (error) => {
  console.error("HTTP server error", error);
  process.exitCode = 1;
});
