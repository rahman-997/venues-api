import { Router } from "express";
import { requireWriteAccess } from "../middleware/writeAccess.js";
import {
  createVenue,
  deleteVenue,
  getVenue,
  listVenues,
  updateVenue,
} from "./venue.controller.js";
import {
  createVenueSchema,
  listVenuesQuerySchema,
  updateVenueSchema,
  venueIdParamsSchema,
} from "./venue.schema.js";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";

const router = Router();

router.post("/", requireWriteAccess, validate(createVenueSchema), createVenue);
router.get("/", validateQuery(listVenuesQuerySchema), listVenues);
router.get("/:id", validateParams(venueIdParamsSchema), getVenue);
router.patch("/:id", requireWriteAccess, validateParams(venueIdParamsSchema), validate(updateVenueSchema), updateVenue);
router.delete("/:id", requireWriteAccess, validateParams(venueIdParamsSchema), deleteVenue);

export default router;
