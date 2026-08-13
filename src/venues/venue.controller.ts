import type { Request, Response } from "express";
import { venueService } from "./venue.service.js";

export const createVenue = (req: Request, res: Response): void => {
  const venue = venueService.create(req.body);
  res.status(201).json({ data: venue });
};

export const listVenues = (req: Request, res: Response): void => {
  const { limit } = req.query as unknown as { limit: number };
  const venues = venueService.list(limit);
  res.status(200).json({ data: venues });
};

export const getVenue = (req: Request, res: Response): void => {
  const venue = venueService.getById(req.params.id);
  res.status(200).json({ data: venue });
};

export const updateVenue = (req: Request, res: Response): void => {
  const venue = venueService.update(req.params.id, req.body);
  res.status(200).json({ data: venue });
};

export const deleteVenue = (req: Request, res: Response): void => {
  venueService.delete(req.params.id);
  res.status(204).send();
};
