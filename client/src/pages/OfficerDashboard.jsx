import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, CheckCircle2, AlertTriangle, Upload, FileText, ArrowRight, Clock, MapPin, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OfficerDashboard = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [notes, setNotes] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchIssues = async () => {
        try {
            const res = await api.get('/issues');
            if (res.success && Array.isArray(res.data)) {
                setIssues(res.data);
            }
        } catch (e) {
            console.error('Failed to load issues', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleAccept = async (id) => {
        try {
            const res = await api.post(`/issues/${id}/accept`, {});
            if (res.success) {
                setMsg(`Issue #${id} successfully moved to IN_PROGRESS repair queue.`);
                fetchIssues();
            }
        } catch (e) {
            setMsg(e.message || 'Only Municipal Officers can update repair status.');
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!selectedIssue) return;
        setSubmitting(true);
        setMsg('');

        try {
            const formData = new FormData();
            if (proofImage) {
                formData.append('repair_proof', proofImage);
            }
            formData.append('notes', notes || 'Repair completed according to PMC engineering standards.');
            formData.append('repaired_by', user?.name || 'PMC Ward Infrastructure Dept');

            const res = await api.post(`/issues/${selectedIssue.id}/resolve`, formData, true);
            if (res.success) {
                setMsg(`🎉 Issue #${selectedIssue.id} officially RESOLVED with repair proof verification! Escrow funds released to contractor.`);
                setSelectedIssue(null);
                setProofImage(null);
                setPreviewUrl(null);
                setNotes('');
                fetchIssues();
            }
        } catch (e) {
            setMsg(e.message || 'Failed to resolve issue.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '32px 0 60px' }}>
            <div className="container">
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(5, 46, 22, 0.1)', borderRadius: '999px', fontSize: '0.8rem', color: '#052e16', fontWeight: 800, marginBottom: '10px' }}>
                            <Building size={14} /> MUNICIPAL & WARD ENGINEER PORTAL
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                            Municipal Repair Verification Console 🛠️
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '4px', margin: 0 }}>
                            Review reported civic hazards, assign contractor repair queues, and upload mandatory before/after proof.
                        </p>
                    </div>
                </div>

                {msg && (
                    <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: msg.includes('🎉') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.includes('🎉') ? '#bbf7d0' : '#fecaca'}`, color: msg.includes('🎉') ? '#166534' : '#dc2626', fontWeight: 700, marginBottom: '24px' }}>
                        {msg}
                    </div>
                )}

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedIssue ? '1fr 1fr' : '1fr', gap: '24px' }}>
                    
                    {/* Issues List */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Active Municipal Tickets</h3>
                        
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
                        ) : issues.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px' }}>No civic tickets found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {issues.map(issue => (
                                    <div key={issue.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: issue.status === 'RESOLVED' ? '#dcfce7' : issue.status === 'IN_PROGRESS' ? '#dbeafe' : '#fef3c7', color: issue.status === 'RESOLVED' ? '#166534' : issue.status === 'IN_PROGRESS' ? '#1e40af' : '#92400e' }}>
                                                    {issue.status}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '10px', fontWeight: 600 }}>Issue #{issue.id}</span>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#052e16' }}>₹{(issue.funding_goal || 15000).toLocaleString('en-IN')} Escrow</span>
                                        </div>

                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{issue.title}</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                                            <MapPin size={14} color="#166534" /> {issue.location}
                                        </p>

                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                                            {issue.status === 'REPORTED' && (
                                                <button onClick={() => handleAccept(issue.id)} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                                                    ⚙️ Accept Into Repair Queue
                                                </button>
                                            )}
                                            {issue.status !== 'RESOLVED' && (
                                                <button onClick={() => setSelectedIssue(issue)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                                                    <CheckCircle2 size={15} /> Resolve With Proof
                                                </button>
                                            )}
                                            {issue.status === 'RESOLVED' && (
                                                <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ShieldCheck size={16} /> Officially Resolved & Escrow Released
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resolution Form Modal / Right Panel */}
                    {selectedIssue && (
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)', height: 'fit-content', position: 'sticky', top: '100px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '100px', display: 'inline-block', marginBottom: '8px' }}>
                                        TICKET #{selectedIssue.id}
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                                        Submit Repair Proof
                                    </h3>
                                </div>
                                <button onClick={() => { setSelectedIssue(null); setMsg(''); }} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>

                            <form onSubmit={handleResolve}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Target Issue Title</label>
                                    <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#334155', fontSize: '0.95rem', fontWeight: 600 }}>
                                        {selectedIssue.title}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Photographic Evidence (Before & After)</label>
                                    <label style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '32px 20px',
                                        backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s',
                                        ...(previewUrl ? { borderStyle: 'solid', borderColor: '#166534', padding: '12px' } : {})
                                    }}>
                                        {previewUrl ? (
                                            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                                                <img src={previewUrl} alt="Repair Proof" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#64748b' }}>
                                                    <Upload size={24} />
                                                </div>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Click to upload image</span>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PNG, JPG or JPEG (Max 5MB)</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const f = e.target.files[0];
                                                if (f) {
                                                    setProofImage(f);
                                                    setPreviewUrl(URL.createObjectURL(f));
                                                }
                                            }} 
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                <div style={{ marginBottom: '28px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Engineering & Resolution Notes</label>
                                    <textarea 
                                        rows="4"
                                        style={{
                                            width: '100%', padding: '14px 16px', border: '1px solid #cbd5e1', borderRadius: '12px',
                                            fontSize: '0.95rem', color: '#1e293b', resize: 'vertical', fontFamily: 'inherit',
                                            outline: 'none', transition: 'border-color 0.2s'
                                        }}
                                        placeholder="Detailed description of the repair work conducted (e.g., Hot-mix asphalt compaction completed per standard guidelines)..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>

                                <button type="submit" disabled={submitting} 
                                    style={{ 
                                        width: '100%', padding: '16px', fontWeight: 800, fontSize: '1rem',
                                        backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '12px',
                                        cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: submitting ? 'none' : '0 10px 25px -5px rgba(22, 101, 52, 0.4)', transition: 'all 0.2s'
                                    }}>
                                    {submitting ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            Processing Escrow...
                                        </div>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={20} /> Verify Repair & Release Escrow
                                        </>
                                    )}
                                </button>
                            </form>
                            <style dangerouslySetInnerHTML={{__html: `
                                @keyframes spin { to { transform: rotate(360deg); } }
                            `}} />
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default OfficerDashboard;
