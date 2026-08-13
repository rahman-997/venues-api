import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Use a temporary data file for tests
const tmpDir = fs.mkdtempSync(path.join(process.cwd(), "tmp-test-"));
const dataFile = path.join(tmpDir, "venues.json");
fs.writeFileSync(dataFile, "[]", "utf8");
process.env.VENUES_DATA_FILE = dataFile;

// Import the service after setting the env var
const { venueService } = await import("../src/venues/venue.service.ts");

// Create
const created = venueService.create({
  name: "Unit Test Hall",
  address: "1 Test Ave",
  capacity: 50,
  contactEmail: "unit@test.example",
});
assert.ok(created.id, "created must have id");

// List
const list = venueService.list(10);
assert.ok(Array.isArray(list) && list.length === 1, "list should return the created venue");

// Get
const found = venueService.getById(created.id);
assert.strictEqual(found.name, "Unit Test Hall");

// Update
const updated = venueService.update(created.id, { name: "Unit Test Hall Updated" });
assert.strictEqual(updated.name, "Unit Test Hall Updated");

// Delete
venueService.delete(created.id);
const after = venueService.list(10);
assert.strictEqual(after.length, 0, "should be empty after deletion");

// Clean
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log("All tests passed");
