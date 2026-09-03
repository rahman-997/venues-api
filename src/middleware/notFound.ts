import type { RequestHandler } from "express";
import { HttpError } from "../errors/HttpError.js";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, "Route not found"));
};
