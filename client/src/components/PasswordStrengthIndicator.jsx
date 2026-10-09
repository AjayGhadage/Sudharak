import React from 'react';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export const getPasswordMetrics = (password) => {
    const rules = [
        { id: 'length', label: 'At least 8 characters', valid: password.length >= 8 },
        { id: 'uppercase', label: 'Upper case letter (A-Z)', valid: /[A-Z]/.test(password) },
        { id: 'lowercase', label: 'Lower case letter (a-z)', valid: /[a-z]/.test(password) },
        { id: 'number', label: 'At least 1 number (0-9)', valid: /[0-9]/.test(password) },
        { id: 'special', label: 'Special symbol (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const passedCount = rules.filter(r => r.valid).length;
    let label = 'Weak';
    let color = '#ef4444'; // Red
    let percent = 20;

    if (passedCount === 0) {
        label = 'Too Weak';
        color = '#dc2626';
        percent = 5;
    } else if (passedCount <= 2) {
        label = 'Weak';
        color = '#f97316';
        percent = 35;
    } else if (passedCount <= 4) {
        label = 'Moderate';
        color = '#eab308';
        percent = 70;
    } else if (passedCount === 5) {
        label = 'Strong & Secure';
        color = '#22c55e';
        percent = 100;
    }

    const isAllValid = passedCount === 5;

    return { rules, passedCount, label, color, percent, isAllValid };
};

const PasswordStrengthIndicator = ({ password, showChecklist = true }) => {
    if (!password) return null;

    const { rules, label, color, percent, isAllValid } = getPasswordMetrics(password);

    return (
        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
            {/* Strength Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-mutated)', fontWeight: 500 }}>
                    Password Strength:
                </span>
                <span style={{ fontSize: '0.8rem', color: color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isAllValid ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {label}
                </span>
            </div>
            
            <div style={{
                height: '6px',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: showChecklist ? '12px' : '0'
            }}>
                <div style={{
                    height: '100%',
                    width: `${percent}%`,
                    backgroundColor: color,
                    borderRadius: '999px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
            </div>

            {/* Checklist */}
            {showChecklist && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.76rem'
                }}>
                    {rules.map(rule => (
                        <div key={rule.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: rule.valid ? '#166534' : 'var(--color-text-mutated)',
                            fontWeight: rule.valid ? 600 : 400,
                            transition: 'color 0.2s'
                        }}>
                            <div style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: rule.valid ? '#22c55e' : 'rgba(0,0,0,0.08)',
                                color: rule.valid ? '#fff' : '#a1a1aa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {rule.valid ? <Check size={10} strokeWidth={3} /> : <X size={9} />}
                            </div>
                            <span>{rule.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;
