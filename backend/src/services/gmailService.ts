// backend/src/services/gmailService.ts
import { google } from 'googleapis';
import User, { IUser } from '../models/User';
import Email from '../models/Email';

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID as string;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI as string;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth env vars');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Create an authenticated oauth2 client for a given user using stored tokens
 */
export async function getOAuthClientForUser(user: IUser) {
  const oauth2Client = getOAuth2Client();

  if (user.googleOAuthTokens) {
    oauth2Client.setCredentials({
      access_token: user.googleOAuthTokens.access_token,
      refresh_token: user.googleOAuthTokens.refresh_token,
      expiry_date: user.googleOAuthTokens.expiry_date,
      id_token: user.googleOAuthTokens.id_token,
    });
  } else {
    throw new Error('User has no googleOAuthTokens');
  }

  // Persist refreshed tokens
  (oauth2Client as any).on &&
    (oauth2Client as any).on('tokens', async (tokens: any) => {
      try {
        if (tokens.refresh_token || tokens.access_token) {
          user.googleOAuthTokens = {
            ...user.googleOAuthTokens,
            ...tokens,
          } as Record<string, any>;
          await user.save();
        }
      } catch (err) {
        console.error('Failed to persist refreshed google tokens', err);
      }
    });

  return oauth2Client;
}

/**
 * ✅ Fetch list of messages WITH details (from, subject, snippet, etc.)
 */
export async function listMessagesForUser(userId: string, maxResults = 20, q?: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oauth2Client = await getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q,
  });

  const messages = res.data.messages || [];

  // ✅ Fetch details for each message
  const detailedMessages = await Promise.all(
    messages.map(async (m) => {
      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: m.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = detail.data.payload?.headers || [];
        const from = headers.find((h) => h.name === 'From')?.value;
        const subject = headers.find((h) => h.name === 'Subject')?.value;

        return {
          _id: m.id,
          threadId: detail.data.threadId,
          snippet: detail.data.snippet,
          from,
          subject,
          internalDate: Number(detail.data.internalDate),
        };
      } catch (err) {
        console.warn('Failed to fetch details for message', m.id, err);
        return null;
      }
    })
  );

  return {
    messages: detailedMessages.filter((m) => m !== null),
    resultSizeEstimate: res.data.resultSizeEstimate ?? 0,
  };
}


/**
 * Fetch a single message by id
 */
export async function getMessageForUser(userId: string, messageId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oauth2Client = await getOAuthClientForUser(user);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'metadata',
    metadataHeaders: ['From', 'To', 'Subject', 'Date'],
  });

  const payload = res.data.payload;
  const headers = payload?.headers || [];
  const headerMap: Record<string, string> = {};
  headers.forEach((h: any) => (headerMap[h.name] = h.value));

  return {
    messageId,
    threadId: res.data.threadId,
    snippet: res.data.snippet || '',
    from: headerMap['From'],
    to: headerMap['To'],
    subject: headerMap['Subject'],
    internalDate: Number(res.data.internalDate),
  };
}

/**
 * Fetch and persist recent emails (optional)
 */
export async function fetchAndPersistRecentEmails(userId: string, maxResults = 20) {
  const { messages } = await listMessagesForUser(userId, maxResults);
  const items: any[] = [];

  for (const m of messages) {
    try {
      await Email.findOneAndUpdate(
        { messageId: m._id, userId },
        {
          $set: {
            ...m,
            userId,
            fetchedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      items.push(m);
    } catch (err) {
      console.warn('Failed to persist message', m._id, err);
    }
  }

  return items;
}
