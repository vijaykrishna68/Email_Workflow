// backend/src/routes/emailRoutes.ts
import { Router } from 'express';
import { listEmails, getEmail } from '../controllers/emailController';
import { authenticateToken } from '../middlewares/auth'; // use your existing auth middleware

const router = Router();

router.get('/list',authenticateToken, listEmails); // matches /api/emails
router.get('/:id',authenticateToken,  getEmail);


export default router;
