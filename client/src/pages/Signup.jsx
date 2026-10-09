import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Mail, Lock, Shield, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import PasswordStrengthIndicator, { getPasswordMetrics } from '../components/PasswordStrengthIndicator';
import Logo from '../components/Logo';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CITIZEN'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(null);

    const { loginWithGoogle, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/community', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id.apps.googleusercontent.com',
                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signup-btn'),
                { theme: 'outline', size: 'large', width: '100%' }
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
            const success = await loginWithGoogle({
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture
            });
            
            if (success) navigate('/community', { replace: true });
        } catch (err) {
            setFormError('Failed to process Google signup');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'email') {
            if (!value) setIsEmailValid(null);
            else {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                setIsEmailValid(regex.test(value));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!isEmailValid) {
            return setFormError('Please enter a valid email address');
        }

        const passMetrics = getPasswordMetrics(formData.password);
        if (!passMetrics.isAllValid) {
            return setFormError('Password does not satisfy all security requirements (min 8 chars, uppercase, lowercase, digit, special symbol)');
        }

        if (formData.password !== formData.confirmPassword) {
            return setFormError('Password and Confirm Password do not match');
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            if (response.success) {
                localStorage.setItem('sudharak_token', response.data.token);
                window.location.href = '/community';
            }
        } catch (err) {
            setFormError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const passMetrics = getPasswordMetrics(formData.password);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            backgroundImage: 'url("/images/auth_login_real.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            paddingTop: '40px',
            paddingBottom: '40px',
            animation: 'fadeIn 0.6s ease both'
        }}>
            {/* Dark blur overlay for immersive realistic feel */}
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)', zIndex: 0 }}></div>

            <div className="modal-content-enter" style={{
                width: '100%', maxWidth: '480px',
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                padding: '36px 32px',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                position: 'relative', zIndex: 1, margin: '0 20px'
            }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                        <Logo size="lg" layout="vertical" showTagline={true} />
                    </div>

                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px', color: '#0f172a' }}>
                            Account बनाएं 🚀
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Create your account to start reporting and funding civic resolutions.
                        </p>
                    </div>

                    {/* Role selector tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: '#e2e8f0', borderRadius: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, role: 'CITIZEN' }))}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem',
                                background: formData.role === 'CITIZEN' ? '#ffffff' : 'transparent',
                                color: formData.role === 'CITIZEN' ? '#166534' : '#64748b',
                                boxShadow: formData.role === 'CITIZEN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s', border: 'none', cursor: 'pointer'
                            }}
                        >
                            🌱 Citizen / नागरिक
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, role: 'GOVERNMENT' }))}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem',
                                background: formData.role === 'GOVERNMENT' ? '#ffffff' : 'transparent',
                                color: formData.role === 'GOVERNMENT' ? '#166534' : '#64748b',
                                boxShadow: formData.role === 'GOVERNMENT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s', border: 'none', cursor: 'pointer'
                            }}
                        >
                            🛡️ Gov Official
                        </button>
                    </div>

                    {/* Google Signup */}
                    <div id="google-signup-btn" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                        <span style={{ padding: '0 14px', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>or register with email</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    </div>

                    {formError && (
                        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '14px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                            <div>
                                <strong>Signup Failed</strong><br/>
                                {formError}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text" name="name" className="form-input" style={{ paddingLeft: '44px' }}
                                    placeholder="Ramesh Kumar" value={formData.name} onChange={handleChange} required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Email Address</span>
                                {isEmailValid !== null && (
                                    <span style={{ fontSize: '0.75rem', color: isEmailValid ? '#166534' : '#dc2626', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                        {isEmailValid ? 'VALID' : 'INVALID'}
                                    </span>
                                )}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email" name="email" className="form-input"
                                    style={{
                                        paddingLeft: '44px',
                                        paddingRight: '36px',
                                        borderColor: isEmailValid === false ? '#ef4444' : isEmailValid === true ? '#22c55e' : undefined
                                    }}
                                    placeholder="ramesh@example.com" value={formData.email} onChange={handleChange} required
                                />
                                {isEmailValid && (
                                    <CheckCircle2 size={16} color="#22c55e" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                )}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label className="form-label">Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'} name="password" className="form-input"
                                    style={{ paddingLeft: '44px', paddingRight: '44px' }} placeholder="••••••••"
                                    value={formData.password} onChange={handleChange} required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Password Strength Indicator with Live Checklist */}
                        <div style={{ marginBottom: '20px' }}>
                            <PasswordStrengthIndicator password={formData.password} showChecklist={true} />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'} name="confirmPassword" className="form-input"
                                    style={{ paddingLeft: '44px' }} placeholder="••••••••"
                                    value={formData.confirmPassword} onChange={handleChange} required
                                />
                            </div>
                            {formData.confirmPassword && (
                                <div style={{
                                    fontSize: '0.75rem', marginTop: '6px', fontFamily: 'var(--font-mono)',
                                    color: formData.password === formData.confirmPassword ? '#166534' : '#dc2626',
                                    fontWeight: 700
                                }}>
                                    {formData.password === formData.confirmPassword ? 'MATCHING' : 'NOT MATCHING'}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary-green btn-press anim-glow-pulse"
                            style={{ width: '100%', padding: '15px', fontSize: '1rem', fontWeight: 800, justifyContent: 'center' }}
                            disabled={isLoading || !isEmailValid || !passMetrics.isAllValid || formData.password !== formData.confirmPassword}
                        >
                            {isLoading ? 'Account बन रहा है...' : <><span>Create Set Account</span><ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: '#64748b' }}>
                        पहले से account है? <Link to="/login" style={{ fontWeight: 800, color: '#166534' }}>Log in</Link>
                    </div>
                </div>

        </div>
    );
};

export default Signup;
