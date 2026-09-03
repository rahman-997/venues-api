import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { HttpError } from "../errors/HttpError.js";
import type { Venue } from "./venue.types.js";

type CreateVenueInput = Omit<Venue, "id" | "createdAt">;
type UpdateVenueInput = Partial<CreateVenueInput>;

const DATA_FILE = process.env.VENUES_DATA_FILE ?? path.resolve(process.cwd(), "data", "venues.json");

const writeAtomically = (venues: Venue[]): void => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tempFile = `${DATA_FILE}.${process.pid}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(venues, null, 2), "utf8");
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    try {
      if (fs.existsSync(tempFile)) fs.rmSync(tempFile, { force: true });
    } catch {
      // Best-effort cleanup only; preserve the original persistence error.
    }
    throw new HttpError(500, "Failed to write data file");
  }
};

const ensureDataFile = (): void => {
  if (!fs.existsSync(DATA_FILE)) writeAtomically([]);
};

const readAll = (): Venue[] => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as Venue[];
  } catch (err) {
    throw new HttpError(500, "Failed to read data file");
  }
};

const writeAll = (venues: Venue[]): void => {
  writeAtomically(venues);
};

const normalizeName = (name: string): string => name.trim().toLowerCase();

const isNameTaken = (name: string, excludeId?: string): boolean => {
  const normalized = normalizeName(name);
  for (const venue of readAll()) {
    if (venue.id !== excludeId && normalizeName(venue.name) === normalized) {
      return true;
    }
  }
  return false;
};

export const venueService = {
  create(input: CreateVenueInput): Venue {
    if (isNameTaken(input.name)) {
      throw new HttpError(409, `Venue with name "${input.name}" already exists`);
    }

    const venue: Venue = {
      id: randomUUID(),
      name: input.name,
      address: input.address,
      capacity: input.capacity,
      contactEmail: input.contactEmail,
      createdAt: new Date().toISOString(),
    };

    const venues = readAll();
    venues.unshift(venue);
    writeAll(venues);
    return venue;
  },

  list(limit: number): Venue[] {
    const venues = readAll();
    return venues.slice(0, limit);
  },

  getById(id: string): Venue {
    const venues = readAll();
    const venue = venues.find((v) => v.id === id);
    if (!venue) {
      throw new HttpError(404, `Venue with id "${id}" not found`);
    }
    return venue;
  },

  update(id: string, input: UpdateVenueInput): Venue {
    const venues = readAll();
    const index = venues.findIndex((v) => v.id === id);
    if (index === -1) throw new HttpError(404, `Venue with id "${id}" not found`);

    if (input.name !== undefined && isNameTaken(input.name, id)) {
      throw new HttpError(409, `Venue with name "${input.name}" already exists`);
    }

    const existing = venues[index];
    if (!existing) {
      throw new HttpError(404, `Venue with id "${id}" not found`);
    }

    const updated: Venue = {
      ...existing,
      ...input,
    };

    venues[index] = updated;
    writeAll(venues);
    return updated;
  },

  delete(id: string): void {
    const venues = readAll();
    const index = venues.findIndex((v) => v.id === id);
    if (index === -1) throw new HttpError(404, `Venue with id "${id}" not found`);
    venues.splice(index, 1);
    writeAll(venues);
  },
};
