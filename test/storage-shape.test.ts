import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test, after } from "node:test";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "venues-shape-"));
const dataFile = path.join(dir, "venues.json");
process.env.VENUES_DATA_FILE = dataFile;
const { venueService } = await import("../src/venues/venue.service.ts");
after(() => fs.rmSync(dir, { recursive: true, force: true }));
const venue = { id: "synthetic-id", name: "Synthetic Hall", address: "Test", capacity: 50, contactEmail: "test@example.test", createdAt: "2026-11-25T12:00:00.000Z" };

for (const field of ["internalNote", "__proto__", "constructor"]) {
  test(`reject unknown persisted field ${field} without disclosing or replacing the file`, () => {
    const raw = JSON.stringify([{ ...venue, [field]: "synthetic private value" }]);
    fs.writeFileSync(dataFile, raw);
    for (const operation of [
      () => venueService.list(10),
      () => venueService.getById(venue.id),
      () => venueService.create({ name: "New", address: "Test", capacity: 1, contactEmail: "new@example.test" }),
      () => venueService.update(venue.id, { capacity: 60 }),
      () => venueService.delete(venue.id),
    ]) {
      assert.throws(operation, { message: "Failed to read data file", statusCode: 500 });
      assert.equal(fs.readFileSync(dataFile, "utf8"), raw);
    }
  });
}

test("valid existing records remain readable and editable", () => {
  fs.writeFileSync(dataFile, JSON.stringify([venue]));
  assert.deepEqual(venueService.list(10), [venue]);
  assert.deepEqual(venueService.getById(venue.id), venue);
  assert.equal(venueService.update(venue.id, { capacity: 60 }).capacity, 60);
  assert.deepEqual(JSON.parse(fs.readFileSync(dataFile, "utf8")), [{ ...venue, capacity: 60 }]);
});

test("an invalid record mixed with a valid record rejects the entire store", () => {
  const raw = JSON.stringify([venue, { ...venue, id: "second", internalNote: "synthetic" }]);
  fs.writeFileSync(dataFile, raw);
  assert.throws(() => venueService.list(10), /Failed to read data file/);
  assert.throws(() => venueService.delete(venue.id), /Failed to read data file/);
  assert.equal(fs.readFileSync(dataFile, "utf8"), raw);
});
