import React, { useState } from 'react';
import { Send, Heart, ExternalLink, ShieldAlert, Sparkles, Map, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <footer className="mobile-hidden" style={{
            backgroundColor: '#0f172a',
            color: '#cbd5e1',
            marginTop: 'auto',
            fontSize: '0.9rem',
            paddingTop: '80px'
        }}>
            <div className="container" style={{ padding: '0 24px 32px' }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: '40px',
                    borderBottom: '1px solid #1e293b',
                    paddingBottom: '60px',
                    marginBottom: '32px'
                }}>
                    {/* Brand Section */}
                    <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <Logo size="lg" variant="dark" showTagline={true} />
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                            See a problem. Report it. Fix it together.<br />
                            AI-powered civic action engine built for Bharat.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {['Pune', 'Mumbai', 'Delhi', 'Bengaluru'].map(city => (
                                <span key={city} style={{ padding: '4px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '100px', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700 }}>
                                    📍 {city}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Developer Links */}
                    <div style={{ flex: '1 1 180px' }}>
                        <h4 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px' }}>
                            DEVELOPERS & AI
                        </h4>
                        <ul className="footer-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', padding: 0, margin: 0 }}>
                            <li><Link to="/map" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><Map size={14} /> YOLO ML Detection API</Link></li>
                            <li><Link to="/community" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> Groq AI Reasoning Engine</Link></li>
                            <li><Link to="/officer" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={14} /> Escalation Webhooks</Link></li>
                            <li><Link to="/profile" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><UserCircle size={14} /> Civic Escrow Integration</Link></li>
                        </ul>
                    </div>

                    {/* App Links */}
                    <div style={{ flex: '1 1 180px' }}>
                        <h4 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px' }}>
                            MUNICIPAL & COMMUNITY
                        </h4>
                        <ul className="footer-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', padding: 0, margin: 0 }}>
                            <li><Link to="/community" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>Live Civic Feed</Link></li>
                            <li><Link to="/map" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>Ward Heatmap Analytics</Link></li>
                            <li><Link to="/officer" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>Nagar Nigam Officer Dock</Link></li>
                            <li><Link to="/report" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>Citizen Instant Report</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Subscription */}
                    <div style={{ flex: '1 1 250px', maxWidth: '300px' }}>
                        <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px' }}>
                            SUDHARAK COMMAND CTR
                        </h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
                            Weekly civic action updates and verified repair progress delivered directly to your inbox.
                        </p>
                        {subscribed ? (
                            <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid #166534', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                ✅ Subscribed! Thank you for supporting Bharat.
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={{
                                        padding: '12px 14px', backgroundColor: '#1e293b', border: '1px solid #334155',
                                        borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', flex: 1, outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    required
                                />
                                <button type="submit" style={{ 
                                    padding: '0 16px', backgroundColor: '#22c55e', color: '#0f172a', 
                                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800
                                }}>
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
                    <div style={{ fontWeight: 600 }}>
                        © {new Date().getFullYear()} Sudharak AI Engine • Built with <Heart size={14} fill="#dc2626" color="#dc2626" style={{ display: 'inline', margin: '0 2px', verticalAlign: 'text-bottom' }} /> for Bharat Civic Action 🇮🇳
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontWeight: 700 }}>
                        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>PRIVACY</Link>
                        <Link to="/map" style={{ color: '#64748b', textDecoration: 'none' }}>GOV API DOCS</Link>
                        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>TERMS & CONDITIONS</Link>
                    </div>
                </div>
            </div>
            {/* Bottom Accent line */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%)' }} />
        
            <style dangerouslySetInnerHTML={{__html: `
                .footer-links a:hover {
                    color: #4ade80 !important;
                }
            `}} />
        </footer>
    );
};

export default Footer;
