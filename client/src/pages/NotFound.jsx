import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div style={{
            minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'var(--color-cream)', padding: '60px 24px', textAlign: 'center'
        }}>
            <div style={{ maxWidth: '480px' }}>
                <div style={{
                    fontSize: '6rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
                    lineHeight: 1, color: 'var(--color-earth)', marginBottom: '16px',
                    letterSpacing: '-2px'
                }}>
                    404
                </div>
                
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🚧</div>

                <h1 style={{ fontSize: '1.8rem', marginBottom: '12px', WebkitTextFillColor: 'unset', color: 'var(--color-deep)', background: 'none' }}>
                    यह रास्ता बंद है! (Page Not Found)
                </h1>

                <p style={{ color: 'var(--color-text-body)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '32px' }}>
                    The page you are looking for has been moved, repaired, or does not exist. Let's get you back on track!
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/" className="btn btn-primary">
                        <Home size={16} /> Home Page पर जाएं
                    </Link>
                    <Link to="/community" className="btn btn-secondary">
                        <MapPin size={16} /> View Issues Feed
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
