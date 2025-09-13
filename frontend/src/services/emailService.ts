// frontend/src/services/emailService.ts
import axios from 'axios';
//import { EmailListResponse } from '../types'; // define minimal types below if needed

export async function fetchEmails(maxResults = 20, q?: string) {
  const res = await axios.get<{ success: boolean; data: any }>(`/api/email/list`, {
    params: { maxResults, q },
  });
  return res.data;
}

export async function fetchEmailById(id: string) {
  const res = await axios.get(`/api/email/${id}`);
  return res.data;
}
