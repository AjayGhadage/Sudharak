import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, CheckCircle, ShieldCheck, Camera, Cpu, Wind, Droplets, Trash2, ArrowUpRight, TrendingUp, Zap, Lock } from 'lucide-react';

const StatRow = ({ icon, label, value, accent }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: accent ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))' : 'rgba(255,255,255,0.04)', borderRadius: '10px', border: `1px solid ${accent ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.06)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accent ? '#6ee7b7' : '#94a3b8', fontWeight: 600, fontSize: '0.84rem' }}>
            {icon} {label}
        </div>
        <div style={{ fontWeight: 900, color: accent ? '#34d399' : '#f1f5f9', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{value}</div>
    </div>
);

const Home = () => {
    const [activeTab, setActiveTab] = useState('OVERVIEW');

    return (
        <div className="sudharak-page" style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '60px' }}>

            {/* ── 1. HERO SECTION — Dark Premium ── */}
            <section className="pixel-sky-section bg-grid-pattern sky-animated-bg" style={{ padding: '56px 0 48px' }}>
                <div className="pixel-clouds-bg" />

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>

                    {/* ─ Live Status Announcement Bar ─ */}
                    <div className="anim-fade-up glass-panel" style={{
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: '12px',
                        padding: '14px 20px',
                        marginBottom: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '3px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '4px', color: '#94a3b8', letterSpacing: '1px' }}>
                                LIVE PLATFORM
                            </span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                                5,000+ Civic Issues Resolved
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {['POTHOLES', 'GARBAGE', 'INFRASTRUCTURE'].map(p => (
                                    <span key={p} style={{ fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 7px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '4px', color: '#6ee7b7' }}>
                                        📍{p}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="badge-registered" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                                <span className="live-dot" style={{ marginRight: '4px' }}></span> ALL SYSTEMS LIVE
                            </span>
                            <Link to="/report" className="btn btn-shimmer btn-press" style={{ fontSize: '0.8rem', padding: '8px 18px' }}>
                                Fast-Track Report →
                            </Link>
                        </div>
                    </div>

                    {/* ─ Hero Grid ─ */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '48px', alignItems: 'start' }}>

                        {/* Left: headline */}
                        <div className="anim-fade-left">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '999px', marginBottom: '20px' }}>
                                <Cpu size={13} color="#34d399" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#6ee7b7', letterSpacing: '1px' }}>
                                    AI-POWERED · YOLO + GROQ · PAYPAL ESCROW
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                                fontWeight: 900,
                                color: '#ffffff',
                                marginBottom: '12px',
                                letterSpacing: '-0.03em',
                                lineHeight: 1.1
                            }}>
                                Sudharak
                                <span style={{ display: 'block', background: 'linear-gradient(90deg, #34d399, #6ee7b7, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    Civic Platform
                                </span>
                            </h1>

                            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '20px', maxWidth: '600px' }}>
                                Bad roads, flooded streets, uncollected garbage — problems every Indian city faces daily. Sudharak makes civic participation effortless. Snap a photo, AI instantly triages severity, escalates to the right municipal office, and enables community crowdfunding via <span style={{ color: '#34d399', fontWeight: 700 }}>PayPal Escrow</span>.
                            </p>

                            <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '36px' }}>
                                Fixing your city shouldn't be bureaucratic. Join the fastest-growing network of civic action.
                            </p>

                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                <Link to="/report" className="btn btn-primary btn-press" style={{ padding: '13px 28px', fontSize: '0.95rem', gap: '8px' }}>
                                    <Camera size={18} />
                                    Report Issue Now
                                </Link>
                                <Link to="/map" className="btn btn-outline-slate btn-press" style={{ padding: '13px 24px', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)' }}>
                                    <MapPin size={18} className="anim-float" />
                                    View Live Heatmap
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
                                {[
                                    { icon: '🛡️', text: 'Govt-Audited Escrow' },
                                    { icon: '🤖', text: 'YOLO v8 Detection' },
                                    { icon: '💳', text: 'PayPal Secured' },
                                    { icon: '📡', text: 'Real-Time Escalation' },
                                ].map(item => (
                                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                                        <span>{item.icon}</span><span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Stats Sidebar */}
                        <div className="premium-card sidebar-card-enter" style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={16} color="#34d399" />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 800, color: '#64748b', letterSpacing: '1px' }}>PLATFORM IMPACT</span>
                                </div>
                                <span className="badge-ai-chip">
                                    <span className="live-dot" style={{ width: '6px', height: '6px', marginRight: '2px' }}></span> LIVE
                                </span>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                                    <span style={{ fontSize: '1.3rem', color: '#34d399', verticalAlign: 'middle' }}>₹</span>1.2M
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginTop: '5px' }}>Total Escrow Crowdfunded</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                                <StatRow icon={<Camera size={14} />} label="Reports Processed" value="24,892" />
                                <StatRow icon={<ShieldCheck size={14} />} label="Official Resolutions" value="9,431" accent />
                                <StatRow icon={<CheckCircle size={14} />} label="Escrow Releases" value="3,284" />
                            </div>

                            <Link to="/officer" className="btn btn-dark" style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', justifyContent: 'center', letterSpacing: '0.5px' }}>
                                MUNICIPAL OFFICER PORTAL →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. SUB-NAVIGATION TAB BAR ── */}
            <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '66px', zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="container">
                    <div className="tab-navigation">
                        {['OVERVIEW', 'CIVIC TRACKS', 'LIVE MAP', 'COMMUNITY DRIVEN', 'AI TRANSPARENCY'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 3. CITY ROLLOUT BANNER ── */}
            <section style={{ padding: '40px 0 24px' }}>
                <div className="container">
                    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '220px', background: 'linear-gradient(135deg, #0a2e1d 0%, #0a3d2b 40%, #064e3b 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 48px rgba(4,120,87,0.3)', border: '1px solid rgba(52,211,153,0.15)' }}>

                        {/* Ambient glow blobs */}
                        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '200%', background: 'radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40%', height: '180%', background: 'radial-gradient(ellipse, rgba(56,189,248,0.10) 0%, transparent 60%)', pointerEvents: 'none' }} />
                        <div style={{ textAlign: 'center', padding: '40px 24px', zIndex: 2, position: 'relative' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 18px', background: 'rgba(52,211,153,0.12)', borderRadius: '999px', border: '1px solid rgba(52,211,153,0.25)', marginBottom: '16px' }}>
                                <span className="live-dot" />
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399', letterSpacing: '0.5px' }}>
                                    NATIONWIDE ROLLOUT · PUNE & MUMBAI ACTIVE
                                </span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#ffffff', marginBottom: '12px' }}>
                                Rebuild what the citizens need.
                            </h2>
                            <p style={{ fontSize: '0.98rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.65 }}>
                                Break free from bureaucracy. Crowdfund localized neighborhood repairs if the municipal office misses their strict <span style={{ color: '#34d399', fontWeight: 700 }}>14-day SLAs</span>.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/community" className="btn btn-primary btn-press" style={{ fontSize: '0.85rem' }}>
                                    View Active Issues
                                </Link>
                                <Link to="/map" className="btn" style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px' }}>
                                    Open City Heatmap →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. DARK ACTION BANNER ── */}
            <section style={{ padding: '24px 0 48px' }}>
                <div className="container">
                    <div className="ocean-callout-banner">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                            <div>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginBottom: '14px' }}>
                                    Fast-track action via{' '}
                                    <span style={{ borderBottom: '3px solid #34d399', paddingBottom: '2px', color: '#34d399' }}>Nagar Nigam</span> APIs.
                                </h2>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {['■ AUTOMATED AI SEVERITY TRIAGE', '■ 48-HOUR OFFICER RESPONSE KPI'].map(t => (
                                        <span key={t} style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '5px 12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '6px', color: '#6ee7b7', letterSpacing: '0.5px' }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#64748b', marginBottom: '8px' }}>FOR MUNICIPAL WARD ENGINEERS</div>
                                <Link to="/officer" style={{ color: '#34d399', fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                    ACCESS THE DOCK <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '720px', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>
                            Highly upvoted critical issues are instantly categorized. If municipal engineers fail to repair the problem in the allocated timeframe, verified private contractors are authorized to step in using PayPal citizen escrow funds.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 5. CIVIC TRACK CARDS — Glassmorphic ── */}
            <section id="tracks" style={{ padding: '0 0 60px' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                        <div>
                            <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--green-600)', letterSpacing: '1.2px' }}>
                                01 / CORE CATEGORIES
                            </span>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--slate-900)', marginTop: '4px' }}>
                                Categorized civic resolution models
                            </h2>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontFamily: 'var(--font-mono)', display: 'none' }} className="mobile-hidden">
                            ML-powered urban decay detection
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                        {/* Track 01 — Road Damage */}
                        <div className="premium-card card-hover-lift anim-fade-up delay-100" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '136px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderBottom: '1px solid var(--slate-200)', padding: '20px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.04)' }}>01</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', backdropFilter: 'blur(8px)' }}>
                                        <Wind size={26} />
                                    </div>
                                    <div>
                                        <span className="badge-ai-chip" style={{ marginBottom: '6px', display: 'inline-flex' }}>■ YOLO MODEL</span>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>Road Damage</h3>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '18px' }}>
                                        Our custom YOLOv8 model calculates pothole circumference, volumetric depth, and maps it against heavily trafficked routes to generate hazard risk scores.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '20px' }}>
                                        {['Potholes', 'Road Cave-ins', 'Broken Footpaths'].map(tag => (
                                            <span key={tag} className="badge-track-tag"><span style={{ color: 'var(--slate-400)' }}>■</span> {tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <Link to="/community?category=Road" style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--slate-700)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    VIEW ROAD ISSUES <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Track 02 — Solid Waste */}
                        <div className="premium-card card-hover-lift anim-fade-up delay-300" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '136px', background: 'linear-gradient(135deg, #052e16 0%, #064e3b 100%)', borderBottom: '1px solid var(--green-100)', padding: '20px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'rgba(52,211,153,0.08)' }}>02</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7' }}>
                                        <Trash2 size={26} />
                                    </div>
                                    <div>
                                        <span className="badge-ai-chip" style={{ marginBottom: '6px', display: 'inline-flex' }}>■ YOLO MODEL</span>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>Solid Waste</h3>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '18px' }}>
                                        Classify illegal garbage dumping into organic, plastic, or hazardous waste categories to organize municipal sanitation sweeps efficiently.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '20px' }}>
                                        {['Garbage Dumps', 'Overflowing Bins', 'Medical Waste'].map(tag => (
                                            <span key={tag} className="badge-track-tag"><span style={{ color: 'var(--green-600)' }}>■</span> {tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <Link to="/community?category=Garbage" style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--green-700)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    VIEW SANITATION REPORTS <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Track 03 — Water Leaks */}
                        <div className="premium-card card-hover-lift anim-fade-up delay-500" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '136px', background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', borderBottom: '1px solid var(--blue-100)', padding: '20px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'rgba(56,189,248,0.08)' }}>03</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7dd3fc' }}>
                                        <Droplets size={26} />
                                    </div>
                                    <div>
                                        <span className="badge-ai-chip" style={{ marginBottom: '6px', display: 'inline-flex' }}>■ YOLO MODEL</span>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>Water Leaks</h3>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '18px' }}>
                                        Automatically identify fresh water pooling vectors vs sewage overflow, generating urgency scores based on population density.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '20px' }}>
                                        {['Pipe Bursts', 'Sewage Overflows', 'Street Flooding'].map(tag => (
                                            <span key={tag} className="badge-track-tag"><span style={{ color: 'var(--blue-600)' }}>■</span> {tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <Link to="/community?category=Water" style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--blue-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    VIEW WATER HAZARDS <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 6. HOW IT WORKS — Premium Steps ── */}
            <section style={{ padding: '48px 0 64px', background: '#ffffff', borderTop: '1px solid var(--slate-200)', borderBottom: '1px solid var(--slate-200)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                        <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--green-600)', letterSpacing: '1.2px' }}>HOW IT WORKS</span>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--slate-900)', marginTop: '6px' }}>
                            AI Triage → Escrow Funding → Municipal Escalation
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: 'var(--slate-500)', marginTop: '10px', maxWidth: '520px', margin: '10px auto 0' }}>
                            A fully automated civic resolution pipeline in 4 steps.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        {[
                            { step: '01', title: 'Snap Photo', icon: <Camera size={22} />, color: '#059669', bg: '#ecfdf5', desc: 'Snap a picture of a pothole, open garbage dump, or broken pipeline. GPS coordinates are auto-tagged.' },
                            { step: '02', title: 'YOLO AI Triage', icon: <Cpu size={22} />, color: '#0284c7', bg: '#e0f2fe', desc: 'Computer vision detects severity and generates a structured municipal engineering report instantly.' },
                            { step: '03', title: 'Crowdfund Repair', icon: <Lock size={22} />, color: '#7c3aed', bg: '#f5f3ff', desc: 'Citizens safely back repairs using PayPal escrow. If the city skips SLA, contracted private repair commences.' },
                            { step: '04', title: 'Verify & Release', icon: <Zap size={22} />, color: '#d97706', bg: '#fffbeb', desc: 'Before/After proofs uploaded by contractors. Automated escrow release triggered via verification.' },
                        ].map((s, i) => (
                            <div key={i} className="step-card reference-card anim-fade-up" style={{ padding: '26px', backgroundColor: '#fafafa', animationDelay: `${i * 0.12}s`, cursor: 'default' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '16px', border: `1px solid ${s.color}22` }}>
                                    {s.icon}
                                </div>
                                <div className="mono" style={{ fontSize: '0.72rem', fontWeight: 800, color: s.color, marginBottom: '8px', letterSpacing: '1px' }}>{s.step}</div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '10px' }}>{s.title}</h3>
                                <p style={{ fontSize: '0.86rem', color: 'var(--slate-500)', lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
