import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { requestContext } from "./middleware/requestContext.js";
import { securityHeaders } from "./middleware/securityHeaders.js";

const app = express();

app.disable("x-powered-by");
app.use(requestContext);
app.use(securityHeaders);
app.use(express.json({ limit: "100kb", strict: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "venues-api" });
});

// Redirect legacy path to the API versioned path.
app.get("/venues", (_req, res) => res.redirect(308, "/v1/venues"));

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
