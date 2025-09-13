import { Router } from 'express';
import User from '../models/User';

const router = Router();

// GET /api/test/users - Test route to check and create dummy users
router.get('/users', async (req, res) => {
  try {
    // Check if there are any User documents in the DB
    const userCount = await User.countDocuments();
    
    // If no users exist, create a dummy user
    if (userCount === 0) {
      const dummyUser = new User({
        email: 'test@example.com',
        name: 'Test User',
        googleOAuthTokens: {}
      });
      
      await dummyUser.save();
      console.log('✅ Dummy user created successfully');
    }
    
    // Return all User documents
    const users = await User.find().select('-password -refreshTokens');
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        count: users.length,
        users: users
      }
    });
  } catch (error) {
    console.error('❌ Error in test route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
