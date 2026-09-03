import type { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors/HttpError.js";

type RequestBodyError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const requestId = typeof res.locals.requestId === "string" ? res.locals.requestId : undefined;

  if (isRequestBodyError(error) && error.status === 413) {
    sendError(res, 413, "PAYLOAD_TOO_LARGE", "Request body is too large", requestId);
    return;
  }

  if (isRequestBodyError(error) && error.status === 400 && error.type === "entity.parse.failed") {
    sendError(res, 400, "BAD_REQUEST", "Malformed JSON request body", requestId);
    return;
  }

  if (error instanceof ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Request validation failed", requestId, error.issues);
    return;
  }

  if (error instanceof HttpError) {
    sendError(res, error.statusCode, errorCodeForStatus(error.statusCode), error.message, requestId, error.details);
    return;
  }

  console.error("Unhandled request error", { requestId, error });
  sendError(res, 500, "INTERNAL_SERVER_ERROR", "Internal server error", requestId);
};

function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  requestId?: string,
  details?: unknown,
) {
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    ...(requestId ? { requestId } : {}),
  });
}

function isRequestBodyError(error: unknown): error is RequestBodyError {
  if (!(error instanceof Error)) return false;
  const candidate = error as RequestBodyError;
  return typeof candidate.status === "number" || typeof candidate.statusCode === "number";
}

function errorCodeForStatus(statusCode: number): string {
  switch (statusCode) {
    case 400: return "BAD_REQUEST";
    case 404: return "NOT_FOUND";
    case 409: return "CONFLICT";
    case 413: return "PAYLOAD_TOO_LARGE";
    default: return "HTTP_ERROR";
  }
}
