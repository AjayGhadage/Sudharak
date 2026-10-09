import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, Flame, Filter, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

// Fix Leaflet default icon URL issues in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const severityColor = (severity) => {
    const map = { CRITICAL: '#dc2626', HIGH: '#d97706', MEDIUM: '#2563eb', LOW: '#16a34a' };
    return map[severity] || '#64748b';
};

const IssueMap = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'wards'

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await api.get('/issues');
                if (res.success && Array.isArray(res.data)) {
                    setIssues(res.data);
                }
            } catch (e) {
                console.error("Failed to load map issues", e);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    const punePins = [
        { lat: 18.5204, lng: 73.8567, ward: 'Pune City Center' },
        { lat: 18.5314, lng: 73.8446, ward: 'Shivaji Nagar' },
        { lat: 18.4934, lng: 73.8554, ward: 'Swargate' },
        { lat: 18.5120, lng: 73.8234, ward: 'Kothrud' },
        { lat: 18.5480, lng: 73.8752, ward: 'Viman Nagar' },
        { lat: 18.5018, lng: 73.8663, ward: 'Hadapsar' },
    ];

    const mappedIssues = (issues.length > 0 ? issues : [
        { id: 101, title: 'Severe Pothole Cluster on MG Road', category: 'ROAD_DAMAGE', severity: 'CRITICAL', priority_score: 92, location: 'MG Road, Camp, Pune', lat: 18.5204, lng: 73.8567, upvotes: 42, status: 'REPORTED' },
        { id: 102, title: 'Open Garbage Dump Spillover', category: 'GARBAGE', severity: 'HIGH', priority_score: 78, location: 'Kothrud Ward 12, Pune', lat: 18.5120, lng: 73.8234, upvotes: 28, status: 'IN_PROGRESS' },
        { id: 103, title: 'Broken Water Main Pipe Leakage', category: 'WATER_LEAK', severity: 'CRITICAL', priority_score: 95, location: 'Shivaji Nagar, Pune', lat: 18.5314, lng: 73.8446, upvotes: 56, status: 'REPORTED' },
        { id: 104, title: 'Non-functional Street Light Junction', category: 'STREET_LIGHT', severity: 'MEDIUM', priority_score: 54, location: 'Viman Nagar, Pune', lat: 18.5480, lng: 73.8752, upvotes: 19, status: 'RESOLVED' }
    ]).map((issue, i) => ({
        ...issue,
        lat: issue.lat || punePins[i % punePins.length].lat + (Math.sin(i + 1) * 0.015),
        lng: issue.lng || punePins[i % punePins.length].lng + (Math.cos(i + 1) * 0.015),
    }));

    const filtered = filter === 'All' ? mappedIssues : mappedIssues.filter(i => i.severity === filter);

    return (
        <div style={{ minHeight: '90vh', backgroundColor: '#f8fafc', padding: '32px 0 60px' }}>
            <div className="container">
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '999px', fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, marginBottom: '12px' }}>
                            <Flame size={14} /> LIVE GEOSPATIAL PROBLEM MAP
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            Civic Issue Heatmap 🗺️
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '6px', margin: 0 }}>
                            Real-time location of potholes, water leaks, and municipal hazards across India.
                        </p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* View Switch */}
                        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '999px', padding: '3px' }}>
                            <button
                                onClick={() => setViewMode('map')}
                                style={{
                                    padding: '7px 16px', borderRadius: '999px', border: 'none',
                                    fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer',
                                    background: viewMode === 'map' ? '#052e16' : 'transparent',
                                    color: viewMode === 'map' ? '#fff' : '#475569',
                                    transition: 'all 0.2s'
                                }}
                            >
                                🌐 Map View
                            </button>
                            <button
                                onClick={() => setViewMode('wards')}
                                style={{
                                    padding: '7px 16px', borderRadius: '999px', border: 'none',
                                    fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer',
                                    background: viewMode === 'wards' ? '#052e16' : 'transparent',
                                    color: viewMode === 'wards' ? '#fff' : '#475569',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📊 Ward Cards
                            </button>
                        </div>

                        {/* Filter pills */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    style={{
                                        padding: '7px 14px',
                                        borderRadius: '999px',
                                        border: '1px solid',
                                        borderColor: filter === s ? severityColor(s) : '#cbd5e1',
                                        backgroundColor: filter === s ? severityColor(s) : '#ffffff',
                                        color: filter === s ? '#ffffff' : '#334155',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        boxShadow: filter === s ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {viewMode === 'map' ? (
                    <div style={{
                        height: '540px', width: '100%', borderRadius: '20px',
                        overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                        border: '2px solid #e2e8f0', position: 'relative', background: '#e2e8f0'
                    }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: '#f1f5f9' }}>
                                <div style={{ textAlign: 'center', color: '#475569' }}>
                                    <div style={{ width: 44, height: 44, border: '4px solid #cbd5e1', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
                                    <div style={{ fontWeight: 700 }}>Initializing Geospatial Map...</div>
                                </div>
                            </div>
                        ) : (
                            <MapContainer
                                center={[18.5204, 73.8567]}
                                zoom={12}
                                style={{ height: '100%', width: '100%', zIndex: 1 }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                {filtered.map(issue => (
                                    <CircleMarker
                                        key={issue.id}
                                        center={[issue.lat, issue.lng]}
                                        radius={issue.severity === 'CRITICAL' ? 22 : issue.severity === 'HIGH' ? 15 : 11}
                                        pathOptions={{
                                            color: severityColor(issue.severity),
                                            fillColor: severityColor(issue.severity),
                                            fillOpacity: issue.severity === 'CRITICAL' ? 0.45 : 0.7,
                                            weight: issue.severity === 'CRITICAL' ? 3 : 2
                                        }}
                                    >
                                        <Popup>
                                            <div style={{ padding: '6px', minWidth: '220px', fontFamily: 'Inter, sans-serif' }}>
                                                <div style={{
                                                    fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px',
                                                    display: 'inline-block', backgroundColor: severityColor(issue.severity) + '20',
                                                    color: severityColor(issue.severity), marginBottom: '6px'
                                                }}>
                                                    {issue.severity} PRIORITY
                                                </div>
                                                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>{issue.title}</h4>
                                                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={13} /> {issue.location}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '6px' }}>
                                                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>👍 {issue.upvotes || 0} Upvotes</span>
                                                    <Link to={`/issues/${issue.id}`} style={{ color: '#166534', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
                                                        View Issue →
                                                    </Link>
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        )}
                    </div>
                ) : (
                    /* Ward Cards View */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {filtered.map(issue => (
                            <div key={issue.id} style={{
                                backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
                                border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800,
                                            backgroundColor: severityColor(issue.severity) + '15', color: severityColor(issue.severity)
                                        }}>
                                            {issue.severity} SEVERITY
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                            Priority Score: <strong style={{ color: '#0f172a' }}>{issue.priority_score || 75}</strong>/100
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{issue.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                        <MapPin size={15} color="#166534" /> {issue.location}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '12px' }}>
                                    <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                                        👍 <strong>{issue.upvotes || 12}</strong> Citizens Upvoted
                                    </div>
                                    <Link to={`/issues/${issue.id}`} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        Details <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Footer Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '36px' }}>
                    {[
                        { label: 'Active Reported Issues', value: mappedIssues.length, color: '#052e16', icon: '📍' },
                        { label: 'Critical Attention Required', value: mappedIssues.filter(i => i.severity === 'CRITICAL').length, color: '#dc2626', icon: '🚨' },
                        { label: 'High Priority Repairs', value: mappedIssues.filter(i => i.severity === 'HIGH').length, color: '#d97706', icon: '⚠️' },
                        { label: 'Resolved Municipal Issues', value: mappedIssues.filter(i => i.status === 'RESOLVED').length, color: '#16a34a', icon: '✅' },
                    ].map(({ label, value, color, icon }) => (
                        <div key={label} style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '2rem' }}>{icon}</div>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default IssueMap;
