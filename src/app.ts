import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());
// Redirect legacy path to the API versioned path
app.get("/venues", (_req, res) => res.redirect("/v1/venues"));
app.use(routes);
app.use(errorHandler);

export default app;
