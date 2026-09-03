import assert from "node:assert";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import path from "node:path";

const tmpDir = fs.mkdtempSync(path.join(process.cwd(), "tmp-test-"));
const dataFile = path.join(tmpDir, "venues.json");
fs.writeFileSync(dataFile, "[]", "utf8");
process.env.VENUES_DATA_FILE = dataFile;

const { venueService } = await import("../src/venues/venue.service.ts");
const { default: app } = await import("../src/app.ts");

const created = venueService.create({
  name: "Service Test Hall",
  address: "1 Test Ave",
  capacity: 50,
  contactEmail: "service@test.example",
});

assert.ok(created.id, "service create must generate an id");
assert.strictEqual(venueService.getById(created.id).name, "Service Test Hall");
assert.strictEqual(
  venueService.update(created.id, { name: "Service Test Hall Updated" }).name,
  "Service Test Hall Updated",
);
venueService.delete(created.id);
assert.strictEqual(venueService.list(10).length, 0, "service delete must remove the venue");
assert.deepStrictEqual(JSON.parse(fs.readFileSync(dataFile, "utf8")), [], "persisted venue data must remain valid JSON");
assert.deepStrictEqual(
  fs.readdirSync(tmpDir).filter((entry) => entry.endsWith(".tmp")),
  [],
  "atomic persistence must not leave temporary files behind",
);

const server = app.listen(0, "127.0.0.1");

try {
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  const healthRequestId = "contract-health-1";
  const healthResponse = await fetch(`${baseUrl}/health`, {
    headers: { "x-request-id": healthRequestId },
  });
  const healthBody = await healthResponse.json();
  assert.strictEqual(healthResponse.status, 200);
  assert.strictEqual(healthBody.status, "ok");
  assert.strictEqual(healthBody.service, "venues-api");
  assert.strictEqual(healthResponse.headers.get("x-request-id"), healthRequestId);
  assert.strictEqual(healthResponse.headers.get("x-content-type-options"), "nosniff");
  assert.strictEqual(healthResponse.headers.get("x-frame-options"), "DENY");
  assert.strictEqual(healthResponse.headers.get("referrer-policy"), "no-referrer");
  assert.ok(healthResponse.headers.get("content-security-policy")?.includes("default-src 'none'"));
  assert.strictEqual(healthResponse.headers.get("x-powered-by"), null);

  const legacyResponse = await fetch(`${baseUrl}/venues`, { redirect: "manual" });
  assert.strictEqual(legacyResponse.status, 308);
  assert.strictEqual(legacyResponse.headers.get("location"), "/v1/venues");

  const unknownResponse = await fetch(`${baseUrl}/v1/does-not-exist`);
  const unknownBody = await unknownResponse.json();
  assert.strictEqual(unknownResponse.status, 404);
  assert.strictEqual(unknownBody.error.code, "NOT_FOUND");
  assert.ok(unknownBody.requestId, "unknown-route errors must include a request id");

  const malformedRequestId = "contract-malformed-1";
  const malformedResponse = await fetch(`${baseUrl}/v1/venues`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-request-id": malformedRequestId,
    },
    body: "{\"name\":",
  });
  const malformedBody = await malformedResponse.json();
  assert.strictEqual(malformedResponse.status, 400);
  assert.strictEqual(malformedBody.error.code, "BAD_REQUEST");
  assert.strictEqual(malformedBody.requestId, malformedRequestId);

  const oversizedResponse = await fetch(`${baseUrl}/v1/venues`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ padding: "x".repeat(110 * 1024) }),
  });
  const oversizedBody = await oversizedResponse.json();
  assert.strictEqual(oversizedResponse.status, 413);
  assert.strictEqual(oversizedBody.error.code, "PAYLOAD_TOO_LARGE");

  const createResponse = await fetch(`${baseUrl}/v1/venues`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "HTTP Test Hall",
      address: "2 Test Ave",
      capacity: 120,
      contactEmail: "http@test.example",
    }),
  });
  const createBody = await createResponse.json();
  assert.strictEqual(createResponse.status, 201);
  assert.ok(createBody.data.id, "HTTP create must generate an id");
  const venueId = createBody.data.id as string;

  const duplicateResponse = await fetch(`${baseUrl}/v1/venues`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "http test hall",
      address: "3 Test Ave",
      capacity: 90,
      contactEmail: "duplicate@test.example",
    }),
  });
  const duplicateBody = await duplicateResponse.json();
  assert.strictEqual(duplicateResponse.status, 409);
  assert.strictEqual(duplicateBody.error.code, "CONFLICT");

  const invalidResponse = await fetch(`${baseUrl}/v1/venues`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Invalid Hall",
      address: "4 Test Ave",
      capacity: 0,
      contactEmail: "not-an-email",
    }),
  });
  const invalidBody = await invalidResponse.json();
  assert.strictEqual(invalidResponse.status, 400);
  assert.strictEqual(invalidBody.error.code, "VALIDATION_ERROR");

  const listResponse = await fetch(`${baseUrl}/v1/venues?limit=1`);
  const listBody = await listResponse.json();
  assert.strictEqual(listResponse.status, 200);
  assert.strictEqual(listBody.data.length, 1);

  const updateResponse = await fetch(`${baseUrl}/v1/venues/${venueId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ capacity: 150 }),
  });
  const updateBody = await updateResponse.json();
  assert.strictEqual(updateResponse.status, 200);
  assert.strictEqual(updateBody.data.capacity, 150);

  const deleteResponse = await fetch(`${baseUrl}/v1/venues/${venueId}`, { method: "DELETE" });
  assert.strictEqual(deleteResponse.status, 204);

  const missingResponse = await fetch(`${baseUrl}/v1/venues/${venueId}`);
  const missingBody = await missingResponse.json();
  assert.strictEqual(missingResponse.status, 404);
  assert.strictEqual(missingBody.error.code, "NOT_FOUND");
} finally {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log("Service and HTTP contract tests passed");
