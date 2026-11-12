import type { z } from "zod";
import type { listVenuesQuerySchema } from "./venue.schema.js";
import type { Request, Response } from "express";
import { venueService } from "./venue.service.js";

type VenueParams = { id: string };

export const createVenue = (req: Request, res: Response): void => {
  const venue = venueService.create(req.body);
  res.status(201).json({ data: venue });
};

export const listVenues = (req: Request, res: Response): void => {
  const query = req.query as unknown as z.output<typeof listVenuesQuerySchema>;
  const venues = venueService.list(query.limit, query.offset, query);
  res.status(200).json({ data: venues });
};

export const getVenue = (req: Request<VenueParams>, res: Response): void => {
  const venue = venueService.getById(req.params.id);
  res.status(200).json({ data: venue });
};

export const updateVenue = (req: Request<VenueParams>, res: Response): void => {
  const venue = venueService.update(req.params.id, req.body);
  res.status(200).json({ data: venue });
};

export const deleteVenue = (req: Request<VenueParams>, res: Response): void => {
  venueService.delete(req.params.id);
  res.status(204).send();
};
