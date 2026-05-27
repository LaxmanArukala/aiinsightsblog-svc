import { Router } from 'express';
import * as subscriberController from './subscriber.controller';

const router = Router();

router.get('/',       subscriberController.getSubscribers);
router.post('/',      subscriberController.createSubscriber);
router.get('/:id',    subscriberController.getSubscriberById);
router.put('/:id',    subscriberController.updateSubscriber);
router.delete('/:id', subscriberController.deleteSubscriber);

export default router;
