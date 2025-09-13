import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  googleOAuthTokens?: Record<string, any>;
  avatar?: string;
  isEmailVerified: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // ✅ creates a unique index automatically
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true, // ✅ already creates an index
    },
    githubId: {
      type: String,
      sparse: true,
      unique: true, // ✅ already creates an index
    },
    googleOAuthTokens: {
      type: Schema.Types.Mixed,
      default: {},
    },
    avatar: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ❌ Remove duplicate schema.index() calls
// UserSchema.index({ email: 1 });
// UserSchema.index({ googleId: 1 });
// UserSchema.index({ githubId: 1 })

export default mongoose.model<IUser>('User', UserSchema);
