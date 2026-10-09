import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle, AlertCircle, X, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import PasswordStrengthIndicator, { getPasswordMetrics } from './PasswordStrengthIndicator';

const ForgotPasswordModal = ({ isOpen, onClose, onSuccessLogin }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [demoOtp, setDemoOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [resendTimer, setResendTimer] = useState(60);

    const otpInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    // Timer countdown for Step 2
    useEffect(() => {
        let interval = null;
        if (step === 2 && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [step, resendTimer]);

    if (!isOpen) return null;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError('Please enter a valid email address');
        }

        setIsLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            if (res.success) {
                setDemoOtp(res.data.otp || '');
                setMessage(res.message || 'OTP code sent to your email!');
                setStep(2);
                setResendTimer(60);
                setTimeout(() => {
                    otpInputRefs[0]?.current?.focus();
                }, 200);
            }
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please check if email is registered.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpDigits];
        newOtp[index] = value.slice(-1);
        setOtpDigits(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            otpInputRefs[index + 1]?.current?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs[index - 1]?.current?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtpDigits(digits);
            otpInputRefs[5]?.current?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const fullOtp = otpDigits.join('');
        if (fullOtp.length < 6) {
            return setError('Please enter the full 6-digit OTP pin');
        }

        setIsLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp: fullOtp });
            if (res.success) {
                setResetToken(res.data.resetToken);
                setMessage('OTP Verified! Now set your new password.');
                setStep(3);
            }
        } catch (err) {
            setError(err.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const passMetrics = getPasswordMetrics(newPassword);
        if (!passMetrics.isAllValid) {
            return setError('Password does not satisfy all security requirements');
        }

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setIsLoading(true);
        try {
            const res = await api.post('/auth/reset-password', {
                email,
                resetToken,
                newPassword
            });
            if (res.success) {
                setStep(4);
            }
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoFillOtp = () => {
        if (demoOtp && demoOtp.length === 6) {
            setOtpDigits(demoOtp.split(''));
            otpInputRefs[5]?.current?.focus();
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(5, 46, 22, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%', maxWidth: '460px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                overflow: 'hidden',
                position: 'relative',
                animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 28px 20px',
                    background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
                    color: '#fff',
                    position: 'relative'
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', right: '16px', top: '16px',
                        background: 'rgba(255,255,255,0.15)', border: 'none',
                        color: '#fff', width: '32px', height: '32px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'background 0.2s'
                    }}>
                        <X size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(74, 222, 128, 0.2)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(74, 222, 128, 0.3)'
                        }}>
                            <KeyRound size={20} color="#4ade80" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                            {step === 1 && 'Forgot Password / पासवर्ड रीसेट'}
                            {step === 2 && 'Enter Verification OTP'}
                            {step === 3 && 'Create New Password'}
                            {step === 4 && 'Password Reset Complete!'}
                        </h3>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.86rem', margin: 0 }}>
                        {step === 1 && 'Enter your email to receive a 6-digit verification code.'}
                        {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
                        {step === 3 && 'Choose a strong, secure password for your Sudharak account.'}
                        {step === 4 && 'Your password has been successfully updated.'}
                    </p>

                    {/* Step progress pills */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{
                                flex: 1, height: '4px', borderRadius: '2px',
                                backgroundColor: step >= s ? '#4ade80' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px 28px' }}>
                    {error && (
                        <div style={{
                            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                            color: '#dc2626', padding: '12px 14px', borderRadius: 'var(--radius-md)',
                            marginBottom: '18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Step 1: Send OTP */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label className="form-label">Registered Email / पंजीकृत ईमेल</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-mutated)' }} />
                                    <input
                                        type="email"
                                        className="form-input"
                                        style={{ paddingLeft: '42px' }}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px', fontSize: '0.98rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending OTP code...' : <><span>Send OTP Code / OTP भेजें</span><ArrowRight size={17} /></>}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp}>
                            {demoOtp && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(34,197,94,0.08))',
                                    border: '1px solid rgba(74,222,128,0.4)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '12px 14px',
                                    marginBottom: '20px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justify: 'space-between'
                                }}>
                                    <div>
                                        <span style={{ color: '#166534', fontWeight: 700 }}>📩 Verification Code: </span>
                                        <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: '#14532d', marginLeft: '4px' }}>{demoOtp}</strong>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAutoFillOtp}
                                        style={{
                                            background: '#166534', color: '#fff', border: 'none',
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem',
                                            fontWeight: 600, cursor: 'pointer'
                                        }}
                                    >
                                        Auto Fill
                                    </button>
                                </div>
                            )}

                            <label className="form-label" style={{ marginBottom: '12px', display: 'block', textAlign: 'center' }}>
                                Enter 6-Digit OTP Pin
                            </label>

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                                {otpDigits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={otpInputRefs[idx]}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                                        style={{
                                            width: '46px',
                                            height: '52px',
                                            textAlign: 'center',
                                            fontSize: '1.4rem',
                                            fontWeight: 800,
                                            borderRadius: 'var(--radius-md)',
                                            border: digit ? '2px solid var(--color-moss)' : '1px solid var(--color-border)',
                                            backgroundColor: digit ? 'rgba(74,222,128,0.06)' : '#fff',
                                            outline: 'none',
                                            boxShadow: digit ? '0 0 0 3px rgba(74, 222, 128, 0.2)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px', fontSize: '0.98rem', marginBottom: '16px' }}
                                disabled={isLoading || otpDigits.join('').length < 6}
                            >
                                {isLoading ? 'Verifying...' : <><span>Verify OTP Pin</span><ShieldCheck size={18} /></>}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-text-body)', cursor: 'pointer', padding: 0 }}
                                >
                                    ← Change Email
                                </button>
                                {resendTimer > 0 ? (
                                    <span style={{ color: 'var(--color-text-mutated)' }}>Resend code in <strong>{resendTimer}s</strong></span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-moss)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <RefreshCw size={14} /> Resend OTP
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">New Password / नया पासवर्ड</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-mutated)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        style={{ paddingLeft: '42px', paddingRight: '42px' }}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-mutated)', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Strength Meter & Live Checklist */}
                            <PasswordStrengthIndicator password={newPassword} showChecklist={true} />

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label className="form-label">Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-mutated)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        style={{ paddingLeft: '42px' }}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {confirmPassword && (
                                    <div style={{
                                        fontSize: '0.78rem', marginTop: '6px',
                                        color: newPassword === confirmPassword ? '#166534' : '#dc2626',
                                        fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px', fontSize: '0.98rem' }}
                                disabled={isLoading || !getPasswordMetrics(newPassword).isAllValid || newPassword !== confirmPassword}
                            >
                                {isLoading ? 'Updating Password...' : 'Reset Password / पासवर्ड अपडेट करें'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16a34a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px', border: '2px solid rgba(34, 197, 94, 0.3)'
                            }}>
                                <CheckCircle size={36} />
                            </div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-deep)', marginBottom: '8px' }}>
                                Password Reset Successful! 🎉
                            </h4>
                            <p style={{ color: 'var(--color-text-body)', fontSize: '0.92rem', marginBottom: '24px' }}>
                                Your password has been successfully changed. You can now sign in with your new password.
                            </p>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px' }}
                            >
                                Back to Login / लॉग इन करें
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}} />
        </div>
    );
};

export default ForgotPasswordModal;
