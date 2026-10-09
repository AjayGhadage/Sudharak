import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import Logo from '../components/Logo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    const { login, loginWithGoogle, isAuthenticated, error, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/community';

    useEffect(() => {
        if (isAuthenticated) navigate(from, { replace: true });
    }, [isAuthenticated, navigate, from]);

    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id.apps.googleusercontent.com',
                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                { theme: 'outline', size: 'large', width: '250', shape: 'pill' }
            );
        }
    }, []);

    const handleGoogleResponse = async (response) => {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            const payload = JSON.parse(jsonPayload);
            const success = await loginWithGoogle({ googleId: payload.sub, email: payload.email, name: payload.name, picture: payload.picture });
            if (success) navigate(from, { replace: true });
        } catch (err) {
            setFormError('Failed to process Google login');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!email || !password) {
            return setFormError('All fields are required');
        }

        const success = await login(email, password);
        if (success) navigate(from, { replace: true });
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: 'url("/images/auth_login_real.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            animation: 'fadeIn 0.6s ease both'
        }}>
            {/* Dark blurred overlay */}
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', zIndex: 0 }}></div>

            <div className="modal-content-enter" style={{
                width: '100%', maxWidth: '420px',
                backgroundColor: '#ffffff',
                padding: '40px 32px',
                borderRadius: '24px',
                position: 'relative', zIndex: 1, margin: '0 20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Professional Logo Header */}
                <div style={{ marginBottom: '20px' }}>
                    <Logo size="lg" layout="vertical" showTagline={true} />
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '6px', color: '#1a1f2c', letterSpacing: '-0.5px' }}>
                    Welcome Back
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>
                    Sign in to access your dashboard
                </p>

                {(error || formError) && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', width: '100%', textAlign: 'center' }}>
                        {(error || formError)}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="email"
                                className="input-animated"
                                style={{
                                    width: '100%', padding: '14px 14px 14px 44px',
                                    borderRadius: '12px', border: '1px solid #e2e8f0',
                                    fontSize: '0.95rem', color: '#1e293b', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                placeholder="Email Address"
                                value={email} onChange={(e) => setEmail(e.target.value)} required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="password"
                                className="input-animated"
                                style={{
                                    width: '100%', padding: '14px 14px 14px 44px',
                                    borderRadius: '12px', border: '1px solid #e2e8f0',
                                    fontSize: '0.95rem', color: '#1e293b', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                placeholder="Password"
                                value={password} onChange={e => setPassword(e.target.value)} required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setIsForgotModalOpen(true)}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" 
                        className="btn-press"
                        style={{ 
                            width: '100%', padding: '14px', 
                            fontSize: '0.95rem', fontWeight: 800, 
                            backgroundColor: '#1a1f2c', color: '#ffffff',
                            borderRadius: '10px', border: 'none',
                            cursor: 'pointer', transition: 'background 0.2s',
                            animation: 'glowPulse 2s ease-in-out infinite'
                        }} 
                        disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                    New to Sudharak? <Link to="/signup" style={{ color: '#64748b', textDecoration: 'none' }}>Create an account</Link>
                </div>

                <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' }}></div>

                {/* Google Sign In Container */}
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <div id="google-signin-btn"></div>
                </div>
            </div>

            <ForgotPasswordModal
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
            />
        </div>
    );
};

export default Login;
