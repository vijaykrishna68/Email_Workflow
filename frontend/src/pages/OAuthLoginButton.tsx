import React from 'react'


const OAuthLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google/oauth';
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Sign in with Google
    </button>
  );
};

export default OAuthLoginButton