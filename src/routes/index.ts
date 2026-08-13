import { Router } from "express";
import venueRoutes from "../venues/venue.routes.js";

const router = Router();
router.use("/v1/venues", venueRoutes);

export default router;
