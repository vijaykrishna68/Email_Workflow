import User, { IUser } from '../models/User';

export interface UpdateUserData {
  name?: string;
  avatar?: string;
}

export class UserService {
  static async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select('-password -refreshTokens');
  }

  static async updateUser(userId: string, data: UpdateUserData): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    return user;
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  }

  static async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: IUser[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find().select('-password -refreshTokens').skip(skip).limit(limit),
      User.countDocuments()
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  static async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<{
    users: IUser[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i');

    const [users, total] = await Promise.all([
      User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('-password -refreshTokens').skip(skip).limit(limit),
      User.countDocuments({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      })
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  }
}
