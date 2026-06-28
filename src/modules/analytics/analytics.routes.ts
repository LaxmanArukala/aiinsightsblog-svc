import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router({ mergeParams: true }); // mergeParams exposes :blogId from parent

router.post('/views',     analyticsController.postView);
router.get('/views',      analyticsController.getViews);

router.post('/likes',     analyticsController.postLike);
router.get('/likes',      analyticsController.getLikes);

router.post('/bookmarks', analyticsController.postBookmark);
router.get('/bookmarks',  analyticsController.getBookmarks);

router.post('/shares',    analyticsController.postShare);
router.get('/shares',     analyticsController.getShares);

export default router;
