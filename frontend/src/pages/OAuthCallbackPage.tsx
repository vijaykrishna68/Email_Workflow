import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();
  const query = new URLSearchParams(useLocation().search);
  const code = query.get('code');

  useEffect(() => {
    if (code) {
      loginWithGoogle(code)
        .then(() => {
          navigate('/dashboard'); // Redirect after successful login
        })
        .catch(() => {
          navigate('/login'); // Fallback to login if something fails
        });
    } else {
      navigate('/login'); // Redirect to login if no code
    }
  }, [code, loginWithGoogle, navigate]);

  return <div className="text-center mt-10">Logging you in…</div>;
};

export default OAuthCallbackPage;
