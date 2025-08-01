import express from 'express';
import {
  requestCancellation,
  getCancellationRequests,
  respondToCancellation
} from '../controllers/bookingController.js';
import { auth, userAuth, ownerAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/:id/request-cancellation', auth, userAuth, requestCancellation);

router.get('/owner/cancellation-requests', ownerAuth, getCancellationRequests);

router.put('/:id/respond-cancellation', ownerAuth, respondToCancellation);


export default router;
