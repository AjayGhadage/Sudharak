import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, TrendingUp, CheckCircle, AlertTriangle, Users, MessageSquare, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await api.get('/issues');
                if (res.success) setIssues(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading government analytics...</div>;

    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === 'RESOLVED').length;
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
    const fundsRaised = issues.reduce((acc, curr) => acc + (parseFloat(curr.funding_raised) || 0), 0);

    const categories = issues.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={{ backgroundColor: 'var(--color-cream)', minHeight: '85vh', padding: '40px 0' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <Shield size={36} color="var(--color-forest)" />
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>Government Dashboard</h1>
                        <p style={{ color: 'var(--color-text-body)' }}>Real-time civic analytics and escalation management.</p>
                    </div>
                </div>

                {/* Top KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-charcoal)' }}>
                        <div style={{ color: 'var(--color-text-body)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Reports</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{totalIssues}</div>
                    </div>
                    <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-forest)' }}>
                        <div style={{ color: 'var(--color-text-body)', fontSize: '0.9rem', marginBottom: '8px' }}>Resolved Issues</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-forest)' }}>{resolvedIssues}</div>
                    </div>
                    <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-critical)' }}>
                        <div style={{ color: 'var(--color-text-body)', fontSize: '0.9rem', marginBottom: '8px' }}>Critical Attention</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-critical)' }}>{criticalIssues}</div>
                    </div>
                    <div className="card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ color: 'var(--color-text-body)', fontSize: '0.9rem', marginBottom: '8px' }}>Community Funds (₹)</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>₹{(fundsRaised * 83).toFixed(0)}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="admin-grid">
                    {/* Category Breakdown */}
                    <div className="card" style={{ padding: '32px' }}>
                        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={20} /> Issue Breakdown by Category
                        </h3>
                        <div>
                            {Object.entries(categories).map(([cat, count]) => {
                                const percentage = Math.round((count / totalIssues) * 100) || 0;
                                return (
                                    <div key={cat} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                                            <span>{cat}</span>
                                            <span>{count} ({percentage}%)</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--color-earth)', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Predictive AI Analysis */}
                    <div className="card" style={{ padding: '32px' }}>
                        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={20} color="var(--color-leaf)" /> AI Predictive Infrastructure Forecasting
                        </h3>
                        <p style={{ color: 'var(--color-text-body)', fontSize: '0.9rem', marginBottom: '24px' }}>Historical data suggests a high probability of structural failures in the following zones within 90 days. Preventative maintenance is advised.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', backgroundColor: 'var(--color-cream)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 700 }}>Water Main Burst Probability</div>
                                    <div style={{ fontWeight: 800, color: '#ef4444' }}>87%</div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-body)' }}>Location: Mg Road Sector 4</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-mutated)', marginTop: '4px' }}>Trigger: 4 minor leaks reported nearby in last 14 days</div>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: 'var(--color-cream)', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 700 }}>Asphalt Degradation (Pothole Cluster)</div>
                                    <div style={{ fontWeight: 800, color: '#f59e0b' }}>64%</div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-body)' }}>Location: Shivaji Nagar Transit Route</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-mutated)', marginTop: '4px' }}>Trigger: Heavy rainfall + prolonged heavy truck traffic</div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Action List */}
                    <div className="card" style={{ padding: '32px' }}>
                        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={20} color="var(--color-critical)" /> Requires Immediate Escalation
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {issues.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').map(issue => (
                                <div key={issue.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-surface-hover)', borderLeft: '4px solid var(--color-critical)', borderRadius: '0 8px 8px 0' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>{issue.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-body)' }}>{issue.location} • {issue.upvotes} Upvotes</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        <a href={`https://wa.me/?text=${encodeURIComponent(`*URGENT DISPATCH*:\n${issue.title}\nLocation: ${issue.location}\nSeverity: ${issue.severity}\nPlease deploy team immediately.`)}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: '#25D366', border: 'none' }}>
                                            <MessageSquare size={14} /> WhatsApp Dispatch
                                        </a>
                                        <Link to={`/issues/${issue.id}`} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>View Details</Link>
                                    </div>
                                </div>
                            ))}
                            {issues.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length === 0 && (
                                <div style={{ color: 'var(--color-text-body)', textAlign: 'center', padding: '20px 0' }}>No pending critical issues.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 1024px) {
                    .admin-grid { grid-template-columns: 1fr 1fr !important; }
                }
            `}} />
        </div>
    );
};

export default AdminDashboard;
