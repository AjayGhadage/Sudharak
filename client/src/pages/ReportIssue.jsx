import React, { useState, useRef, useEffect } from 'react';
import {
    UploadCloud, CheckCircle, AlertTriangle, Cpu, ArrowRight, Camera,
    MapPin, Sparkles, AlertCircle, RotateCcw, ThumbsUp, Info, Eye,
    ShieldCheck, Edit3, XCircle, IndianRupee, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const SeverityBadge = ({ severity }) => {
    const sev = severity || 'HIGH';
    const map = {
        LOW: { color: '#166534', bg: '#dcfce7' },
        MEDIUM: { color: '#0369a1', bg: '#e0f2fe' },
        HIGH: { color: '#b45309', bg: '#fef3c7' },
        CRITICAL: { color: '#dc2626', bg: '#fee2e2' },
    };
    const style = map[sev] || map['HIGH'];
    return (
        <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:'6px', backgroundColor:style.bg, color:style.color, fontWeight:800, fontSize:'0.75rem', fontFamily:'var(--font-mono)', letterSpacing:'0.5px' }}>
            {sev} PRIORITY
        </span>
    );
};

const VerificationBadge = ({ level }) => {
    const map = {
        AI_VERIFIED: { icon: '🟡', label: 'AI Verified', color: '#b45309', bg: '#fef3c7' },
        COMMUNITY_VERIFIED: { icon: '🔵', label: 'Community Verified', color: '#0369a1', bg: '#e0f2fe' },
        OFFICIALLY_VERIFIED: { icon: '🟢', label: 'Officially Verified', color: '#166534', bg: '#dcfce7' },
    };
    const b = map[level] || map['AI_VERIFIED'];
    return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', borderRadius:'6px', backgroundColor:b.bg, color:b.color, fontWeight:800, fontSize:'0.75rem', fontFamily:'var(--font-mono)' }}>
            {b.icon} {b.label}
        </span>
    );
};

const ReportIssue = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState('idle');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('POTHOLE');
    const [errorMsg, setErrorMsg] = useState('');
    const [cameraError, setCameraError] = useState('');
    const [showAiExplanation, setShowAiExplanation] = useState(false);

    const [issueTitle, setIssueTitle] = useState('');
    const [location, setLocation] = useState('Fetching automatic location...');
    const [coords, setCoords] = useState({ lat: 18.5204, lng: 73.8567 });
    const [locationLabel, setLocationLabel] = useState('');

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const roadOrArea = data.address.highway || data.address.road || data.address.suburb || data.address.neighbourhood || 'Local Area';
                    const city = data.address.city || data.address.town || data.address.state || 'Pune';
                    const pincode = data.address.postcode || '';
                    setLocation(`${roadOrArea}, ${city}${pincode ? ` - ${pincode}` : ''}`);
                    // Store a public-friendly label (no exact GPS)
                    setLocationLabel(`${data.address.suburb || roadOrArea}, ${city}`);
                } catch (e) {
                    setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
                    setLocationLabel('Pune, Maharashtra');
                }
            }, () => {
                setLocation('Pune Central Ward #14, Maharashtra');
                setLocationLabel('Pune, Maharashtra');
            });
        }
    }, []);

    useEffect(() => {
        return () => { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()); };
    }, [cameraStream]);

    const startLiveCamera = async () => {
        setCameraError('');
        setErrorMsg('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
            setCameraStream(stream);
            setIsCameraActive(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
        } catch (err) {
            const msg = err.name === 'NotAllowedError'
                ? 'Camera access was denied. Please allow camera permissions in your browser settings.'
                : 'Camera hardware is unavailable on this device.';
            setCameraError(msg);
        }
    };

    const stopCamera = () => {
        if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
        setIsCameraActive(false);
    };

    const captureCameraPhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Geotag watermark — shows public-friendly area name, not exact coords
        const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' });
        ctx.fillStyle = 'rgba(5, 46, 22, 0.78)';
        ctx.fillRect(0, canvas.height - 52, canvas.width, 52);
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`📍 ${locationLabel || 'Pune, MH'} | 🕒 ${now}`, 14, canvas.height - 30);
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`🛡️ SUDHARAK AI VERIFIED GEOTAGGED REPORT`, 14, canvas.height - 12);

        canvas.toBlob((blob) => {
            if (blob) {
                const f = new File([blob], `pothole_geotagged_${Date.now()}.png`, { type: 'image/png' });
                setFile(f);
                setPreviewUrl(canvas.toDataURL('image/png'));
                stopCamera();
                setStatus('idle');
                setAnalysisResult(null);
            }
        }, 'image/png');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSizeMB = 5;
        if (!allowedTypes.includes(selectedFile.type)) {
            setErrorMsg('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
            return;
        }
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setErrorMsg(`Image is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
            return;
        }
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setStatus('idle');
        setAnalysisResult(null);
        setErrorMsg('');
    };

    const handleSampleSelect = (imageUrl, slug) => {
        setPreviewUrl(imageUrl);
        setErrorMsg('');
        fetch(imageUrl)
            .then(r => r.blob())
            .then(blob => {
                setFile(new File([blob], `${slug}_sample_${Date.now()}.png`, { type: 'image/png' }));
                setStatus('idle'); setAnalysisResult(null);
            })
            .catch(() => setFile(new File(['sample'], `${slug}_sample.png`, { type: 'image/png' })));
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setStatus('analyzing');
        setErrorMsg('');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/issues/analyze', formData, true);
            if (response.success && response.data) {
                const data = response.data;
                setAnalysisResult(data);
                const categoryRaw = data.analysis?.category || data.detection?.category || 'POTHOLE';
                setSelectedCategory(categoryRaw);
                const sev = data.analysis?.severity || 'HIGH';
                setIssueTitle(`${sev} priority ${categoryRaw.replace(/_/g, ' ').toLowerCase()} reported at ${locationLabel}`);
                setStatus('success');
            } else {
                throw new Error(response.message || 'AI analysis failed');
            }
        } catch (error) {
            setStatus('error');
            setErrorMsg(error.message || 'Failed to analyze image. Please try again.');
        }
    };

    const handleReopenExisting = async (issueId) => {
        setStatus('submitting');
        try {
            const res = await api.post(`/issues/${issueId}/reopen`, {});
            if (res.success) navigate(`/issues/${issueId}`);
        } catch (e) {
            setTimeout(() => navigate(`/issues/${issueId}`), 800);
        }
    };

    const handleUpvoteExisting = async (issueId) => {
        try { await api.post(`/issues/${issueId}/upvote`, {}); } finally { navigate(`/issues/${issueId}`); }
    };

    const handleSubmit = async () => {
        if (!analysisResult) return;
        setStatus('submitting');
        const exp = analysisResult.aiExplanation || {};
        try {
            const response = await api.post('/issues', {
                title: issueTitle,
                description: analysisResult.analysis?.description || '',
                ai_description: analysisResult.analysis?.description || '',
                category: selectedCategory,
                severity: analysisResult.analysis?.severity || 'HIGH',
                confidence: analysisResult.analysis?.confidence || 0.91,
                image_url: analysisResult.imageUrl || previewUrl,
                estimated_cost: exp.costInr ? exp.costInr / 83 : analysisResult.analysis?.estimatedCost || 150,
                priority_score: analysisResult.analysis?.priorityScore || 80,
                location: location,
                lat: coords.lat,
                lng: coords.lng
            });
            if (response.success) navigate(`/issues/${response.data.id}`);
        } catch (error) {
            setStatus('success');
            setErrorMsg(error.message || 'Failed to submit report.');
        }
    };

    const dup = analysisResult?.duplicateCheck;
    const exp = analysisResult?.aiExplanation;
    const confPct = Math.round((analysisResult?.analysis?.confidence || analysisResult?.detection?.confidence || 0.91) * 100);

    return (
        <div className="sudharak-page" style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '32px 0 60px' }}>
            <div className="container" style={{ maxWidth: '860px' }}>

                {/* Page Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 14px', background:'rgba(21,128,61,0.1)', border:'1px solid rgba(21,128,61,0.2)', borderRadius:'999px', fontSize:'0.82rem', color:'#166534', fontWeight:700, marginBottom:'14px' }}>
                        <Sparkles size={14} /> AI-POWERED GEOTAGGED CIVIC REPORTING 🇮🇳
                    </div>
                    <h1 style={{ fontSize:'2.4rem', fontWeight:900, color:'#0f172a', margin:'0 0 8px 0' }}>Report a Civic Issue</h1>
                    <p style={{ color:'#64748b', fontSize:'1rem', margin:0 }}>
                        Snap a geotagged photo or upload an image. AI diagnostics provide transparent severity & indicative repair cost estimates.
                    </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div style={{ backgroundColor:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', color:'#dc2626', padding:'14px 18px', borderRadius:'12px', marginBottom:'20px', display:'flex', alignItems:'flex-start', gap:'10px' }}>
                        <XCircle size={20} style={{ flexShrink:0, marginTop:'2px' }} />
                        <div>
                            <strong>Could not analyze image.</strong><br />
                            {errorMsg}
                        </div>
                    </div>
                )}

                {/* Camera Error with fallback action */}
                {cameraError && !isCameraActive && (
                    <div style={{ backgroundColor:'#fff7ed', border:'1px solid #fed7aa', color:'#c2410c', padding:'16px', borderRadius:'12px', marginBottom:'16px' }}>
                        <div style={{ fontWeight:800, marginBottom:'8px' }}>📷 Camera Access Disabled</div>
                        <p style={{ margin:'0 0 12px 0', fontSize:'0.9rem' }}>{cameraError}</p>
                        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                            <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary" style={{ padding:'9px 16px', fontSize:'0.85rem' }}>
                                <UploadCloud size={15} /> Upload from Gallery Instead
                            </button>
                            <a href="https://support.google.com/chrome/answer/2693767" target="_blank" rel="noreferrer" style={{ padding:'9px 16px', fontSize:'0.85rem', borderRadius:'8px', border:'1px solid #fed7aa', color:'#c2410c', textDecoration:'none', fontWeight:700 }}>
                                How to Enable Camera →
                            </a>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display:'none' }} />
                    </div>
                )}

                {/* Main Input Card */}
                <div className="anim-scale-in card" style={{ padding:'28px', marginBottom:'24px', backgroundColor:'#ffffff', borderRadius:'20px', boxShadow:'0 8px 24px rgba(0,0,0,0.06)' }}>

                    {isCameraActive ? (
                        <div style={{ position:'relative', borderRadius:'16px', overflow:'hidden', backgroundColor:'#000' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width:'100%', maxHeight:'400px', objectFit:'cover', display:'block' }} />
                            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                                <div style={{ width:'170px', height:'170px', border:'2.5px dashed #4ade80', borderRadius:'12px', boxShadow:'0 0 0 9999px rgba(0,0,0,0.48)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <div style={{ color:'#4ade80', fontSize:'0.8rem', fontWeight:800, textAlign:'center' }}>ALIGN ISSUE<br/>HERE</div>
                                </div>
                            </div>
                            <div style={{ position:'absolute', bottom:'18px', left:0, right:0, display:'flex', justifyContent:'center', gap:'14px', zIndex:10 }}>
                                <button onClick={stopCamera} style={{ background:'rgba(255,255,255,0.22)', border:'none', color:'#fff', padding:'10px 20px', borderRadius:'999px', fontWeight:700, cursor:'pointer' }}>Cancel</button>
                                <button onClick={captureCameraPhoto} className="btn btn-primary" style={{ padding:'11px 26px', borderRadius:'999px', background:'linear-gradient(135deg,#166534,#22c55e)', display:'flex', alignItems:'center', gap:'8px' }}>
                                    <Camera size={18} /> Snap Geotagged Photo
                                </button>
                            </div>
                            <canvas ref={canvasRef} style={{ display:'none' }} />
                        </div>
                    ) : !previewUrl ? (
                        <div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px' }}>
                                <button onClick={startLiveCamera} style={{ padding:'22px 14px', borderRadius:'16px', border:'2px solid #22c55e', backgroundColor:'rgba(34,197,94,0.06)', color:'#14532d', cursor:'pointer', textAlign:'center' }}>
                                    <div style={{ width:'46px', height:'46px', borderRadius:'50%', backgroundColor:'#22c55e', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}><Camera size={22} /></div>
                                    <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:'3px' }}>📷 Open Live Camera</div>
                                    <div style={{ fontSize:'0.78rem', color:'#15803d' }}>Auto-geotag: area name + timestamp</div>
                                </button>
                                <div onClick={() => fileInputRef.current?.click()} style={{ padding:'22px 14px', borderRadius:'16px', border:'2px dashed #cbd5e1', backgroundColor:'#f8fafc', color:'#475569', cursor:'pointer', textAlign:'center' }}>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} />
                                    <div style={{ width:'46px', height:'46px', borderRadius:'50%', backgroundColor:'#cbd5e1', color:'#334155', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}><UploadCloud size={22} /></div>
                                    <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:'3px' }}>📁 Choose Image File</div>
                                    <div style={{ fontSize:'0.78rem', color:'#64748b' }}>JPG/PNG/WEBP · Max 5 MB</div>
                                </div>
                            </div>

                            {/* Sample Demo Photos */}
                            <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:'16px' }}>
                                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#64748b', marginBottom:'10px' }}>🧪 Test with sample civic issue photos:</div>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
                                    {[
                                        { name:'Pothole', img:'/images/indian_pothole_fallback.png', slug:'pothole' },
                                        { name:'Garbage Dump', img:'/images/indian_market_community.png', slug:'garbage' },
                                        { name:'Water Leak', img:'/images/indian_gov_repair.png', slug:'water_leak' },
                                        { name:'Road Repair', img:'/images/indian_citizens_reporting.png', slug:'repair' },
                                    ].map((s, i) => (
                                        <button key={i} onClick={() => handleSampleSelect(s.img, s.slug)} style={{ borderRadius:'10px', overflow:'hidden', border:'1px solid #e2e8f0', padding:0, cursor:'pointer', background:'#fff', textAlign:'left' }}>
                                            <img src={s.img} alt={s.name} style={{ width:'100%', height:'66px', objectFit:'cover', display:'block' }} />
                                            <div style={{ padding:'5px 7px', fontSize:'0.72rem', fontWeight:700, color:'#334155', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ position:'relative', borderRadius:'14px', overflow:'hidden', marginBottom:'20px', backgroundColor:'#0f172a' }}>
                                <img src={previewUrl} alt="Preview" style={{ width:'100%', maxHeight:'400px', objectFit:'contain', display:'block' }} />
                                {status === 'idle' && (
                                    <button onClick={() => { setFile(null); setPreviewUrl(null); setAnalysisResult(null); setErrorMsg(''); }} style={{ position:'absolute', top:'14px', right:'14px', backgroundColor:'rgba(0,0,0,0.7)', color:'white', border:'none', padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}>
                                        ✕ Change Photo
                                    </button>
                                )}
                            </div>
                            {status === 'idle' && (
                                <button onClick={handleAnalyze} className="btn btn-primary" style={{ width:'100%', padding:'15px', fontSize:'1.05rem', fontWeight:800, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                                    <Cpu size={20} /> Analyze with YOLO & Groq AI
                                </button>
                            )}
                            {status === 'analyzing' && (
                                <div style={{ textAlign:'center', padding:'36px 0' }}>
                                    <Cpu size={44} color="#166534" style={{ animation:'pulse 1.8s infinite', marginBottom:'14px' }} />
                                    <h3 style={{ color:'#0f172a', margin:'0 0 6px 0' }}>AI Analyzing Civic Issue...</h3>
                                    <p style={{ color:'#64748b', fontSize:'0.9rem' }}>Running YOLO object detection → Groq severity assessment</p>
                                    <div style={{ width:'280px', height:'5px', backgroundColor:'#e2e8f0', borderRadius:'3px', margin:'20px auto', overflow:'hidden' }}>
                                        <div style={{ height:'100%', backgroundColor:'#166534', animation:'slideRight 1.8s infinite linear' }}></div>
                                    </div>
                                </div>
                            )}
                            {status === 'error' && (
                                <button onClick={() => { setStatus('idle'); setErrorMsg(''); }} className="btn btn-secondary" style={{ width:'100%', padding:'13px', borderRadius:'12px', fontWeight:700 }}>
                                    Retry Analysis
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Assessment Results */}
                {status === 'success' && analysisResult && (
                    <div style={{ animation:'fadeIn 0.5s ease' }}>

                        {/* Duplicate / Recurrence Banner */}
                        {dup?.isDuplicate && (
                            <div style={{ backgroundColor: dup.status === 'RESOLVED' ? '#fff7ed' : '#eff6ff', border:`2px solid ${dup.status === 'RESOLVED' ? '#f97316' : '#3b82f6'}`, borderRadius:'16px', padding:'20px', marginBottom:'20px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'10px', color: dup.status === 'RESOLVED' ? '#c2410c' : '#1d4ed8', fontWeight:800, fontSize:'1.02rem', marginBottom:'6px' }}>
                                    {dup.status === 'RESOLVED' ? <RotateCcw size={20} /> : <AlertCircle size={20} />}
                                    {dup.status === 'RESOLVED' ? '⚠️ Possible Recurring Issue Detected' : 'ℹ️ Active Issue Already Logged Nearby'}
                                </div>
                                <p style={{ color:'#334155', fontSize:'0.9rem', marginBottom:'14px' }}>
                                    {dup.message} (Issue #{dup.issueId}: <strong>{dup.title}</strong>)
                                </p>
                                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                                    {dup.status === 'RESOLVED' ? (
                                        <button onClick={() => handleReopenExisting(dup.issueId)} style={{ padding:'9px 16px', backgroundColor:'#ea580c', color:'#fff', border:'none', borderRadius:'10px', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.86rem' }}>
                                            <RotateCcw size={15} /> Re-Open & Flag Recurrence
                                        </button>
                                    ) : (
                                        <button onClick={() => handleUpvoteExisting(dup.issueId)} style={{ padding:'9px 16px', backgroundColor:'#2563eb', color:'#fff', border:'none', borderRadius:'10px', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.86rem' }}>
                                            <ThumbsUp size={15} /> Upvote Active Issue (+5 Karma)
                                        </button>
                                    )}
                                    <button onClick={() => setAnalysisResult({ ...analysisResult, duplicateCheck: null })} style={{ padding:'9px 14px', backgroundColor:'#f1f5f9', color:'#475569', border:'1px solid #cbd5e1', borderRadius:'10px', fontWeight:700, cursor:'pointer', fontSize:'0.84rem' }}>
                                        Proceed as Separate Report
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* AI Detection Header */}
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                            <CheckCircle color="#166534" size={22} />
                            <h2 style={{ fontSize:'1.35rem', fontWeight:800, color:'#0f172a', margin:0 }}>AI Assessment Complete</h2>
                            <VerificationBadge level="AI_VERIFIED" />
                        </div>

                        <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:'28px', backgroundColor:'#ffffff', borderRadius:'20px', border:'1px solid #e2e8f0', boxShadow:'0 8px 24px rgba(0,0,0,0.06)' }}>

                            {/* Gradient Header */}
                            <div style={{ background:'linear-gradient(135deg,#052e16 0%,#166534 100%)', color:'white', padding:'22px 26px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'14px' }}>
                                <div>
                                    <div style={{ fontSize:'0.72rem', opacity:0.7, letterSpacing:'1px', marginBottom:'3px', fontWeight:800 }}>AI DETECTED CATEGORY</div>
                                    <h2 style={{ fontSize:'1.9rem', color:'white', margin:'0 0 4px 0', fontWeight:900 }}>{selectedCategory.replace(/_/g,' ')}</h2>
                                    <SeverityBadge severity={analysisResult.analysis?.severity} />
                                </div>
                                <div style={{ textAlign:'right' }}>
                                    <div style={{ fontSize:'2.4rem', fontWeight:900, lineHeight:1, color:'#4ade80' }}>{confPct}%</div>
                                    <div style={{ fontSize:'0.75rem', opacity:0.8 }}>Detection Confidence</div>
                                    <div style={{ fontSize:'0.72rem', opacity:0.55, marginTop:'2px' }}>YOLO v8 + Groq AI</div>
                                </div>
                            </div>

                            {/* AI Transparency Explain Box */}
                            {exp && (
                                <div style={{ borderBottom:'1px solid #f1f5f9' }}>
                                    <button
                                        onClick={() => setShowAiExplanation(!showAiExplanation)}
                                        style={{ width:'100%', textAlign:'left', padding:'14px 26px', background:'rgba(21,128,61,0.04)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#166534', fontWeight:800, fontSize:'0.88rem' }}
                                    >
                                        <span style={{ display:'flex', alignItems:'center', gap:'7px' }}><Eye size={16} /> Why did AI classify this?  View Transparent Reasoning</span>
                                        <span>{showAiExplanation ? '▲ Hide' : '▼ Show'}</span>
                                    </button>
                                    {showAiExplanation && (
                                        <div style={{ padding:'18px 26px', backgroundColor:'#f0fdf4', borderTop:'1px solid #bbf7d0' }}>
                                            <div style={{ display:'grid', gap:'12px' }}>
                                                <div>
                                                    <div style={{ fontSize:'0.78rem', fontWeight:800, color:'#166534', marginBottom:'3px' }}>🎯 DETECTION CONFIDENCE</div>
                                                    <div style={{ fontSize:'0.89rem', color:'#334155' }}>
                                                        {exp.detectionConfidence} confidence score across YOLO object bounding boxes, combined with Groq multi-modal reasoning. Values above 80% are considered reliable.
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize:'0.78rem', fontWeight:800, color:'#c2410c', marginBottom:'3px' }}>⚠️ SEVERITY CLASSIFICATION REASON</div>
                                                    <div style={{ fontSize:'0.89rem', color:'#334155' }}>{exp.severityReason}</div>
                                                </div>
                                                <div style={{ backgroundColor:'#fffbeb', border:'1px solid #fde68a', padding:'12px 14px', borderRadius:'10px' }}>
                                                    <div style={{ fontSize:'0.78rem', fontWeight:800, color:'#92400e', marginBottom:'4px' }}>💡 AI CAN MAKE MISTAKES</div>
                                                    <div style={{ fontSize:'0.84rem', color:'#78350f' }}>
                                                        AI classification is a tool to assist reporting — not a final verdict. Use the category dropdown below to correct any misclassification before submitting.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ padding:'26px' }}>
                                {/* Metrics Grid */}
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'18px', marginBottom:'22px' }}>
                                    <div>
                                        <div style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:'5px', fontWeight:600 }}>Severity Level</div>
                                        <SeverityBadge severity={analysisResult.analysis?.severity} />
                                    </div>
                                    <div>
                                        <div style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:'5px', fontWeight:600, display:'flex', alignItems:'center', gap:'5px' }}>
                                            Indicative Cost Range
                                            <HelpCircle size={13} color="#94a3b8" title="Estimate only — subject to PMC inspection" />
                                        </div>
                                        <div style={{ fontSize:'1.3rem', fontWeight:900, color:'#0f172a' }}>
                                            ₹{(exp?.costMinInr || 14900).toLocaleString('en-IN')}–₹{(exp?.costMaxInr || 22000).toLocaleString('en-IN')}
                                        </div>
                                        <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'2px', fontStyle:'italic' }}>Indicative AI estimate. Actual cost subject to PMC Ward Engineer assessment.</div>
                                    </div>
                                    <div>
                                        <div style={{ color:'#64748b', fontSize:'0.82rem', marginBottom:'5px', fontWeight:600 }}>Priority Score</div>
                                        <div style={{ fontSize:'1.3rem', fontWeight:900, color:'#0f172a' }}>{analysisResult.analysis?.priorityScore || 92}/100</div>
                                    </div>
                                </div>

                                <hr style={{ border:'none', borderTop:'1px solid #e2e8f0', margin:'20px 0' }} />

                                {/* Escrow Transparency */}
                                <div style={{ backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'14px 18px', marginBottom:'20px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'7px', fontWeight:800, color:'#166534', marginBottom:'6px', fontSize:'0.88rem' }}>
                                        <ShieldCheck size={16} /> Municipal Escrow Vault — Funding Transparency
                                    </div>
                                    <div style={{ fontSize:'0.82rem', color:'#334155', lineHeight: 1.6 }}>
                                        All community donations are <strong>held in escrow</strong> until the designated Municipal Partner or Verified NGO uploads repair proof.
                                        Funds are only released upon verified citizen confirmation of repair completion.
                                        <strong> Donations cannot be claimed without official repair evidence.</strong>
                                    </div>
                                    <div style={{ marginTop:'8px', fontSize:'0.78rem', color:'#64748b' }}>
                                        Beneficiary: <strong>PMC Municipal Infrastructure Dept / NGO Partner</strong> · Escrow Status: <span style={{ color:'#b45309', fontWeight:700 }}>LOCKED (Pending Repair)</span>
                                    </div>
                                </div>

                                {/* Editable Category Selector */}
                                <div className="form-group" style={{ marginBottom:'14px' }}>
                                    <label className="form-label" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                        <span style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                            <Edit3 size={14} color="#166534" /> Issue Category / श्रेणी
                                        </span>
                                        <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>AI might be wrong — correct if needed</span>
                                    </label>
                                    <select className="form-input" style={{ fontWeight:700 }} value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setIssueTitle(`${analysisResult.analysis?.severity || 'HIGH'} priority ${e.target.value.replace(/_/g,' ').toLowerCase()} reported at ${locationLabel}`); }}>
                                        <option value="POTHOLE">🛣️ Pothole / Road Damage</option>
                                        <option value="GARBAGE">🗑️ Garbage Overflow / Dumping</option>
                                        <option value="WATER_LEAK">💧 Water Pipe Leakage</option>
                                        <option value="STREET_LIGHT">💡 Street Light / Electrical</option>
                                        <option value="INFRASTRUCTURE">🚧 Structural / Infrastructure</option>
                                        <option value="OPEN_MANHOLE">🕳️ Open Manhole</option>
                                        <option value="SEWAGE">🚿 Sewage Overflow</option>
                                        <option value="OTHER">📝 Other Civic Issue</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom:'14px' }}>
                                    <label className="form-label">Report Title</label>
                                    <input type="text" className="form-input" value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} />
                                </div>

                                <div className="form-group" style={{ marginBottom:'14px' }}>
                                    <label className="form-label" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                        <MapPin size={14} color="#166534" /> Public Location Label
                                        <span style={{ fontSize:'0.72rem', color:'#94a3b8', fontWeight:500 }}>(Exact GPS is stored privately—only area name shown publicly)</span>
                                    </label>
                                    <input type="text" className="form-input" value={locationLabel || location} onChange={(e) => setLocationLabel(e.target.value)} placeholder="e.g. Kharadi, Pune" />
                                </div>

                                <div className="form-group" style={{ marginBottom:'18px' }}>
                                    <label className="form-label">AI Diagnostic Summary</label>
                                    <textarea className="form-input" rows="3" readOnly style={{ backgroundColor:'#f8fafc', color:'#334155', resize:'none' }} value={analysisResult.analysis?.description || 'Civic infrastructure defect detected.'} />
                                </div>

                                <button onClick={handleSubmit} className="btn btn-primary" style={{ width:'100%', padding:'15px', fontSize:'1.05rem', fontWeight:800, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                                    Confirm & Submit to Municipal Portal <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'submitting' && (
                    <div style={{ textAlign:'center', padding:'40px 0' }}>
                        <div style={{ fontSize:'2rem', marginBottom:'12px' }}>📤</div>
                        <h3 style={{ color:'#0f172a' }}>Submitting to Municipal Portal...</h3>
                        <p style={{ color:'#64748b' }}>Your report is being logged into the civic action system.</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html:`
                @keyframes pulse { 0%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
                @keyframes slideRight { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
            `}} />
        </div>
    );
};

export default ReportIssue;
