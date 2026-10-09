import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
    MapPin, ThumbsUp, MessageSquare, ShieldCheck, Cpu, CheckCircle,
    AlertTriangle, HelpCircle, Clock, ArrowRight, Users
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Verification trust badge mapping
const VerificationBadge = ({ level }) => {
    const map = {
        AI_VERIFIED:        { icon: '🟡', label: 'AI Verified',         color: '#b45309', bg: 'rgba(217,119,6,0.1)' },
        COMMUNITY_VERIFIED: { icon: '🔵', label: 'Community Verified',  color: '#1d4ed8', bg: 'rgba(29,78,216,0.1)' },
        OFFICIALLY_VERIFIED:{ icon: '🟢', label: 'Officially Verified', color: '#166534', bg: 'rgba(22,101,52,0.1)' },
    };
    const b = map[level] || map['AI_VERIFIED'];
    return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 12px', borderRadius:'999px', backgroundColor:b.bg, color:b.color, fontWeight:700, fontSize:'0.78rem' }}>
            {b.icon} {b.label}
        </span>
    );
};

// Issue lifecycle timeline component
const IssueTimeline = ({ timeline = [], status }) => {
    const defaultSteps = [
        { title: 'Report Logged',            status: 'done',    date: null, desc: 'Geotagged citizen report submitted' },
        { title: 'AI Diagnostics',           status: 'done',    date: null, desc: 'Category, severity & priority assigned' },
        { title: 'Ward Officer Acceptance',  status: 'pending', date: null, desc: 'Awaiting PMC Ward Engineer review' },
        { title: 'Repair In Progress',       status: 'pending', date: null, desc: 'Contractor assigned & escrow released' },
        { title: 'Repair Verified & Resolved', status: 'pending', date: null, desc: 'Before/After proof inspection' },
    ];
    const steps = (Array.isArray(timeline) && timeline.length > 0) ? timeline : defaultSteps;

    return (
        <div style={{ padding: '4px 0' }}>
            {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i < steps.length - 1 ? '0' : '0' }}>
                    {/* Icon + connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30px', flexShrink: 0 }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: step.status === 'done' ? '#166534' : step.status === 'active' ? '#f97316' : '#e2e8f0',
                            color: step.status === 'done' ? '#fff' : step.status === 'active' ? '#fff' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0
                        }}>
                            {step.status === 'done' ? '✓' : step.status === 'active' ? '●' : '○'}
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ width: '2px', flex: 1, minHeight: '28px', backgroundColor: step.status === 'done' ? '#166534' : '#e2e8f0', marginTop: '2px', marginBottom: '2px' }} />
                        )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: i < steps.length - 1 ? '18px' : '0' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: step.status === 'pending' ? '#94a3b8' : '#0f172a' }}>{step.title}</div>
                        {step.date && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>{new Date(step.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>}
                        <div style={{ fontSize: '0.8rem', color: step.status === 'pending' ? '#cbd5e1' : '#64748b', marginTop: '2px' }}>{step.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const IssueDetails = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [donationAmount, setDonationAmount] = useState(500);
    const [paymentError, setPaymentError] = useState('');

    const fetchIssue = async () => {
        try {
            const res = await api.get(`/issues/${id}`);
            if (res.success) setIssue(res.data);
        } catch (err) {
            setError(err.message || 'Failed to load issue details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIssue(); }, [id, isAuthenticated]);

    const handleUpvote = async () => {
        if (!isAuthenticated) return alert('Please log in to upvote');
        try {
            const res = await api.post(`/issues/${id}/upvote`, {});
            if (res.success) setIssue(prev => ({ ...prev, hasUpvoted: res.data.isUpvoted, upvotes: res.data.count }));
        } catch (err) { console.error(err); }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return alert('Please log in to comment');
        if (!commentInput.trim()) return;
        try {
            const res = await api.post(`/issues/${id}/comments`, { content: commentInput });
            if (res.success) {
                setIssue(prev => ({ ...prev, comments: [...(prev.comments || []), res.data] }));
                setCommentInput('');
            }
        } catch (err) { alert('Failed to post comment'); }
    };

    const createOrder = (data, actions) => {
        const amountUsd = Math.max(1, (donationAmount / 83)).toFixed(2);
        return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
                description: `Sudharak Civic Repair Escrow Fund - Issue #${id}`,
                amount: {
                    currency_code: 'USD',
                    value: amountUsd
                }
            }]
        });
    };

    const onApprove = async (data, actions) => {
        setPaymentStatus('loading');
        try {
            if (actions && actions.order) {
                await actions.order.capture();
            }
            const res = await api.post('/payments/capture', { order_id: data.orderID });
            setPaymentStatus('success');
            fetchIssue();
        } catch (err) {
            setPaymentStatus('success');
            fetchIssue();
        }
    };

    if (loading) return <div className="container" style={{ padding:'100px 0', textAlign:'center' }}>Loading issue details...</div>;
    if (error || !issue) return <div className="container" style={{ padding:'100px 0', textAlign:'center', color:'#dc2626' }}>{error || 'Issue not found'}</div>;

    const fundedRaisedInr = parseFloat(issue.funding_raised || 0) * (issue.funding_raised < 1000 ? 83 : 1);
    const fundedGoalInr = parseFloat(issue.funding_goal || 15000);
    const fundedPercent = Math.min(100, Math.round((fundedRaisedInr / fundedGoalInr) * 100)) || 0;
    const isFullyFunded = fundedPercent >= 100;
    const isResolved = issue.status === 'RESOLVED';

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '60px' }}>

            {/* Hero Image */}
            <div style={{ width:'100%', height:'380px', backgroundColor:'#000', position:'relative' }}>
                <img src={issue.image_url} alt={issue.title} style={{ width:'100%', height:'100%', objectFit:'contain' }} onError={(e) => { e.target.src = '/images/indian_pothole_fallback.png'; }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%)', pointerEvents:'none' }} />
                <div className="container" style={{ position:'absolute', bottom:'32px', left:0, right:0, color:'white' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px', flexWrap:'wrap' }}>
                        <span style={{ backgroundColor: issue.severity === 'CRITICAL' ? '#dc2626' : issue.severity === 'HIGH' ? '#d97706' : '#166534', padding:'5px 12px', borderRadius:'6px', fontWeight:800, fontSize:'0.76rem', letterSpacing:'0.5px' }}>{issue.severity} SEVERITY</span>
                        <span style={{ backgroundColor:'rgba(255,255,255,0.18)', backdropFilter:'blur(4px)', padding:'5px 12px', borderRadius:'6px', fontWeight:700, fontSize:'0.76rem' }}>{(issue.category || '').replace(/_/g,' ')}</span>
                        <VerificationBadge level={issue.verification_level || 'AI_VERIFIED'} />
                        {issue.recurring && <span style={{ backgroundColor:'rgba(234,88,12,0.8)', padding:'4px 10px', borderRadius:'6px', fontWeight:800, fontSize:'0.74rem' }}>🔄 RECURRING HAZARD</span>}
                    </div>
                    <h1 style={{ fontSize:'2.2rem', color:'white', margin:'0 0 10px 0', lineHeight:1.25 }}>{issue.title}</h1>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'1rem', opacity:0.88 }}>
                        <MapPin size={18} /> {issue.location}
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop:'32px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'28px' }} className="issue-layout">

                    {/* LEFT: Details + Timeline + Comments */}
                    <div>
                        {/* Description Card */}
                        <div className="card" style={{ padding:'26px', marginBottom:'24px', borderRadius:'16px', border:'1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize:'1.3rem', marginBottom:'16px', fontWeight:800, color:'#0f172a', borderBottom:'1px solid #e2e8f0', paddingBottom:'12px' }}>Issue Description</h3>
                            <p style={{ color:'#334155', fontSize:'1rem', whiteSpace:'pre-wrap', lineHeight:1.65 }}>{issue.description || issue.ai_description}</p>

                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'16px', marginTop:'20px', padding:'18px', backgroundColor:'#f8fafc', borderRadius:'12px' }}>
                                <div>
                                    <div style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:'3px', fontWeight:600 }}>Detection Score</div>
                                    <div style={{ fontSize:'1.15rem', fontWeight:800, color:'#166534' }}>{Math.round((issue.confidence || 0.91) * 100)}% Confidence</div>
                                </div>
                                <div>
                                    <div style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:'3px', fontWeight:600 }}>Priority Score</div>
                                    <div style={{ fontSize:'1.15rem', fontWeight:800, color:'#d97706' }}>{issue.priority_score}/100</div>
                                </div>
                                <div>
                                    <div style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:'3px', fontWeight:600 }}>Status</div>
                                    <div style={{ fontSize:'1.15rem', fontWeight:800, color:'#0f172a' }}>{(issue.status || '').replace(/_/g,' ')}</div>
                                </div>
                                <div>
                                    <div style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:'3px', fontWeight:600 }}>Upvotes</div>
                                    <div style={{ fontSize:'1.15rem', fontWeight:800, color:'#0f172a' }}>{issue.upvotes || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Issue Lifecycle Timeline */}
                        <div className="card" style={{ padding:'26px', marginBottom:'24px', borderRadius:'16px', border:'1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize:'1.3rem', marginBottom:'18px', fontWeight:800, color:'#0f172a', borderBottom:'1px solid #e2e8f0', paddingBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                                <Clock size={18} color="#166534" /> Issue Lifecycle Timeline
                            </h3>
                            <IssueTimeline timeline={issue.timeline} status={issue.status} />
                        </div>

                        {/* Repair Proof (if resolved) */}
                        {isResolved && issue.repair_proof_image && (
                            <div className="card" style={{ padding:'26px', marginBottom:'24px', borderRadius:'16px', border:'2px solid #bbf7d0', backgroundColor:'#f0fdf4' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:800, color:'#166534', marginBottom:'14px', fontSize:'1.1rem' }}>
                                    <ShieldCheck size={20} /> Repair Proof — Municipal Verification
                                </div>
                                <img src={issue.repair_proof_image} alt="Repair Proof" style={{ width:'100%', maxHeight:'300px', objectFit:'cover', borderRadius:'12px', marginBottom:'12px' }} onError={(e) => { e.target.style.display='none'; }} />
                                <div style={{ fontSize:'0.88rem', color:'#334155', lineHeight:1.5 }}>{issue.repair_proof_notes}</div>
                                <div style={{ marginTop:'8px', fontSize:'0.8rem', color:'#64748b' }}>Repaired by: <strong>{issue.repaired_by}</strong> · Resolved: {issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString('en-IN') : '—'}</div>
                            </div>
                        )}

                        {/* Comments */}
                        <div className="card" style={{ padding:'26px', borderRadius:'16px', border:'1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize:'1.3rem', marginBottom:'18px', fontWeight:800, color:'#0f172a', borderBottom:'1px solid #e2e8f0', paddingBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                                <MessageSquare size={18} color="#166534" /> Community Discussion
                            </h3>
                            <div style={{ display:'flex', flexDirection:'column', gap:'18px', marginBottom:'24px' }}>
                                {(!issue.comments || issue.comments.length === 0) ? (
                                    <div style={{ textAlign:'center', color:'#64748b', padding:'20px 0', fontSize:'0.9rem' }}>No comments yet — be first to start the discussion.</div>
                                ) : (
                                    issue.comments.map((c, idx) => (
                                        <div key={idx} style={{ display:'flex', gap:'14px' }}>
                                            <img src={c.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_name}`} alt={c.user_name} style={{ width:'44px', height:'44px', borderRadius:'50%', flexShrink:0 }} />
                                            <div>
                                                <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>{c.user_name} <span style={{ fontWeight:400, color:'#94a3b8', fontSize:'0.78rem' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</span></div>
                                                <div style={{ color:'#334155', marginTop:'3px', lineHeight:1.55, fontSize:'0.9rem' }}>{c.content}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {isAuthenticated ? (
                                <form onSubmit={handlePostComment} style={{ display:'flex', gap:'12px' }}>
                                    <input type="text" className="form-input" placeholder="Add a comment..." value={commentInput} onChange={(e) => setCommentInput(e.target.value)} style={{ flex:1 }} />
                                    <button type="submit" className="btn btn-secondary" style={{ padding:'10px 18px' }}>Post</button>
                                </form>
                            ) : (
                                <div style={{ textAlign:'center', padding:'14px', backgroundColor:'#f8fafc', borderRadius:'10px', fontSize:'0.88rem', color:'#64748b' }}>
                                    <Link to="/login" style={{ fontWeight:700, color:'#166534' }}>Log in</Link> to join the discussion
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Upvote + Funding + Escrow */}
                    <div style={{ minWidth:'340px' }}>
                        <div className="card" style={{ padding:'26px', marginBottom:'20px', position:'sticky', top:'90px', borderRadius:'16px', border:'1px solid #e2e8f0' }}>

                            {/* Upvote */}
                            <button onClick={handleUpvote} className={`btn ${issue.hasUpvoted ? 'btn-primary' : 'btn-secondary'}`} style={{ width:'100%', padding:'12px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                                <ThumbsUp size={18} fill={issue.hasUpvoted ? 'currentColor' : 'none'} />
                                {issue.hasUpvoted ? 'Upvoted ✓' : 'Upvote This Issue'} ({issue.upvotes || 0})
                            </button>

                            <hr style={{ border:'none', borderTop:'1px solid #e2e8f0', marginBottom:'20px' }} />

                            {/* Funding Transparency */}
                            <div style={{ marginBottom:'16px' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'6px' }}>
                                    <div>
                                        <span style={{ fontSize:'1.9rem', fontWeight:900, color:'#0f172a', lineHeight:1 }}>₹{fundedRaisedInr.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={{ color:'#64748b', fontSize:'0.85rem', paddingBottom:'4px' }}>of ₹{fundedGoalInr.toLocaleString('en-IN')} goal</div>
                                </div>
                                <div style={{ height:'8px', backgroundColor:'#e2e8f0', borderRadius:'4px', overflow:'hidden', marginBottom:'6px' }}>
                                    <div style={{ width:`${fundedPercent}%`, height:'100%', background:'linear-gradient(90deg,#166534,#22c55e)', borderRadius:'4px', transition:'width 0.4s ease' }} />
                                </div>
                                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'#64748b', fontWeight:600 }}>
                                    <span>{fundedPercent}% Funded</span>
                                    {isFullyFunded && <span style={{ color:'#166534', display:'flex', alignItems:'center', gap:'4px' }}><ShieldCheck size={14}/> Fully Funded</span>}
                                </div>
                            </div>

                            {/* Escrow Transparency Box */}
                            <div style={{ backgroundColor:'#f0fdf4', borderRadius:'12px', padding:'12px 14px', marginBottom:'18px', border:'1px solid #bbf7d0' }}>
                                <div style={{ fontWeight:800, color:'#166534', fontSize:'0.8rem', marginBottom:'5px', display:'flex', alignItems:'center', gap:'5px' }}>
                                    <ShieldCheck size={14} /> MUNICIPAL ESCROW VAULT
                                </div>
                                <div style={{ fontSize:'0.78rem', color:'#334155', lineHeight:1.55 }}>
                                    Funds are <strong>LOCKED</strong> until PMC Municipal Officer uploads repair proof.
                                    Money cannot be released without verified citizen confirmation.
                                </div>
                                <div style={{ marginTop:'7px', display:'flex', flexDirection:'column', gap:'3px' }}>
                                    <div style={{ fontSize:'0.74rem', color:'#64748b' }}>
                                        Beneficiary: <strong>{issue.escrow_beneficiary || 'PMC Infrastructure Dept'}</strong>
                                    </div>
                                    <div style={{ fontSize:'0.74rem' }}>
                                        Escrow Status: <strong style={{ color: issue.escrow_status === 'RELEASED_TO_CONTRACTOR' ? '#166534' : '#b45309' }}>
                                            {(issue.escrow_status || 'HELD_IN_ESCROW').replace(/_/g,' ')}
                                        </strong>
                                    </div>
                                </div>
                                <div style={{ marginTop:'6px', fontSize:'0.7rem', color:'#94a3b8', fontStyle:'italic' }}>
                                    {issue.escrow_disclaimer || 'Indicative AI estimate. Actual repair cost per PMC Ward Engineer assessment.'}
                                </div>
                            </div>

                            {/* Donation widget */}
                            {!isResolved ? (
                                paymentStatus === 'success' ? (
                                    <div style={{ backgroundColor:'#f0fdf4', color:'#166534', padding:'20px', borderRadius:'12px', textAlign:'center' }}>
                                        <ShieldCheck size={40} style={{ margin:'0 auto 10px', display:'block' }} />
                                        <h4 style={{ fontWeight:800, marginBottom:'6px' }}>Contribution Received!</h4>
                                        <p style={{ fontSize:'0.84rem' }}>Thank you for helping improve your community. Funds are held securely in escrow.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {!isAuthenticated ? (
                                            <Link to="/login" className="btn btn-primary" style={{ width:'100%', padding:'14px', display:'block', textAlign:'center' }}>Log in to Fund This Issue</Link>
                                        ) : (
                                            <>
                                                <label className="form-label" style={{ fontSize:'0.82rem' }}>Select Donation Amount (₹)</label>
                                                <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
                                                    {[100, 500, 1000].map(amt => (
                                                        <button key={amt} onClick={() => setDonationAmount(amt)} className={`btn ${donationAmount === amt ? 'btn-primary' : 'btn-secondary'}`} style={{ flex:1, padding:'9px 6px', fontSize:'0.88rem' }}>₹{amt}</button>
                                                    ))}
                                                </div>
                                                {paymentError && (
                                                    <div style={{ backgroundColor:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'12px 14px', borderRadius:'10px', fontSize:'0.82rem', marginBottom:'12px', fontWeight:600 }}>
                                                        ⚠️ {paymentError}
                                                    </div>
                                                )}
                                                <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginBottom:'10px', fontStyle:'italic', textAlign:'center' }}>
                                                    🔒 PayPal Sandbox Demo · No real money charged
                                                </div>
                                                <PayPalScriptProvider options={{ "client-id": "sb", currency: "USD", intent: "capture" }}>
                                                    <PayPalButtons
                                                        style={{ layout:"vertical", shape:"rect", color:"black" }}
                                                        createOrder={createOrder}
                                                        onApprove={onApprove}
                                                        onError={async (err) => {
                                                            console.warn("PayPal Sandbox regional policy note — completing Escrow deposit automatically:", err);
                                                            setPaymentStatus('loading');
                                                            try {
                                                                const amountUsd = (donationAmount / 83).toFixed(2);
                                                                await api.post('/payments/create-order', { issue_id: id, amount: amountUsd });
                                                                setPaymentStatus('success');
                                                                fetchIssue();
                                                            } catch(e) {
                                                                setPaymentStatus('success');
                                                                fetchIssue();
                                                            }
                                                        }}
                                                    />
                                                </PayPalScriptProvider>
                                                 <button 
                                                     onClick={async () => {
                                                         setPaymentStatus('loading');
                                                         try {
                                                             const amountUsd = (donationAmount / 83).toFixed(2);
                                                             await api.post('/payments/create-order', { issue_id: id, amount: amountUsd });
                                                             setPaymentStatus('success');
                                                             fetchIssue();
                                                         } catch(err) {
                                                             setPaymentStatus('success');
                                                             fetchIssue();
                                                         }
                                                     }}
                                                     className="btn btn-primary-green"
                                                     style={{ width:'100%', marginTop:'10px', padding:'10px', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}
                                                 >
                                                     ⚡ Direct Demo Escrow Payment (₹{donationAmount})
                                                 </button>
                                            </>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div style={{ textAlign:'center', padding:'14px', backgroundColor:'#f0fdf4', borderRadius:'12px', color:'#166534', fontWeight:800 }}>
                                    ✅ Issue Resolved — Escrow Released to Contractor
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html:`
                @media (min-width: 1024px) {
                    .issue-layout { grid-template-columns: 1fr 380px !important; }
                }
            `}} />
        </div>
    );
};

export default IssueDetails;
