import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Professional Logo Component for Sudharak
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} showTagline - Whether to show 'BHARAT CIVIC ACTION' subtitle
 * @param {string} variant - 'light' | 'dark' | 'auto'
 * @param {string} layout - 'horizontal' | 'vertical' | 'icon-only'
 * @param {boolean} clickable - Wrap in Link to '/'
 */
const Logo = ({
    size = 'md',
    showTagline = true,
    variant = 'auto',
    layout = 'horizontal',
    clickable = true,
    className = ''
}) => {
    // Size scaling metrics
    const sizes = {
        sm: { icon: 28, title: '1.05rem', tagline: '0.55rem', gap: '8px' },
        md: { icon: 36, title: '1.25rem', tagline: '0.62rem', gap: '10px' },
        lg: { icon: 44, title: '1.5rem', tagline: '0.68rem', gap: '12px' },
        xl: { icon: 56, title: '2.0rem', tagline: '0.78rem', gap: '14px' }
    };

    const currentSize = sizes[size] || sizes.md;

    // Color choices based on variant
    const isDark = variant === 'dark';

    const titleColor = isDark ? '#ffffff' : 'var(--logo-text-color, #0f172a)';
    const taglineBg = isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 101, 52, 0.08)';
    const taglineColor = isDark ? '#4ade80' : '#15803d';
    const taglineBorder = isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(22, 101, 52, 0.2)';

    const logoContent = (
        <div 
            className={`sudharak-logo-wrapper ${className}`}
            style={{
                display: 'inline-flex',
                flexDirection: layout === 'vertical' ? 'column' : 'row',
                alignItems: 'center',
                gap: currentSize.gap,
                textDecoration: 'none',
                userSelect: 'none'
            }}
        >
            {/* Logo Emblem Icon */}
            <div 
                style={{
                    position: 'relative',
                    width: `${currentSize.icon}px`,
                    height: `${currentSize.icon}px`,
                    borderRadius: size === 'sm' ? '8px' : '12px',
                    padding: '2px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    boxShadow: isDark 
                        ? '0 0 20px rgba(16, 185, 129, 0.35), 0 4px 10px rgba(0,0,0,0.3)' 
                        : '0 4px 14px rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
                    overflow: 'hidden'
                }}
                className="logo-icon-badge"
            >
                <img 
                    src="/images/sudharak_logo.png" 
                    alt="Sudharak Logo"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: size === 'sm' ? '6px' : '10px',
                    }}
                    onError={(e) => {
                        // Fallback SVG graphic if image load fails
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 7V12C3 17.5228 7.02944 22.0963 12 23C16.9706 22.0963 21 17.5228 21 12V7L12 2Z" fill="#15803D" stroke="#4ADE80" stroke-width="1.5"/>
                                <path d="M9 12L11 14L15 9.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        `;
                    }}
                />
            </div>

            {/* Brand Typography */}
            {layout !== 'icon-only' && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: layout === 'vertical' ? 'center' : 'flex-start',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        fontSize: currentSize.title,
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        color: titleColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>SUDHARAK</span>
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#22c55e',
                            display: 'inline-block',
                            marginLeft: '2px',
                            boxShadow: '0 0 8px #22c55e'
                        }} />
                    </div>

                    {showTagline && (
                        <span style={{
                            fontSize: currentSize.tagline,
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono, monospace)',
                            letterSpacing: '1px',
                            color: taglineColor,
                            backgroundColor: taglineBg,
                            border: `1px solid ${taglineBorder}`,
                            padding: '1px 7px',
                            borderRadius: '100px',
                            marginTop: '3px',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.4,
                            textTransform: 'uppercase'
                        }}>
                            BHARAT CIVIC ACTION
                        </span>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .sudharak-logo-wrapper:hover .logo-icon-badge {
                    transform: scale(1.06) rotate(-2deg);
                }
            `}} />
        </div>
    );

    if (clickable) {
        return (
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                {logoContent}
            </Link>
        );
    }

    return logoContent;
};

export default Logo;
