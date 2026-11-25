import { createHash, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";

// The published demonstration previously allowed anyone to mutate venue data.
// Preserve local development but require explicit credentials for production writes.
export const requireWriteAccess: RequestHandler = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  if (process.env.NODE_ENV !== "production") return next();

  const expected = process.env.VENUES_WRITE_API_KEY;
  if (!expected || expected.length < 32 || expected.length > 512 ||
      !/^[\x21-\x7E]+$/.test(expected)) {
    res.status(503).json({ error: { code: "WRITE_AUTH_NOT_CONFIGURED", message: "Venue writes unavailable" }, requestId: res.locals.requestId });
    return;
  }

  // Header only; no tokens in URLs, query strings, cookies or logs.
  const match = /^Bearer ([\x21-\x7E]{32,512})$/.exec(req.get("authorization") ?? "");
  if (!match) {
    res.setHeader("WWW-Authenticate", "Bearer");
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Valid write credentials required" }, requestId: res.locals.requestId });
    return;
  }
  const candidate = createHash("sha256").update(match[1]!, "utf8").digest();
  const digest = createHash("sha256").update(expected, "utf8").digest();
  if (!timingSafeEqual(candidate, digest)) {
    res.setHeader("WWW-Authenticate", "Bearer");
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Valid write credentials required" }, requestId: res.locals.requestId });
    return;
  }
  next();
};
