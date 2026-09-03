import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,100}$/;

export const requestContext: RequestHandler = (req, res, next) => {
  const incomingRequestId = req.get("x-request-id");
  const requestId = incomingRequestId && REQUEST_ID_PATTERN.test(incomingRequestId)
    ? incomingRequestId
    : randomUUID();

  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};
