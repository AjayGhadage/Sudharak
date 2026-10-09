import express from 'express';
import { 
  analyzeIssue, 
  createIssue, 
  getIssues, 
  getIssueById, 
  toggleUpvote, 
  addComment, 
  reopenIssue,
  acceptIssueByOfficer,
  resolveIssueWithProof 
} from '../controllers/issue.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { aiAnalysisLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/analyze', authenticateToken, aiAnalysisLimiter, upload.single('image'), analyzeIssue);
router.post('/', authenticateToken, createIssue);
router.get('/', optionalAuth, getIssues);
router.get('/:id', optionalAuth, getIssueById);
router.post('/:id/upvote', authenticateToken, toggleUpvote);
router.post('/:id/comments', authenticateToken, addComment);
router.post('/:id/reopen', authenticateToken, reopenIssue);
router.post('/:id/accept', authenticateToken, acceptIssueByOfficer);
router.post('/:id/resolve', authenticateToken, upload.single('repair_proof'), resolveIssueWithProof);

export default router;
