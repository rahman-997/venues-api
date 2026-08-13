import type { RequestHandler } from "express";
import type { z } from "zod";

export const validate = <T extends z.ZodType>(schema: T): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.parse(req.body);
    Object.defineProperty(req, "body", {
      value: parsed,
      configurable: true,
      writable: true,
    });
    next();
  };
};

export const validateQuery = <T extends z.ZodType>(schema: T): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.parse(req.query) as typeof req.query;
    Object.defineProperty(req, "query", {
      value: parsed,
      configurable: true,
      writable: true,
    });
    next();
  };
};

export const validateParams = <T extends z.ZodType>(schema: T): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.parse(req.params) as typeof req.params;
    Object.defineProperty(req, "params", {
      value: parsed,
      configurable: true,
      writable: true,
    });
    next();
  };
};
