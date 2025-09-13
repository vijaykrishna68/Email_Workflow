import { Request, Response, NextFunction } from 'express';
import { fetchAndPersistRecentEmails, listMessagesForUser, getMessageForUser } from '../services/gmailService';

export async function listEmails(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    if (!user) {
      console.error("❌ No user found in request");
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log("📩 User from request:", user._id, user.email);
    console.log("📩 Stored tokens:", user.googleOAuthTokens);

    const maxResults = Math.min(Number(req.query.maxResults ?? 20), 100);
    const q = req.query.q as string | undefined;

    const { messages, resultSizeEstimate } = await listMessagesForUser(user._id, maxResults, q);

    return res.status(200).json({
      success: true,
      message: 'Emails fetched',
      data: {
        resultSizeEstimate,
        messages,
      },
    });
  } catch (err) {
    console.error("❌ Error in listEmails:", err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: String(err) });
  }
}


export async function getEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const messageId = req.params.id;
    if (!messageId) return res.status(400).json({ success: false, message: 'Missing message id' });

    const item = await getMessageForUser(user._id, messageId);
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    return next(err);
  }
}
