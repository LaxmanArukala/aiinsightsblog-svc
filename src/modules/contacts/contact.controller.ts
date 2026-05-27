import { Request, Response } from 'express';
import * as contactService from './contact.service';
import { ContactListQuery } from './contact.types';
import { errorResponse, successResponse } from '../../lib/response';

export async function getContacts(req: Request, res: Response): Promise<void> {
  try {
    const query: ContactListQuery = {
      page:  req.query.page  ? Number.parseInt(req.query.page  as string, 10) : 1,
      limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10,
    };
    const result = await contactService.getContacts(query);
    res.json(successResponse(result, 'Contacts fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch contacts', [(err as Error).message]));
  }
}

export async function getContactById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const contact = await contactService.getContactById(id);
    if (!contact) {
      res.status(404).json(errorResponse('Contact not found'));
      return;
    }
    res.json(successResponse(contact, 'Contact fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch contact', [(err as Error).message]));
  }
}

export async function createContact(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json(errorResponse('Validation failed', ['name, email, subject and message are required']));
      return;
    }

    const contact = await contactService.createContact({ name, email, subject, message });
    res.status(201).json(successResponse(contact, 'Contact created successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to create contact', [(err as Error).message]));
  }
}

export async function deleteContact(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await contactService.deleteContact(id);
    if (!deleted) {
      res.status(404).json(errorResponse('Contact not found'));
      return;
    }
    res.status(200).json(successResponse(null, 'Contact deleted successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete contact', [(err as Error).message]));
  }
}
