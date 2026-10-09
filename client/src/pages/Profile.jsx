import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, LogOut, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, AlertCircle, Award, History, HeartHandshake, Camera, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrengthIndicator, { getPasswordMetrics } from '../components/PasswordStrengthIndicator';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('reports');
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Password Update State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [passMsg, setPassMsg] = useState('');
    const [passErr, setPassErr] = useState('');
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);
    
    // Avatar upload demo state
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Citizen')}`);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/issues');
                if (res.success && user) {
                    setMyIssues(res.data.filter(i => i.user_id === user.id || i.user_name === user.name));
                }
            } catch (error) {
                console.error("Failed to load user issues", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Demo implementation: generate local blob URL for instant UI update
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
            // In a real app, this would hit api.post('/users/avatar', formData)
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPassErr('');
        setPassMsg('');

        const passMetrics = getPasswordMetrics(newPassword);
        if (!passMetrics.isAllValid) {
            return setPassErr('New password must satisfy all security requirements (min 8 chars, uppercase, lowercase, digit, special symbol)');
        }

        if (newPassword !== confirmPassword) {
            return setPassErr('New password and confirm password do not match');
        }

        setIsUpdatingPass(true);
        try {
            // Re-use reset-password endpoint with current email & reset token or demo flow
            const res = await await api.post('/auth/forgot-password', { email: user.email });
            if (res.success && res.data.otp) {
                const verifyRes = await api.post('/auth/verify-otp', { email: user.email, otp: res.data.otp });
                if (verifyRes.success) {
                    const resetRes = await api.post('/auth/reset-password', {
                        email: user.email,
                        resetToken: verifyRes.data.resetToken,
                        newPassword
                    });
                    if (resetRes.success) {
                        setPassMsg('Password updated successfully! Next login will require your new password.');
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }
                }
            }
        } catch (err) {
            setPassErr(err.message || 'Failed to update password');
        } finally {
            setIsUpdatingPass(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                
                {/* Profile Header Card */}
                <div className="reference-card" style={{ padding: '36px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
                    
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img 
                            src={avatarUrl} 
                            alt={user.name} 
                            style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '4px solid #166534', objectFit: 'cover' }} 
                        />
                        <label 
                            htmlFor="avatar-upload"
                            style={{ position: 'absolute', bottom: '0px', right: '0px', backgroundColor: '#22c55e', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title="Update Profile Picture"
                        >
                            <Camera size={16} />
                            <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                        </label>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#0f172a' }}>{user.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '16px', flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><MapPin size={16} /> {user.location || 'Pune, India'}</span>
                            <span style={{ padding: '4px 12px', background: '#eab308', color: 'white', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                                {(user.karma || 10) > 100 ? '🛡️ CIVIC GUARDIAN' : ((user.karma || 10) > 50 ? '🌟 ECO WARRIOR' : '🌱 CIVIC RECRUIT')}
                            </span>
                            <span style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #86efac' }}>
                                ROLE: {user.role || 'CITIZEN'}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {[
                                { value: myIssues.length, label: 'Reports', icon: '📍' },
                                { value: `₹0`, label: 'Funded', icon: '💰' },
                                { value: myIssues.reduce((sum, i) => sum + (i.upvotes || 0), 0), label: 'Upvotes', icon: '👍' },
                                { value: user.karma || 10, label: 'Karma Points', icon: '🌟' },
                            ].map(({ value, label, icon }) => (
                                <div key={label} style={{ textAlign: 'center', padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', minWidth: '100px', flex: '1 1 auto' }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>{value}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{icon} {label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
                        <button onClick={handleLogout} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', color: '#dc2626', fontWeight: 700, backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                {/* Premium App Settings Navigation UI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {[
                        { id: 'reports', label: 'My Issue Reports', icon: <MapPin size={20} /> },
                        { id: 'donations', label: 'My Escrow Funding', icon: <HeartHandshake size={20} /> },
                        { id: 'history', label: 'Karma & Achievements', icon: <Award size={20} /> },
                        { id: 'security', label: 'Account Security & Password', icon: <KeyRound size={20} /> },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                padding: '18px 24px', 
                                background: activeTab === tab.id ? '#ffffff' : '#ffffff', 
                                borderRadius: '16px', 
                                border: activeTab === tab.id ? '2px solid #22c55e' : '1px solid #e2e8f0', 
                                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(34,197,94,0.15)' : '0 2px 5px rgba(0,0,0,0.02)', 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== tab.id) e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== tab.id) e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: activeTab === tab.id ? '#166534' : '#334155', fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-body)' }}>
                                <div style={{ padding: '8px', backgroundColor: activeTab === tab.id ? '#dcfce7' : '#f1f5f9', borderRadius: '10px', color: activeTab === tab.id ? '#166534' : '#64748b' }}>
                                    {tab.icon}
                                </div>
                                {tab.label}
                            </div>
                            <ChevronRight size={20} color={activeTab === tab.id ? '#22c55e' : '#94a3b8'} style={{ transform: activeTab === tab.id ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'reports' && (
                    <div>
                        {loading ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>Loading reports...</div>
                        ) : myIssues.length === 0 ? (
                            <div className="card" style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fff' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--color-deep)' }}>You haven't reported any civic issues yet.</h3>
                                <p style={{ color: 'var(--color-text-body)', marginBottom: '24px' }}>Help make your neighborhood safer and cleaner by reporting a problem.</p>
                                <Link to="/report" className="btn btn-primary" style={{ padding: '14px 28px' }}>Report Your First Issue</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {myIssues.map(issue => (
                                    <div key={issue.id} className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{issue.title}</h4>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--color-text-body)' }}>
                                                <span>Category: <strong>{issue.category}</strong></span>
                                                <span style={{ color: 'var(--color-warning)' }}>Severity: <strong>{issue.severity}</strong></span>
                                                <span>Location: <strong>{issue.location}</strong></span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <span style={{
                                                padding: '6px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700,
                                                backgroundColor: issue.status === 'RESOLVED' ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                                                color: issue.status === 'RESOLVED' ? '#166534' : '#a16207'
                                            }}>
                                                {issue.status.replace('_', ' ')}
                                            </span>
                                            <Link to={`/issues/${issue.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>View Details</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'donations' && (
                    <div className="card" style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fff' }}>
                        <HeartHandshake size={48} color="var(--color-moss)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ marginBottom: '12px', color: 'var(--color-deep)' }}>No Escrow Funding Contributions Yet</h3>
                        <p style={{ color: 'var(--color-text-body)', marginBottom: '24px', maxWidth: '460px', margin: '0 auto 24px' }}>
                            Crowdfund urgent civic repairs directly with your community. All donations are safely stored in escrow until verified by authorities.
                        </p>
                        <Link to="/community" className="btn btn-primary" style={{ padding: '14px 28px' }}>Explore Active Campaigns</Link>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="card" style={{ padding: '32px', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ color: 'var(--color-deep)', margin: 0 }}>Civic Karma & Achievement Badges</h3>
                                <p style={{ color: 'var(--color-text-body)', fontSize: '0.88rem', margin: 0 }}>Earn karma by reporting issues, upvoting, and verifying community fixes.</p>
                            </div>
                            <div style={{ padding: '8px 16px', borderRadius: '999px', fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)' }}>
                                🌟 Level 2 Nagarik
                            </div>
                        </div>

                        {/* Badges showcase */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                            {[
                                { title: '🌱 First Reporter', desc: 'Filed 1st civic report', earned: true, icon: '🚀' },
                                { title: '🛡️ Community Watch', desc: 'Upvoted 5 local issues', earned: true, icon: '👁️' },
                                { title: '🌟 Eco Warrior', desc: 'Accumulated 50+ Karma', earned: (user.karma || 10) >= 50, icon: '⚔️' },
                                { title: '👑 Civic Legend', desc: 'Resolved 5 community fixes', earned: false, icon: '👑' },
                            ].map((b, i) => (
                                <div key={i} style={{ padding: '16px', borderRadius: '12px', border: b.earned ? '2px solid #22c55e' : '1px solid var(--color-border)', background: b.earned ? 'rgba(34,197,94,0.04)' : 'rgba(0,0,0,0.02)', opacity: b.earned ? 1 : 0.6 }}>
                                    <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{b.icon}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: b.earned ? '#14532d' : 'var(--color-text-body)' }}>{b.title}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-mutated)', marginTop: '2px' }}>{b.desc}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px', color: b.earned ? '#166534' : '#9ca3af' }}>
                                        {b.earned ? '✓ Unlocked' : '🔒 Locked'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Recent Activity Log</h4>
                        <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--color-border)' }}>
                            <div style={{ marginBottom: '20px', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }}></div>
                                <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>+50 Karma: Reported Critical Pothole Cluster</h4>
                                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-mutated)' }}>Issue verified by municipal authority • 2 days ago</p>
                            </div>
                            <div style={{ marginBottom: '20px', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#f59e0b', border: '2px solid white' }}></div>
                                <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>+10 Karma: Upvoted "Streetlight Outage"</h4>
                                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-mutated)' }}>Supported community issue • 5 days ago</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="card" style={{ padding: '36px', background: '#fff', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(21,128,61,0.1)', color: 'var(--color-moss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <KeyRound size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--color-deep)' }}>Change Account Password</h3>
                                <p style={{ color: 'var(--color-text-body)', fontSize: '0.88rem', margin: 0 }}>Update your password to keep your account safe.</p>
                            </div>
                        </div>

                        {passErr && (
                            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> {passErr}
                            </div>
                        )}

                        {passMsg && (
                            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#166534', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={16} /> {passMsg}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">New Password / नया पासवर्ड</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-mutated)' }} />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        className="form-input"
                                        style={{ paddingLeft: '42px', paddingRight: '42px' }}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-mutated)', cursor: 'pointer' }}>
                                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {/* Live Password Strength Indicator */}
                            <PasswordStrengthIndicator password={newPassword} showChecklist={true} />

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-mutated)' }} />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        className="form-input"
                                        style={{ paddingLeft: '42px' }}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {confirmPassword && (
                                    <div style={{ fontSize: '0.78rem', marginTop: '6px', color: newPassword === confirmPassword ? '#166534' : '#dc2626', fontWeight: 600 }}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
                                disabled={isUpdatingPass || !getPasswordMetrics(newPassword).isAllValid || newPassword !== confirmPassword}
                            >
                                {isUpdatingPass ? 'Updating Password...' : 'Update Password / पासवर्ड अपडेट करें'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
