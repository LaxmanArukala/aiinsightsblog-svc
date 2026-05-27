import { Request, Response } from 'express';
import * as subscriberService from './subscriber.service';
import { SubscriberListQuery } from './subscriber.types';
import { errorResponse, successResponse } from '../../lib/response';

export async function getSubscribers(req: Request, res: Response): Promise<void> {
  try {
    const query: SubscriberListQuery = {
      page:   req.query.page   ? Number.parseInt(req.query.page   as string, 10) : 1,
      limit:  req.query.limit  ? Number.parseInt(req.query.limit  as string, 10) : 10,
      status: req.query.status as 'active' | 'unsubscribed' | undefined,
    };
    const result = await subscriberService.getSubscribers(query);
    res.json(successResponse(result, 'Subscribers fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch subscribers', [(err as Error).message]));
  }
}

export async function getSubscriberById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const subscriber = await subscriberService.getSubscriberById(id);
    if (!subscriber) {
      res.status(404).json(errorResponse('Subscriber not found'));
      return;
    }
    res.json(successResponse(subscriber, 'Subscriber fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch subscriber', [(err as Error).message]));
  }
}

export async function createSubscriber(req: Request, res: Response): Promise<void> {
  try {
    const { email, name } = req.body;
    if (!email) {
      res.status(400).json(errorResponse('Validation failed', ['email is required']));
      return;
    }
    const subscriber = await subscriberService.createSubscriber({ email, name });
    res.status(201).json(successResponse(subscriber, 'Subscribed successfully'));
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('unique') || msg.includes('duplicate')) {
      res.status(409).json(errorResponse('Email already subscribed'));
      return;
    }
    res.status(500).json(errorResponse('Failed to subscribe', [msg]));
  }
}

export async function updateSubscriber(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { email, name, status } = req.body;
    if (status && !['active', 'unsubscribed'].includes(status)) {
      res.status(400).json(errorResponse('Validation failed', ['status must be active or unsubscribed']));
      return;
    }
    const subscriber = await subscriberService.updateSubscriber(id, { email, name, status });
    if (!subscriber) {
      res.status(404).json(errorResponse('Subscriber not found'));
      return;
    }
    res.json(successResponse(subscriber, 'Subscriber updated successfully'));
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('unique') || msg.includes('duplicate')) {
      res.status(409).json(errorResponse('Email already in use'));
      return;
    }
    res.status(500).json(errorResponse('Failed to update subscriber', [msg]));
  }
}

export async function deleteSubscriber(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await subscriberService.deleteSubscriber(id);
    if (!deleted) {
      res.status(404).json(errorResponse('Subscriber not found'));
      return;
    }
    res.status(200).json(successResponse(null, 'Subscriber deleted successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete subscriber', [(err as Error).message]));
  }
}
