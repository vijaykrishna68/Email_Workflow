import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'password' | 'refreshTokens'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens((user._id as any).toString());

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Return user without password and refresh tokens
    const userResponse = user.toObject() as any;
    delete userResponse.password;
    delete userResponse.refreshTokens;

    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens((user._id as any).toString());

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Return user without password and refresh tokens
    const userResponse = user.toObject() as any;
    delete userResponse.password;
    delete userResponse.refreshTokens;

    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      
      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new Error('Invalid refresh token');
      }

      const { accessToken } = this.generateTokens((user._id as any).toString());
      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: refreshToken } }
    );
  }

  static async logoutAll(userId: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $set: { refreshTokens: [] } }
    );
  }
}
