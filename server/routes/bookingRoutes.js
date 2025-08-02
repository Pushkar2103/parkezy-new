import express from 'express';
import {
  requestCancellation,
  getCancellationRequests,
  respondToCancellation,
  requestCompletion,
  getCompletionRequests,
  respondToCompletion
} from '../controllers/bookingController.js';
import { auth, userAuth } from '../middlewares/authMiddleware.js';
import { ownerAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- User Routes ---
router.put('/:id/request-cancellation', auth, userAuth, requestCancellation);
router.put('/:id/request-completion', auth, userAuth, requestCompletion); 

// --- Owner Routes ---
router.get('/owner/cancellation-requests', ownerAuth, getCancellationRequests);
router.put('/:id/respond-cancellation', ownerAuth, respondToCancellation);
router.get('/owner/completion-requests', ownerAuth, getCompletionRequests); 
router.put('/:id/respond-completion', ownerAuth, respondToCompletion);     

export default router;
