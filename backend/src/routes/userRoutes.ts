import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireAuth } from '../middlewares/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireAuth);

// Validation middleware
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Routes
router.get('/profile', UserController.getProfile);
router.put('/profile', updateProfileValidation, UserController.updateProfile);
router.delete('/profile', UserController.deleteProfile);
router.get('/', UserController.getAllUsers);
router.get('/search', UserController.searchUsers);

export default router;
