import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const GoogleSuccessPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If already logged in, redirect based on role
    if (isAuthenticated) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
        const redirectPath = redirectAfterLogin 
          ? (() => { localStorage.removeItem('redirectAfterLogin'); return redirectAfterLogin; })()
          : (user?.role === 'admin' ? '/admin-dashboard' : '/menu');
        navigate(redirectPath, { replace: true });
      } else {
        const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
        const redirectPath = redirectAfterLogin
          ? (() => { localStorage.removeItem('redirectAfterLogin'); return redirectAfterLogin; })()
          : '/menu';
        navigate(redirectPath, { replace: true });
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role') || 'user';

    if (!token) {
      navigate('/login?error=google_auth_failed', { replace: true });
      return;
    }

    // Persist auth info like other login paths
    localStorage.setItem('authToken', token);
    authAPI.getProfile()
      .then((resp) => {
        localStorage.setItem('user', JSON.stringify(resp.data));
      })
      .catch(() => {
        //keep minimal info so app doesn't crash
        localStorage.setItem('user', JSON.stringify({ role }));
      })
      .finally(() => {
        // Check if there's a redirect path stored
        const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
        let redirectPath;
        
        if (redirectAfterLogin) {
          localStorage.removeItem('redirectAfterLogin');
          redirectPath = redirectAfterLogin;
        } else {
          //admins go to dashboard, users go to menu
          redirectPath = role === 'admin' ? '/admin-dashboard' : '/menu';
        }
        
        // reload app so AuthContext picks it up on mount
        window.location.href = redirectPath;
      });

  }, [navigate, isAuthenticated]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img src="/big-bite-logo.png" alt="Big-Bite" className="auth-logo" />
          <h2>Signing you in with Google...</h2>
        </div>
        <p>Please wait a moment.</p>
      </div>
    </div>
  );
};

export default GoogleSuccessPage;


