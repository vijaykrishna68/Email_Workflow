import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
//import { useAuthStore } from '../store/authStore';
import { apiClient } from '../services/api';


interface Email {
  _id: string;
  from?: string;
  subject?: string;
  snippet?: string;
  internalDate?: number;
}

const EmailsList: React.FC = () => {
  //const { user } = useAuthStore();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch recent emails
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/emails/list?maxResults=10');
        setEmails(res.data.data.messages || []);
      } catch (err) {
        console.error('❌ Failed to fetch emails:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  // Fetch single email details
  const handleSelectEmail = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/emails/${id}`);
      setSelectedEmail(res.data.data);
    } catch (err) {
      console.error('❌ Failed to fetch email details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Email List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {!loading && emails.length === 0 && (
            <p className="text-sm text-gray-500">No emails found.</p>
          )}
          <ul className="space-y-3">
            {emails.map((email) => (
              <li
                key={email._id}
                className="cursor-pointer p-3 border rounded-md hover:bg-gray-50"
                onClick={() => handleSelectEmail(email._id)}
              >
                <p className="text-sm font-medium">{email.subject || '(No subject)'}</p>
                <p className="text-xs text-gray-500 truncate">{email.from || 'Unknown sender'}</p>
                <p className="text-xs text-gray-400 truncate">{email.snippet}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Email Details */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEmail ? (
            <div>
              <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
              <p className="text-sm text-gray-500">From: {selectedEmail.from}</p>
              <p className="mt-4 text-gray-700">{selectedEmail.snippet}</p>
              {selectedEmail.internalDate && (
                <p className="mt-2 text-xs text-gray-400">
                  Received: {new Date(selectedEmail.internalDate).toLocaleString()}
                </p>
              )}
              <Button className="mt-4">Reply</Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select an email to view details</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailsList;
