/**
 * Escalation Service
 * Auto-escalates CRITICAL/HIGH issues not resolved within 48 hours
 * Uses Groq LLM to draft a professional complaint email to authorities
 */
import Groq from 'groq-sdk';
import { config } from '../config/env.js';
import { IssueModel } from '../models/issue.model.js';

const groq = new Groq({ apiKey: config.groqApiKey || 'mock-key' });

const ESCALATION_THRESHOLD_HOURS = 48;

const generateEscalationEmail = async (issue) => {
    if (!config.groqApiKey || config.groqApiKey.includes('mock')) {
        return `Dear Municipal Authority,\n\nThis is an automated escalation notice from the Sudharak platform.\n\nA ${issue.severity} priority civic issue has remained unresolved for over ${ESCALATION_THRESHOLD_HOURS} hours.\n\nIssue: ${issue.title}\nLocation: ${issue.location}\nCategory: ${issue.category}\nAI Estimated Cost: $${issue.funding_goal}\nCommunity Upvotes: ${issue.upvotes}\n\nImmediate action is requested.\n\n— Sudharak AI System`;
    }

    const prompt = `
You are an AI system representing a civic issue reporting platform called Sudharak.
Draft a short, professional, firm but polite escalation email to municipal authorities about an unresolved civic issue.

Issue Details:
- Title: ${issue.title}
- Category: ${issue.category}
- Severity: ${issue.severity}
- Location: ${issue.location}
- AI Estimated Repair Cost: $${issue.funding_goal}
- Hours Since Reported: ${ESCALATION_THRESHOLD_HOURS}+
- Community Upvotes: ${issue.upvotes}

Write only the email body (no subject line). Keep it under 150 words. Professional tone.
`;

    const res = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3,
    });
    return res.choices[0]?.message?.content?.trim();
};

export const checkAndEscalateIssues = async () => {
    try {
        const issues = IssueModel.findAll();
        const now = new Date();
        const escalated = [];

        for (const issue of issues) {
            if (issue.status === 'RESOLVED' || issue.escalated) continue;
            if (issue.severity !== 'CRITICAL' && issue.severity !== 'HIGH') continue;

            const reportedAt = new Date(issue.created_at);
            const hoursSince = (now - reportedAt) / (1000 * 60 * 60);

            if (hoursSince >= ESCALATION_THRESHOLD_HOURS) {
                const emailDraft = await generateEscalationEmail(issue);
                
                // Mark as escalated in DB
                IssueModel.update(issue.id, { escalated: true, escalated_at: now.toISOString() });

                escalated.push({
                    issueId: issue.id,
                    title: issue.title,
                    severity: issue.severity,
                    emailDraft,
                    hoursSince: Math.round(hoursSince)
                });

                console.log(`🚨 [ESCALATION] Issue #${issue.id} "${issue.title}" escalated after ${Math.round(hoursSince)}h`);
            }
        }

        return escalated;
    } catch (err) {
        console.error('Escalation check error:', err);
        return [];
    }
};

export const startEscalationCron = () => {
    const INTERVAL_MS = 60 * 60 * 1000; // every hour
    console.log('🕐 Escalation cron started — checks every 1 hour');
    checkAndEscalateIssues(); // run immediately on start
    setInterval(checkAndEscalateIssues, INTERVAL_MS);
};
