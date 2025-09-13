import { Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';
import User from '../models/User';
import axios from 'axios';
import jwt from 'jsonwebtoken'; // ✅ CHANGE: import jwt for issuing app tokens

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID as string;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI as string;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth env vars (GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI)');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export class OauthController {
  static async googleOAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oauth2Client = getOAuthClient();
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
      });
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query as { code?: string };
      if (!code) {
        res.status(400).json({ success: false, message: 'Missing authorization code' });
        return;
      }

      const oauth2Client = getOAuthClient();
      const { tokens } = await oauth2Client.getToken(code);
      console.log('✅ Google Tokens:', tokens);

      const accessToken = tokens.access_token;

      const meResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const me = meResponse.data;

      const email = me.email?.toLowerCase();
      const name = me.name || 'Google User';

      if (!email) {
        res.status(400).json({ success: false, message: 'Unable to retrieve user email from Google' });
        return;
      }

      let user = await User.findOne({ email }).select('+password');
      if (!user) {
        user = new User({
          name,
          email,
          isEmailVerified: true,
        });
      }

      // ✅ Store Google tokens in user for Gmail/Calendar API access
      user.googleOAuthTokens = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type,
        id_token: tokens.id_token,
      } as Record<string, any>;

      await user.save();

      const userObj = user.toObject() as any;
      delete userObj.password;
      delete userObj.refreshTokens;

      // ✅ CHANGE: Issue your app’s JWT tokens
      const appAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '15m',
      });
      const appRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
      });

      // Save refresh token in DB
      user.refreshTokens.push(appRefreshToken);
      await user.save();

      // ✅ CHANGE: Send app tokens + user object to frontend
      const payload = {
        user: userObj,
        accessToken: appAccessToken,
        refreshToken: appRefreshToken,
      };

      console.log('✅ Redirecting to frontend dashboard with payload');
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?data=${encodeURIComponent(JSON.stringify(payload))}`);
    } catch (error) {
      console.error('❌ Google OAuth Callback Error:', error);
      next(error);
    }
  }
}
