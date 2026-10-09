import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Globe, User, LogOut, ChevronDown, CheckCircle, Moon, Sun, Home, Map as MapIcon, ImagePlus, UserCircle, Plus } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const { lang, setLang } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { 
        logout(); 
        navigate('/'); 
    };

    const [isDarkMode, setIsDarkMode] = React.useState(false);

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('sudharak_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.removeAttribute('data-theme');
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('sudharak_theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('sudharak_theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const isOfficer = user?.role === 'MUNICIPAL_OFFICER' || user?.role === 'ADMIN' || user?.role === 'GOVERNMENT';

    const navLinks = [
        { to: '/', label: 'OVERVIEW' },
        { to: '/community', label: 'TRACKS & ISSUES' },
        { to: '/map', label: 'LIVE MAP' },
        { to: '/report', label: 'REPORT' },
        ...(isOfficer ? [{ to: '/officer', label: 'OFFICER DOCK' }] : []),
    ];

    return (
        <>
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            height: '66px',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
            zIndex: 1000,
            boxShadow: '0 1px 12px rgba(0,0,0,0.06)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>

                {/* Professional Brand Logo */}
                <Logo size="md" showTagline={true} />

                {/* Desktop Nav Links (Reference Uppercase Monospace Style) */}
                <div className="desktop-menu" style={{ display: 'none', gap: '24px', alignItems: 'center' }}>
                    {navLinks.map(({ to, label }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link key={to} to={to} style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                letterSpacing: '0.8px',
                                color: isActive ? 'var(--green-700)' : 'var(--slate-600)',
                                borderBottom: isActive ? '2px solid var(--green-500)' : '2px solid transparent',
                                padding: '8px 2px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'linear-gradient(180deg, transparent 70%, rgba(16,185,129,0.08) 100%)' : 'none',
                                borderRadius: isActive ? '2px' : '0',
                            }}>
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Side Status & User Action */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
                            color: '#334155', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        title="Toggle Night Mode"
                    >
                        {isDarkMode ? <Sun size={15} color="#eab308" /> : <Moon size={15} />}
                    </button>

                    {/* Language Switcher */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '6px 12px', borderRadius: '6px',
                                border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
                                color: '#334155', fontWeight: 700, fontSize: '0.78rem',
                                fontFamily: 'var(--font-mono)', cursor: 'pointer'
                            }}
                        >
                            <Globe className="mobile-hidden" size={13} />
                            {lang.toUpperCase()}
                        </button>
                        {langDropdownOpen && (
                            <div style={{ position: 'absolute', top: '110%', right: 0, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: '130px', zIndex: 100 }}>
                                {[['en', 'English'], ['mr', 'मराठी'], ['hi', 'हिन्दी']].map(([code, label]) => (
                                    <button key={code} onClick={() => { setLang(code); setLangDropdownOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', backgroundColor: lang === code ? '#f0fdf4' : '#fff', color: lang === code ? '#166534' : '#334155', fontWeight: lang === code ? 800 : 600, cursor: 'pointer', fontSize: '0.84rem' }}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
                            color: '#334155', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        title="Toggle Night Mode"
                    >
                        {isDarkMode ? <Sun size={15} color="#eab308" /> : <Moon size={15} />}
                    </button>

                    {isAuthenticated ? (
                        <>
                            {/* Reference Pill: Registered / Citizen Active */}
                            <div className="badge-registered mobile-hidden">
                                <CheckCircle size={14} color="#166534" />
                                <span>{isOfficer ? 'OFFICER' : 'REGISTERED'}</span>
                            </div>

                            {/* User Profile Pill */}
                            <div style={{ position: 'relative' }} className="mobile-hidden">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '4px 10px 4px 4px', borderRadius: '999px',
                                        backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'citizen')}`}
                                        alt="Avatar"
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                                        {user?.name || 'Ajay Ghadage'}
                                    </span>
                                    <ChevronDown size={14} color="#64748b" />
                                </button>

                                {userDropdownOpen && (
                                    <div style={{ position: 'absolute', top: '120%', right: 0, backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '200px', padding: '6px', zIndex: 100 }}>
                                        <Link to="/profile" onClick={() => setUserDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', color: '#1e293b', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
                                            <User size={16} /> My Profile ({user?.karma || 10} Karma)
                                        </Link>
                                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />
                                        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', color: '#dc2626', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left' }}>
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }} className="mobile-hidden">
                            <Link to="/login" className="btn btn-outline-slate" style={{ padding: '8px 12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>LOG IN</Link>
                            <Link to="/signup" className="btn btn-primary-green" style={{ padding: '8px 12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>GET STARTED</Link>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 768px) {
                    .desktop-menu { display: flex !important; }
                }
            `}} />
        </nav>

        {/* Global Floating Action Button for Report */}
        {!window.location.pathname.includes('/report') && (
            <Link to="/report" className="fab-btn">
                <Plus size={28} strokeWidth={3} />
            </Link>
        )}

        {/* Native App-Style Bottom Navigation for Mobile */}
        <div className="mobile-bottom-nav">
            <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <Home size={22} />
                <span>Home</span>
            </Link>
            <Link to="/community" className={`bottom-nav-item ${location.pathname === '/community' ? 'active' : ''}`}>
                <ImagePlus size={22} />
                <span>Feed</span>
            </Link>
            <Link to="/report" className={`bottom-nav-item ${location.pathname === '/report' ? 'active' : ''}`}>
                <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
                    borderRadius: '50%',
                    color: 'white',
                    marginTop: '-18px',
                    width: '52px',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #ffffff',
                    boxShadow: '0 0 0 0 rgba(34,197,94,0.7), 0 6px 20px rgba(34,197,94,0.5)',
                    animation: 'fab-pulse 2s ease-out infinite',
                    transition: 'transform 0.2s ease'
                }}>
                   <Plus size={24} strokeWidth={3} />
                </div>
            </Link>
            <Link to="/map" className={`bottom-nav-item ${location.pathname === '/map' ? 'active' : ''}`}>
                <MapIcon size={22} />
                <span>Map</span>
            </Link>
            <Link to={isAuthenticated ? "/profile" : "/login"} className={`bottom-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                <UserCircle size={22} />
                <span>Profile</span>
            </Link>
        </div>
        </>
    );
};

export default Navbar;

