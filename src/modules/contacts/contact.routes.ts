import { Router } from 'express';
import * as contactController from './contact.controller';

const router = Router();

router.get('/',       contactController.getContacts);
router.post('/',      contactController.createContact);
router.get('/:id',    contactController.getContactById);
router.delete('/:id', contactController.deleteContact);

export default router;
