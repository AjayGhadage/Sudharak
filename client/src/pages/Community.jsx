import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Flame, Search, PlusCircle, Filter } from 'lucide-react';
import { api } from '../services/api';

const SeverityBadge = ({ severity }) => {
    const map = {
        CRITICAL: { bg: '#fee2e2', color: '#dc2626' },
        HIGH: { bg: '#fef3c7', color: '#b45309' },
        MEDIUM: { bg: '#e0f2fe', color: '#0369a1' },
        LOW: { bg: '#dcfce7', color: '#166534' }
    };
    const b = map[severity] || map['LOW'];
    return (
        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', backgroundColor: b.bg, color: b.color }}>
            {severity}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const isResolved = status === 'RESOLVED';
    return (
        <span style={{
            padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
            backgroundColor: isResolved ? '#dcfce7' : '#fef3c7',
            color: isResolved ? '#166534' : '#b45309',
            border: `1px solid ${isResolved ? '#86efac' : '#fde68a'}`
        }}>
            {isResolved ? 'RESOLVED' : 'IN PROGRESS'}
        </span>
    );
};

const DEMO_REPORTS = [
    {
        id: 'demo-1',
        title: 'Critical Pothole Cluster on MG Road Near Pune Station',
        category: 'POTHOLE',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        location: 'MG Road, Camp, Pune - 411001',
        image_url: '/images/demo_pothole.png',
        confidence: 0.94,
        priority_score: 92,
        upvotes: 47,
        funding_raised: 1240,
        funding_goal: 4800,
        reporter: { name: 'Rahul Sharma' },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'demo-2',
        title: 'Illegal Garbage Dumping Near Kothrud Market — 3 Days No Pickup',
        category: 'GARBAGE',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        location: 'Kothrud, Pune - 411038',
        image_url: '/images/demo_garbage.png',
        confidence: 0.88,
        priority_score: 79,
        upvotes: 31,
        funding_raised: 580,
        funding_goal: 1200,
        reporter: { name: 'Priya Deshmukh' },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'demo-3',
        title: 'Burst Water Pipe Flooding Shivaji Nagar Main Road',
        category: 'WATER_LEAK',
        severity: 'CRITICAL',
        status: 'REPORTED',
        location: 'Shivaji Nagar, Pune - 411005',
        image_url: '/images/demo_water.png',
        confidence: 0.91,
        priority_score: 95,
        upvotes: 62,
        funding_raised: 3100,
        funding_goal: 6000,
        reporter: { name: 'Amit Kulkarni' },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'demo-4',
        title: 'Extreme AQI Smog Alert — Stubble Burning Near Delhi Border',
        category: 'AIR_QUALITY',
        severity: 'HIGH',
        status: 'REPORTED',
        location: 'Rohini, Delhi - 110085',
        image_url: '/images/demo_smog.png',
        confidence: 0.86,
        priority_score: 84,
        upvotes: 118,
        funding_raised: 2200,
        funding_goal: 5000,
        reporter: { name: 'Meera Gupta' },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'demo-5',
        title: 'Open Manhole Near School Zone — Serious Accident Risk',
        category: 'OPEN_MANHOLE',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        location: 'Viman Nagar, Pune - 411014',
        image_url: '/images/demo_pothole.png',
        confidence: 0.97,
        priority_score: 98,
        upvotes: 89,
        funding_raised: 3800,
        funding_goal: 3800,
        reporter: { name: 'Suresh Patil' },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const Community = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [animatingKarmaId, setAnimatingKarmaId] = useState(null);

    const handleUpvote = (issue) => {
        setAnimatingKarmaId(issue.id);
        // Simulate local state update for demo
        issue.upvotes += 1;
        setTimeout(() => setAnimatingKarmaId(null), 1000);    
    };

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await api.get('/issues');
                if (res.success && res.data && res.data.length > 0) {
                    // Merge API data with demo reports (demo fills in any missing)
                    setIssues([...res.data, ...DEMO_REPORTS]);
                } else {
                    setIssues(DEMO_REPORTS);
                }
            } catch (err) {
                // If API fails, show demo data instead of error
                setIssues(DEMO_REPORTS);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);


    const filteredIssues = issues.filter(issue => {
        const matchesCategory = categoryFilter === 'All' || issue.category.toLowerCase().includes(categoryFilter.toLowerCase());
        const matchesSearch = searchQuery === '' || 
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            issue.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="sudharak-page" style={{ backgroundColor: '#f8fafc', minHeight: '88vh', padding: '32px 0 80px' }}>
            <div className="container">
                {/* Header Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                    <div>
                        <div className="anim-fade-down" style={{ marginBottom: '10px', display: 'inline-flex' }}>
                        <span className="badge-registered">
                            <span className="live-dot" style={{marginRight:'5px'}}></span> LIVE CIVIC FEED 🇮🇳
                        </span>
                    </div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>Community Issues Feed</h1>
                        <p style={{ color: '#64748b', fontSize: '0.98rem' }}>Real-time geotagged civic reports across India needing community funding and action.</p>
                    </div>
                    <Link to="/report" className="btn btn-primary-green" style={{ gap: '8px' }}>
                        <PlusCircle size={16} /> Report New Issue
                    </Link>
                </div>

                {/* Search and Filters Bar */}
                <div className="reference-card" style={{ padding: '16px 20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Search box */}
                    <div style={{ position: 'relative', flex: '1 1 280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search title or city (e.g. Pune, Mumbai)..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '40px', fontSize: '0.85rem' }}
                        />
                    </div>

                    {/* Category Filter Pills */}
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                        {['All', 'Pothole', 'Garbage', 'Water', 'Drainage'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                style={{
                                    padding: '6px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'var(--font-mono)',
                                    backgroundColor: categoryFilter === cat ? '#166534' : '#f8fafc',
                                    color: categoryFilter === cat ? '#fff' : '#475569',
                                    border: `1px solid ${categoryFilter === cat ? '#166534' : '#cbd5e1'}`,
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        Loading community feed...
                    </div>
                ) : error ? (
                    <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
                        {error}
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <div className="reference-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
                        <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>No issues found</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Try clearing your search filters or report a new issue in your ward.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {filteredIssues.map((issue) => {
                            const fundedPercent = Math.min(100, Math.round((parseFloat(issue.funding_raised) / parseFloat(issue.funding_goal)) * 100)) || 0;

                            return (
                                <div key={issue.id} className="reference-card card-hover-lift anim-fade-up" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', animationDelay: `${(issues.indexOf(issue) % 6) * 0.08}s` }}>
                                    <div style={{ height: '190px', overflow: 'hidden', backgroundColor: '#0f172a', position: 'relative' }}>
                                        <img
                                            src={issue.image_url}
                                            alt={issue.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = '/images/indian_pothole_fallback.png'; }}
                                        />
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1, display: 'flex', gap: '6px' }}>
                                            <StatusBadge status={issue.status} />
                                            <SeverityBadge severity={issue.severity} />
                                        </div>
                                        {/* Urgency Badge if Critical and Old */}
                                        {issue.severity === 'CRITICAL' && issue.status !== 'RESOLVED' && (
                                            <div className="urgency-badge" style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                                                ⚠️ UNRESOLVED CRITICAL ISSUE
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {issue.title}
                                        </h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.82rem', marginBottom: '14px' }}>
                                            <MapPin size={14} color="#166534" /> {issue.location || 'Pune, Maharashtra'}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '14px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontFamily: 'var(--font-mono)' }}>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>AI DETECTION</div>
                                                <strong style={{ color: '#166534' }}>{Math.round(issue.confidence * 100)}% Match</strong>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>PRIORITY</div>
                                                <strong style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Flame size={13} /> {issue.priority_score}
                                                </strong>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '16px', marginTop: 'auto' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                <span style={{ color: '#166534' }}>₹{(parseFloat(issue.funding_raised) * 83).toFixed(0)} raised</span>
                                                <span style={{ color: '#64748b' }}>of ₹{(parseFloat(issue.funding_goal) * 83).toFixed(0)}</span>
                                            </div>
                                            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div className="progress-bar-animated" style={{ '--target-width': `${fundedPercent}%`, height: '100%', backgroundColor: '#22c55e' }}></div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px', position: 'relative' }}>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); handleUpvote(issue); }}
                                                style={{ display: 'flex', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', transition: 'all 0.2s', border: '1px solid #cbd5e1' }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; e.currentTarget.style.color = '#166534'; e.currentTarget.style.borderColor = '#86efac'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                            >
                                                <ThumbsUp size={16} /> {issue.upvotes}
                                            </button>
                                            
                                            {/* Karma gamification animation */}
                                            {animatingKarmaId === issue.id && (
                                                <span className="karma-float" style={{ left: '16px', bottom: '30px' }}>
                                                    +5 Karma
                                                </span>
                                            )}

                                            <Link to={`/issues/${issue.id}`} className="btn btn-primary-green" style={{ padding: '8px 16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                                                VIEW & FUND →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;

